from datetime import datetime, timedelta
from flask import current_app
from app import db
from models.reservations import Reservation
from models.port import Port
from models.station import Station
from utils.distance import haversine_distance
from services.qr_service import generate_qr_token
import uuid


# ---------------------------------------------------------------------------
# Expiry management
# ---------------------------------------------------------------------------

def expire_stale_reservations() -> int:
    """
    Scan for ACTIVE reservations past their expiry time, mark them EXPIRED,
    and release their ports back to AVAILABLE.

    Returns the number of reservations expired.
    Should be called at the start of any endpoint that reads port status.
    """
    now = datetime.utcnow()
    stale: list[Reservation] = Reservation.query.filter(
        Reservation.status == 'ACTIVE',
        Reservation.expires_at < now,
    ).all()

    for res in stale:
        res.status = 'EXPIRED'
        port = res.port
        # Only release the port if it is still in RESERVED state
        # (ESP32 may have already changed it to OCCUPIED)
        if port and port.status == 'RESERVED':
            port.status = 'AVAILABLE'
            port.last_updated = now

    if stale:
        db.session.commit()

    return len(stale)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_reservation(
    user_id: int,
    port_id: int,
    user_lat: float,
    user_lng: float
) -> tuple[Reservation | None, str | None]:
    """
    Validate constraints and create a new reservation.

    Returns:
        (Reservation, None) on success
        (None, error_message) on failure
    """
    # Keep port statuses fresh before checking
    expire_stale_reservations()

    station: Station | None = Station.query.filter_by(is_voltreserve=True).first()
    if not station:
        return None, 'VoltReserve station not found'

    # --- Distance check ---
    radius_km: float = current_app.config.get('RESERVATION_RADIUS_KM', 2.0)
    distance = haversine_distance(user_lat, user_lng, station.latitude, station.longitude)
    if distance > radius_km:
        return None, (
            f'You must be within {radius_km} km of the station to reserve a port. '
            f'You are currently {distance:.1f} km away.'
        )

    # --- Prevent double-booking ---
    existing: Reservation | None = Reservation.query.filter_by(
        user_id=user_id, status='ACTIVE'
    ).first()
    if existing:
        return None, (
            'You already have an active reservation '
            f'(Port {existing.port.port_number}, booking #{existing.booking_id[:8]}…). '
            'Please cancel it before making a new one.'
        )

    # --- Port availability ---
    port: Port | None = Port.query.filter_by(
        id=port_id, station_id=station.id
    ).first()
    if not port:
        return None, 'Port not found'
    if port.status != 'AVAILABLE':
        status_label = port.status.capitalize()
        return None, (
            f'Port {port.port_number} is currently {status_label}. '
            'Please select another available port.'
        )

    # --- Create reservation ---
    now = datetime.utcnow()
    timeout_minutes: int = current_app.config.get('RESERVATION_TIMEOUT_MINUTES', 30)
    booking_id = str(uuid.uuid4())
    qr_token = generate_qr_token(booking_id)

    reservation = Reservation(
        booking_id=booking_id,
        user_id=user_id,
        station_id=station.id,
        port_id=port_id,
        created_at=now,
        expires_at=now + timedelta(minutes=timeout_minutes),
        status='ACTIVE',
        qr_token=qr_token,
    )

    # Mark the port as RESERVED immediately
    port.status = 'RESERVED'
    port.last_updated = now

    db.session.add(reservation)
    db.session.commit()

    return reservation, None


# ---------------------------------------------------------------------------
# Cancel
# ---------------------------------------------------------------------------

def cancel_reservation(
    reservation_id: int,
    user_id: int,
    is_admin: bool = False
) -> tuple[bool, str | None]:
    """
    Cancel an ACTIVE reservation and release its port.

    Returns:
        (True, None) on success
        (False, error_message) on failure
    """
    reservation: Reservation | None = Reservation.query.get(reservation_id)
    if not reservation:
        return False, 'Reservation not found'

    if not is_admin and reservation.user_id != user_id:
        return False, "You don't have permission to cancel this reservation"

    if reservation.status != 'ACTIVE':
        return False, f"Cannot cancel a reservation with status '{reservation.status}'"

    # Release the port
    port = reservation.port
    if port and port.status == 'RESERVED':
        port.status = 'AVAILABLE'
        port.last_updated = datetime.utcnow()

    reservation.status = 'CANCELLED'
    db.session.commit()

    return True, None
