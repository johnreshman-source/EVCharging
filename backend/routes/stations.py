from flask import Blueprint, request, jsonify, current_app
from models.station import Station
from services.openchargemap import get_nearby_stations
from services.reservation_service import expire_stale_reservations
from utils.distance import haversine_distance, format_distance
from utils.validation import validate_coordinates

stations_bp = Blueprint('stations', __name__)


@stations_bp.route('', methods=['GET'])
def get_stations():
    """
    GET /api/stations
    Query params: lat, lng (optional — for distance calc and OCM results)

    Returns the VoltReserve station (always) plus nearby public stations
    from OpenChargeMap (when coordinates are supplied).
    """
    expire_stale_reservations()

    lat_str = request.args.get('lat')
    lng_str = request.args.get('lng')
    user_coords: tuple[float, float] | None = None

    if lat_str and lng_str:
        is_valid, err = validate_coordinates(lat_str, lng_str)
        if is_valid:
            user_coords = (float(lat_str), float(lng_str))

    # --- VoltReserve station ---
    vr_station = Station.query.filter_by(is_voltreserve=True).first()
    vr_dict = None
    if vr_station:
        vr_dict = vr_station.to_dict(include_ports=True)
        if user_coords:
            d = haversine_distance(*user_coords, vr_station.latitude, vr_station.longitude)
            vr_dict['distance_km'] = round(d, 2)
            vr_dict['distance_formatted'] = format_distance(d)

    # --- Public stations via OpenChargeMap ---
    public_stations: list[dict] = []
    if user_coords:
        try:
            radius = current_app.config.get('RESERVATION_RADIUS_KM', 2) * 5  # search wider
            raw = get_nearby_stations(*user_coords, radius_km=radius, max_results=15)
            for s in raw:
                if s and s.get('latitude') and s.get('longitude'):
                    d = haversine_distance(*user_coords, s['latitude'], s['longitude'])
                    s['distance_km'] = round(d, 2)
                    s['distance_formatted'] = format_distance(d)
            public_stations = [s for s in raw if s]
        except Exception as exc:
            current_app.logger.error('Error fetching public stations: %s', exc)

    return jsonify({
        'voltreserve_station': vr_dict,
        'public_stations': public_stations,
        'total': (1 if vr_dict else 0) + len(public_stations),
    }), 200


@stations_bp.route('/<int:station_id>', methods=['GET'])
def get_station(station_id: int):
    """GET /api/stations/<id> — single station with port details."""
    expire_stale_reservations()
    station = Station.query.get_or_404(station_id)
    return jsonify({'station': station.to_dict(include_ports=True)}), 200
