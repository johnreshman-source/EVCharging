from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.reservations import Reservation
from services.reservation_service import (
    create_reservation,
    cancel_reservation,
    expire_stale_reservations,
)

reservations_bp = Blueprint('reservations', __name__)


@reservations_bp.route('', methods=['GET'])
@jwt_required()
def get_reservations():
    """GET /api/reservations — list all reservations for the current user."""
    expire_stale_reservations()
    user_id = get_jwt_identity()

    reservations = (
        Reservation.query
        .filter_by(user_id=user_id)
        .order_by(Reservation.created_at.desc())
        .all()
    )

    return jsonify({
        'reservations': [r.to_dict() for r in reservations],
        'total': len(reservations),
    }), 200


@reservations_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active():
    """GET /api/reservations/active — return the user's current active reservation."""
    expire_stale_reservations()
    user_id = get_jwt_identity()

    reservation = Reservation.query.filter_by(
        user_id=user_id, status='ACTIVE'
    ).first()

    return jsonify({'reservation': reservation.to_dict() if reservation else None}), 200


@reservations_bp.route('', methods=['POST'])
@jwt_required()
def create():
    """
    POST /api/reservations — create a new reservation.
    Body: { port_id, latitude, longitude }
    """
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    port_id = data.get('port_id')
    user_lat = data.get('latitude')
    user_lng = data.get('longitude')

    if not port_id:
        return jsonify({'error': 'port_id is required'}), 400
    if user_lat is None or user_lng is None:
        return jsonify({
            'error': 'latitude and longitude are required to verify your proximity to the station'
        }), 400

    try:
        user_lat = float(user_lat)
        user_lng = float(user_lng)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid coordinate values'}), 400

    reservation, error = create_reservation(user_id, int(port_id), user_lat, user_lng)

    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Reservation created successfully',
        'reservation': reservation.to_dict(),
    }), 201


@reservations_bp.route('/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def cancel(reservation_id: int):
    """DELETE /api/reservations/<id> — cancel an active reservation."""
    user_id = get_jwt_identity()
    success, error = cancel_reservation(reservation_id, user_id)

    if not success:
        return jsonify({'error': error}), 400

    return jsonify({'message': 'Reservation cancelled successfully'}), 200
