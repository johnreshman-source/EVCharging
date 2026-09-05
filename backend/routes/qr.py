from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.reservations import Reservation
from services.qr_service import generate_qr_image, verify_qr_token
from services.reservation_service import expire_stale_reservations
import json

qr_bp = Blueprint('qr', __name__)


@qr_bp.route('/generate/<booking_id>', methods=['GET'])
@jwt_required()
def generate_qr(booking_id: str):
    """
    GET /api/qr/generate/<booking_id>
    Generate and return a base64 QR code image for an active reservation.
    Only the reservation owner can request their own QR.
    """
    expire_stale_reservations()
    user_id = get_jwt_identity()

    reservation = Reservation.query.filter_by(booking_id=booking_id).first()
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404

    if reservation.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    if reservation.status != 'ACTIVE':
        return jsonify({
            'error': f'QR code is only available for active reservations. '
                     f'This reservation is {reservation.status.lower()}.'
        }), 400

    qr_image_b64 = generate_qr_image(booking_id, reservation.qr_token)

    return jsonify({
        'qr_image': f'data:image/png;base64,{qr_image_b64}',
        'booking_id': booking_id,
        'reservation': reservation.to_dict(),
    }), 200


@qr_bp.route('/verify', methods=['POST'])
def verify_qr():
    """
    POST /api/qr/verify
    Verify a scanned QR code payload. Called by a station scanner or admin.
    No user auth required — uses the QR token for verification.

    Body: { "bid": "<booking_id>", "tok": "<qr_token>", "app": "VoltReserve" }
    OR:   { "booking_id": "<booking_id>", "qr_token": "<token>" }
    """
    expire_stale_reservations()
    data = request.get_json(silent=True) or {}

    # Accept both raw QR JSON payload and explicit fields
    booking_id: str = data.get('bid') or data.get('booking_id', '')
    qr_token: str = data.get('tok') or data.get('qr_token', '')

    if not booking_id or not qr_token:
        return jsonify({
            'valid': False,
            'error': 'booking_id and token are required',
        }), 400

    reservation = Reservation.query.filter_by(booking_id=booking_id).first()
    if not reservation:
        return jsonify({'valid': False, 'error': 'Reservation not found'}), 404

    if not verify_qr_token(booking_id, qr_token):
        return jsonify({'valid': False, 'error': 'Invalid or tampered QR code'}), 401

    status_map = {
        'EXPIRED':   ('Reservation has expired', False),
        'CANCELLED': ('Reservation was cancelled', False),
        'COMPLETED': ('Reservation is already completed', False),
    }
    if reservation.status in status_map:
        msg, valid = status_map[reservation.status]
        return jsonify({
            'valid': valid,
            'error': msg,
            'status': reservation.status,
        }), 200

    if reservation.status == 'ACTIVE':
        return jsonify({
            'valid': True,
            'message': 'Reservation verified ✓',
            'reservation': reservation.to_dict(),
        }), 200

    return jsonify({'valid': False, 'error': 'Unknown reservation state'}), 400
