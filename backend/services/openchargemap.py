import requests
import logging
from flask import current_app

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_nearby_stations(
    latitude: float,
    longitude: float,
    radius_km: float = 5,
    max_results: int = 20
) -> list[dict]:
    """
    Fetch nearby public EV charging stations from the OpenChargeMap API.

    Returns a list of normalised station dicts, or an empty list on failure.
    NOTE: OpenChargeMap does NOT provide real-time charger availability;
    the 'status_type' field reflects last-known operational state only.
    """
    api_key = current_app.config.get('OPENCHARGEMAP_API_KEY', '').strip()
    api_url = current_app.config.get(
        'OPENCHARGEMAP_API_URL', 'https://api.openchargemap.io/v3'
    )

    if not api_key:
        logger.warning(
            'OpenChargeMap API key not configured — public stations unavailable'
        )
        return []

    params = {
        'output': 'json',
        'latitude': latitude,
        'longitude': longitude,
        'distance': radius_km,
        'distanceunit': 'km',
        'maxresults': max_results,
        'compact': True,
        'verbose': False,
        'key': api_key,
    }

    try:
        response = requests.get(
            f'{api_url}/poi',
            params=params,
            timeout=10
        )
        response.raise_for_status()
        raw_list = response.json()
        stations = [_normalise(s) for s in raw_list if s]
        return [s for s in stations if s is not None]

    except requests.exceptions.Timeout:
        logger.error('OpenChargeMap request timed out')
    except requests.exceptions.HTTPError as exc:
        status = getattr(exc.response, 'status_code', None)
        if status == 429:
            logger.warning('OpenChargeMap rate limit exceeded')
        else:
            logger.error('OpenChargeMap HTTP error: %s', exc)
    except Exception as exc:
        logger.error('Unexpected error fetching OpenChargeMap data: %s', exc)

    return []


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _normalise(raw: dict) -> dict | None:
    """Convert a raw OCM station object into VoltReserve's standard format."""
    try:
        addr = raw.get('AddressInfo') or {}
        connections = raw.get('Connections') or []

        connector_types: list[str] = []
        max_power_kw = 0.0
        for conn in connections:
            ct = (conn.get('ConnectionType') or {}).get('Title')
            if ct and ct not in connector_types:
                connector_types.append(ct)
            kw = conn.get('PowerKW')
            if kw and kw > max_power_kw:
                max_power_kw = float(kw)

        return {
            'id': f"ocm_{raw.get('ID', '')}",
            'source': 'openchargemap',
            'name': addr.get('Title') or 'EV Charging Station',
            'latitude': addr.get('Latitude'),
            'longitude': addr.get('Longitude'),
            'address': _format_address(addr),
            'connector_types': connector_types,
            'power_kw': max_power_kw,
            'num_points': raw.get('NumberOfPoints') or len(connections),
            # Real-time availability NOT available via OCM — this is last-known state
            'status_type': _get_status_label(raw),
            'is_voltreserve': False,
        }
    except Exception as exc:
        logger.error('Error normalising OCM station: %s', exc)
        return None


def _format_address(addr: dict) -> str:
    parts = [
        addr.get('AddressLine1'),
        addr.get('Town'),
        addr.get('StateOrProvince'),
        addr.get('Postcode'),
        (addr.get('Country') or {}).get('Title'),
    ]
    cleaned = [str(p).strip() for p in parts if p and str(p).strip()]
    return ', '.join(cleaned) if cleaned else 'Address unavailable'


def _get_status_label(raw: dict) -> str:
    status = raw.get('StatusType')
    if not status:
        return 'Unknown'
    operational = status.get('IsOperational')
    if operational is True:
        return 'Operational'
    if operational is False:
        return 'Not Operational'
    return status.get('Title') or 'Unknown'
