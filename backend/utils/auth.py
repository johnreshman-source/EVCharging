from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


def _get_user():
    """Internal helper — load User by JWT identity without circular import at module level."""
    from models.user import User
    user_id = get_jwt_identity()
    return User.query.get(user_id)


def require_auth(f):
    """
    Route decorator that requires a valid JWT access token.
    Injects nothing — use get_jwt_identity() inside the route if needed.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user = _get_user()
            if not user:
                return jsonify({'error': 'User account not found'}), 401
        except Exception:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """
    Route decorator that requires a valid JWT token with admin privileges.
    Returns 403 for authenticated non-admin users.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user = _get_user()
            if not user:
                return jsonify({'error': 'User account not found'}), 401
            if not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
        except Exception:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        return f(*args, **kwargs)
    return decorated


def get_current_user():
    """
    Return the currently authenticated User object, or None.
    Safe to call inside a route that already verified JWT.
    """
    try:
        return _get_user()
    except Exception:
        return None
