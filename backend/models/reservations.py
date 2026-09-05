from app import db
from datetime import datetime
import uuid


class Reservation(db.Model):
    """
    Booking record linking a user to a specific port for a time window.
    Reservations expire after RESERVATION_TIMEOUT_MINUTES (default 30).
    """

    __tablename__ = 'reservations'

    id = db.Column(db.Integer, primary_key=True)

    # Public-facing unique identifier (used in QR, URLs)
    booking_id = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
        index=True
    )

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)
    port_id = db.Column(db.Integer, db.ForeignKey('ports.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)

    status = db.Column(
        db.Enum('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED', name='reservation_status'),
        default='ACTIVE',
        nullable=False,
        index=True
    )

    # Secure token stored in QR code (SHA-256 of booking_id + server secret)
    qr_token = db.Column(db.String(64), unique=True, nullable=True)

    # ------------------------------------------------------------------
    # Business logic helpers
    # ------------------------------------------------------------------

    def is_expired(self) -> bool:
        """True if the reservation's time window has passed."""
        return datetime.utcnow() > self.expires_at and self.status == 'ACTIVE'

    def time_remaining_seconds(self) -> float:
        """Seconds until expiry. Returns 0 when expired or not active."""
        if self.status != 'ACTIVE':
            return 0.0
        remaining = (self.expires_at - datetime.utcnow()).total_seconds()
        return max(0.0, remaining)

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self, include_user: bool = False) -> dict:
        data = {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'station_id': self.station_id,
            'port_id': self.port_id,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'status': self.status,
            'time_remaining_seconds': self.time_remaining_seconds(),
            # Convenience fields via backref
            'port_number': self.port.port_number if self.port else None,
            'station_name': self.station.name if self.station else None,
        }
        if include_user and self.user:
            data['user_name'] = self.user.name
            data['user_email'] = self.user.email
        return data

    def __repr__(self) -> str:
        return f'<Reservation {self.booking_id} [{self.status}]>'
