import re
from typing import Any


# ---------------------------------------------------------------------------
# Field presence
# ---------------------------------------------------------------------------

def validate_required_fields(data: dict, fields: list[str]) -> tuple[bool, list[str]]:
    """
    Ensure all *fields* are present and non-empty in *data*.

    Returns:
        (all_present: bool, missing_field_names: list)
    """
    missing = [
        f for f in fields
        if f not in data
        or data[f] is None
        or str(data[f]).strip() == ''
    ]
    return len(missing) == 0, missing


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(
    r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
)


def validate_email(email: str) -> bool:
    """Return True when *email* matches a basic RFC-5322-ish pattern."""
    return bool(_EMAIL_RE.match(email.strip()))


# ---------------------------------------------------------------------------
# Password strength
# ---------------------------------------------------------------------------

def validate_password(password: str) -> tuple[bool, str | None]:
    """
    Enforce minimum password requirements.

    Returns:
        (is_valid: bool, error_message: str | None)
    """
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Za-z]', password):
        return False, 'Password must contain at least one letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    return True, None


# ---------------------------------------------------------------------------
# Coordinates
# ---------------------------------------------------------------------------

def validate_coordinates(lat: Any, lng: Any) -> tuple[bool, str | None]:
    """
    Validate that *lat* and *lng* represent valid geographic coordinates.

    Returns:
        (is_valid: bool, error_message: str | None)
    """
    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return False, 'Latitude and longitude must be numeric values'

    if not (-90.0 <= lat <= 90.0):
        return False, f'Latitude {lat} is out of range [-90, 90]'
    if not (-180.0 <= lng <= 180.0):
        return False, f'Longitude {lng} is out of range [-180, 180]'

    return True, None
