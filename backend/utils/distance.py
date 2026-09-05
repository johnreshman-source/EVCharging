import math


# ---------------------------------------------------------------------------
# Core formula
# ---------------------------------------------------------------------------

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance in **kilometres** between two
    geographic coordinates using the Haversine formula.

    Args:
        lat1, lon1: Origin coordinates (degrees)
        lat2, lon2: Destination coordinates (degrees)

    Returns:
        Distance in kilometres (float)
    """
    R = 6371.0  # Earth's mean radius in km

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# ---------------------------------------------------------------------------
# Convenience helpers
# ---------------------------------------------------------------------------

def is_within_radius(
    user_lat: float, user_lng: float,
    station_lat: float, station_lng: float,
    radius_km: float
) -> tuple[bool, float]:
    """
    Check whether a user is within *radius_km* of a station.

    Returns:
        (within_radius: bool, distance_km: float)
    """
    distance = haversine_distance(user_lat, user_lng, station_lat, station_lng)
    return distance <= radius_km, round(distance, 3)


def format_distance(km: float) -> str:
    """Return a human-readable distance string."""
    if km < 1.0:
        return f"{int(km * 1000)} m"
    return f"{km:.1f} km"
