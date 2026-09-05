from app import db
from datetime import datetime


class Port(db.Model):
    """
    Individual charging port within a station.
    Each VoltReserve station has exactly 3 ports.
    """

    __tablename__ = 'ports'

    id = db.Column(db.Integer, primary_key=True)
    port_number = db.Column(db.Integer, nullable=False)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)

    # Port status controlled by reservation system and ESP32
    status = db.Column(
        db.Enum('AVAILABLE', 'RESERVED', 'OCCUPIED', name='port_status'),
        default='AVAILABLE',
        nullable=False,
        index=True
    )

    # ESP32 / IoT sensor data
    sensor_value = db.Column(db.Float, nullable=True)      # Raw ADC / current reading
    last_updated = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    esp32_updated_at = db.Column(db.DateTime, nullable=True)  # Last time ESP32 pushed data

    # Unique constraint: each port_number is unique within a station
    __table_args__ = (
        db.UniqueConstraint('port_number', 'station_id', name='uk_port_station'),
    )

    # Relationships
    reservations = db.relationship('Reservation', backref='port', lazy='dynamic')

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self, include_sensor: bool = False) -> dict:
        data = {
            'id': self.id,
            'port_number': self.port_number,
            'station_id': self.station_id,
            'status': self.status,
            'last_updated': (
                self.last_updated.isoformat() if self.last_updated else None
            ),
        }
        if include_sensor:
            data['sensor_value'] = self.sensor_value
            data['esp32_updated_at'] = (
                self.esp32_updated_at.isoformat()
                if self.esp32_updated_at else None
            )
        return data

    def __repr__(self) -> str:
        return f'<Port {self.port_number} [{self.status}]>'
