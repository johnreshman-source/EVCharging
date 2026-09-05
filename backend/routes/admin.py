from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from app import db
from models.user import User
from models.station import Station
from models.port import Port
from models.reservations import Reservation
from utils.auth import require_admin
from services.reservation_service import expire_stale_reservations, cancel_reservation

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@require_admin
def dashboard():
    """GET /api/admin/dashboard — full system overview for admin IoT panel."""
    expire_stale_reservations()

    station = Station.query.filter_by(is_voltreserve=True).first()
    if not station:
        return jsonify({'error': 'Station not found'}), 404

    ports = Port.query.filter_by(station_id=station.id).order_by(Port.port_number).all()

    # ESP32 status
    timeout: int = current_app.config.get('ESP32_TIMEOUT_SECONDS', 60)
    esp32_online = False
    last_esp32_update = None
    for port in ports:
        if port.esp32_updated_at:
            age = (datetime.utcnow() - port.esp32_updated_at).total_seconds()
            if age <= timeout:
                esp32_online = True
            if last_esp32_update is None or port.esp32_updated_at > last_esp32_update:
                last_esp32_update = port.esp32_updated_at

    # Reservations
    active_reservations = (
        Reservation.query.filter_by(status='ACTIVE')
        .order_by(Reservation.created_at.desc()).all()
    )
    since = datetime.utcnow() - timedelta(hours=24)
    recent_reservations = (
        Reservation.query
        .filter(Reservation.created_at >= since)
        .order_by(Reservation.created_at.desc())
        .limit(50).all()
    )

    # Stats
    stats = {
        'total_users': User.query.count(),
        'total_reservations': Reservation.query.count(),
        'active_reservations': len(active_reservations),
        'expired_reservations': Reservation.query.filter_by(status='EXPIRED').count(),
        'cancelled_reservations': Reservation.query.filter_by(status='CANCELLED').count(),
    }

    return jsonify({
        'station': station.to_dict(include_ports=True),
        'ports': [p.to_dict(include_sensor=True) for p in ports],
        'esp32': {
            'online': esp32_online,
            'last_update': last_esp32_update.isoformat() if last_esp32_update else None,
        },
        'demo_mode': not esp32_online,
        'active_reservations': [r.to_dict(include_user=True) for r in active_reservations],
        'recent_reservations': [r.to_dict(include_user=True) for r in recent_reservations],
        'stats': stats,
    }), 200


@admin_bp.route('/reservations', methods=['GET'])
@require_admin
def get_all_reservations():
    """GET /api/admin/reservations — all reservations with optional status filter."""
    expire_stale_reservations()
    status_filter = request.args.get('status', '').upper() or None
    query = Reservation.query.order_by(Reservation.created_at.desc())
    if status_filter:
        query = query.filter_by(status=status_filter)
    reservations = query.limit(200).all()
    return jsonify({
        'reservations': [r.to_dict(include_user=True) for r in reservations],
        'total': len(reservations),
    }), 200


@admin_bp.route('/ports/<int:port_id>/status', methods=['POST'])
@require_admin
def set_port_status(port_id: int):
    """POST /api/admin/ports/<id>/status — manually override a port status."""
    data = request.get_json(silent=True) or {}
    new_status = data.get('status', '').upper()

    if new_status not in ('AVAILABLE', 'RESERVED', 'OCCUPIED'):
        return jsonify({
            'error': "status must be one of: AVAILABLE, RESERVED, OCCUPIED"
        }), 400

    port = Port.query.get_or_404(port_id)
    port.status = new_status
    port.last_updated = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Port {port.port_number} set to {new_status}',
        'port': port.to_dict(include_sensor=True),
    }), 200


@admin_bp.route('/reservations/<int:reservation_id>/cancel', methods=['POST'])
@require_admin
def admin_cancel_reservation(reservation_id: int):
    """POST /api/admin/reservations/<id>/cancel — admin force-cancel."""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    success, error = cancel_reservation(reservation_id, user_id, is_admin=True)
    if not success:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'Reservation cancelled by admin'}), 200


@admin_bp.route('/demo/cycle', methods=['POST'])
@require_admin
def demo_cycle():
    """
    POST /api/admin/demo/cycle — rotate port statuses for live demo purposes.
    Cycles through AVAILABLE / RESERVED / OCCUPIED across the 3 ports.
    """
    station = Station.query.filter_by(is_voltreserve=True).first()
    if not station:
        return jsonify({'error': 'Station not found'}), 404

    ports = Port.query.filter_by(
        station_id=station.id
    ).order_by(Port.port_number).all()

    cycle = ['AVAILABLE', 'RESERVED', 'OCCUPIED']
    for i, port in enumerate(ports):
        port.status = cycle[i % len(cycle)]
        port.last_updated = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'message': 'Demo statuses applied',
        'ports': [p.to_dict() for p in ports],
    }), 200
