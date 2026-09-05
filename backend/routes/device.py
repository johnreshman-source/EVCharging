import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app import db
from models.station import Station
from models.port import Port

device_bp = Blueprint('device', __name__)

# Separate API key for IoT devices — not the same as user JWT
_DEVICE_API_KEY = os.getenv('DEVICE_API_KEY', 'voltreserve-device-key-change-me')


def _verify_device_key() -> bool:
    """Accept the device key from either header or query param."""
    key = (
        request.headers.get('X-Device-Key')
        or request.args.get('key')
        or (request.get_json(silent=True) or {}).get('device_key')
    )
    return key == _DEVICE_API_KEY


# ---------------------------------------------------------------------------
# Public read — no auth (UI polls this to show live port status)
# ---------------------------------------------------------------------------

@device_bp.route('/status', methods=['GET'])
def get_device_status():
    """
    GET /api/device/status
    Returns current port statuses and ESP32 online/offline state.
    No authentication required — used by the frontend for live updates.
    """
    station = Station.query.filter_by(is_voltreserve=True).first()
    if not station:
        return jsonify({'error': 'Station not found'}), 404

    ports = Port.query.filter_by(station_id=station.id).order_by(Port.port_number).all()
    timeout: int = current_app.config.get('ESP32_TIMEOUT_SECONDS', 60)

    # ESP32 is considered online if any port received sensor data within the timeout window
    esp32_online = False
    last_update: datetime | None = None
    for port in ports:
        if port.esp32_updated_at:
            age = (datetime.utcnow() - port.esp32_updated_at).total_seconds()
            if age <= timeout:
                esp32_online = True
            if last_update is None or port.esp32_updated_at > last_update:
                last_update = port.esp32_updated_at

    return jsonify({
        'station': station.to_dict(),
        'ports': [p.to_dict(include_sensor=True) for p in ports],
        'esp32': {
            'online': esp32_online,
            'last_update': last_update.isoformat() if last_update else None,
            'timeout_seconds': timeout,
        },
        'demo_mode': not esp32_online,
    }), 200


# ---------------------------------------------------------------------------
# ESP32 push — device key required
# ---------------------------------------------------------------------------

@device_bp.route('/status', methods=['POST'])
def update_device_status():
    """
    POST /api/device/status
    ESP32 sends sensor readings and occupancy flags.

    Expected body:
    {
        "device_key": "...",   (or X-Device-Key header)
        "ports": [
            {"port_number": 1, "sensor": 0.12, "occupied": false},
            {"port_number": 2, "sensor": 4.85, "occupied": true},
            {"port_number": 3, "sensor": 0.08, "occupied": false}
        ]
    }
    """
    if not _verify_device_key():
        return jsonify({'error': 'Invalid device key'}), 401

    data = request.get_json(silent=True) or {}
    port_updates = data.get('ports', [])
    if not isinstance(port_updates, list) or not port_updates:
        return jsonify({'error': 'Expected {"ports": [...]}'}), 400

    station = Station.query.filter_by(is_voltreserve=True).first()
    if not station:
        return jsonify({'error': 'Station not found'}), 404

    now = datetime.utcnow()
    updated: list[int] = []

    for pu in port_updates:
        pnum = pu.get('port_number')
        sensor = pu.get('sensor')
        occupied: bool = bool(pu.get('occupied', False))

        port = Port.query.filter_by(
            station_id=station.id, port_number=pnum
        ).first()
        if not port:
            continue

        port.sensor_value = sensor
        port.esp32_updated_at = now
        port.last_updated = now

        # ESP32 controls AVAILABLE ↔ OCCUPIED transitions only.
        # If the port is RESERVED (user has booked it), we don't touch the status —
        # the reservation system handles the RESERVED → AVAILABLE flow on expiry.
        if port.status in ('AVAILABLE', 'OCCUPIED'):
            port.status = 'OCCUPIED' if occupied else 'AVAILABLE'

        updated.append(pnum)

    db.session.commit()

    return jsonify({
        'message': 'Port statuses updated',
        'updated_ports': updated,
        'timestamp': now.isoformat(),
    }), 200


@device_bp.route('/heartbeat', methods=['POST'])
def heartbeat():
    """
    POST /api/device/heartbeat
    ESP32 periodic keepalive — updates esp32_updated_at without changing port status.
    """
    if not _verify_device_key():
        return jsonify({'error': 'Invalid device key'}), 401

    station = Station.query.filter_by(is_voltreserve=True).first()
    if station:
        now = datetime.utcnow()
        for port in station.ports:
            port.esp32_updated_at = now
        db.session.commit()

    return jsonify({
        'message': 'Heartbeat received',
        'timestamp': datetime.utcnow().isoformat(),
    }), 200
