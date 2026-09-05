from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from config import config

# Initialize extensions (outside factory so models can import db)
db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name: str | None = None) -> Flask:
    """Application factory."""

    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # -----------------------------------------------------------------------
    # Extensions
    # -----------------------------------------------------------------------
    db.init_app(app)
    jwt.init_app(app)

    # Allow requests from the Vite dev server (port 5173) and production build
    CORS(app, resources={
        r'/api/*': {
            'origins': [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:3000',
            ],
            'supports_credentials': True,
        }
    })

    # -----------------------------------------------------------------------
    # Models + Blueprints
    # -----------------------------------------------------------------------
    with app.app_context():
        # Import models to register them with SQLAlchemy
        from models.user import User          # noqa: F401
        from models.station import Station    # noqa: F401
        from models.port import Port          # noqa: F401
        from models.reservations import Reservation  # noqa: F401 (file: reservations.py)
        from models.notification import Notification  # noqa: F401

        # Import and register blueprints
        from routes.auth import auth_bp
        from routes.stations import stations_bp
        from routes.reservations import reservations_bp
        from routes.qr import qr_bp
        from routes.device import device_bp
        from routes.admin import admin_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(stations_bp, url_prefix='/api/stations')
        app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
        app.register_blueprint(qr_bp, url_prefix='/api/qr')
        app.register_blueprint(device_bp, url_prefix='/api/device')
        app.register_blueprint(admin_bp, url_prefix='/api/admin')

        # Create tables
        db.create_all()

        # Seed default VoltReserve station + 3 ports if none exist
        _seed_station(app, Station, Port)

    # -----------------------------------------------------------------------
    # Error handlers
    # -----------------------------------------------------------------------

    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok', 'service': 'VoltReserve API'}, 200

    return app


def _seed_station(app: Flask, Station, Port) -> None:
    """Create the VoltReserve station and 3 ports if the DB is empty."""
    if Station.query.first():
        return  # Already seeded

    station = Station(
        name=app.config['STATION_NAME'],
        latitude=app.config['STATION_LAT'],
        longitude=app.config['STATION_LNG'],
        address='1 Rajpath, New Delhi, Delhi 110001',
        is_voltreserve=True,
    )
    db.session.add(station)
    db.session.flush()  # Get the station.id before committing

    for i in range(1, 4):
        port = Port(
            port_number=i,
            station_id=station.id,
            status='AVAILABLE',
        )
        db.session.add(port)

    db.session.commit()
    app.logger.info('VoltReserve station seeded with 3 ports')


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)