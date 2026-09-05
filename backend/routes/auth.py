from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app import db
from models.user import User
from utils.validation import validate_email, validate_password, validate_required_fields

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """POST /api/auth/register — create a new user account."""
    data = request.get_json(silent=True) or {}

    is_valid, missing = validate_required_fields(data, ['name', 'email', 'password'])
    if not is_valid:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    name = data['name'].strip()
    email = data['email'].strip().lower()
    password = data['password']

    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Please enter a valid email address'}), 400

    is_valid_pw, pw_error = validate_password(password)
    if not is_valid_pw:
        return jsonify({'error': pw_error}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    user = User(name=name, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'Account created successfully',
        'access_token': access_token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """POST /api/auth/login — authenticate and return a JWT."""
    data = request.get_json(silent=True) or {}

    is_valid, _ = validate_required_fields(data, ['email', 'password'])
    if not is_valid:
        return jsonify({'error': 'Email and password are required'}), 400

    email = data['email'].strip().lower()
    password = data['password']

    user: User | None = User.query.filter_by(email=email).first()

    # Always check password (even if user is None) to prevent timing attacks
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """GET /api/auth/me — return the currently authenticated user."""
    user_id = get_jwt_identity()
    user: User | None = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict(include_stats=True)}), 200
