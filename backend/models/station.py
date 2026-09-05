from app import db
from datetime import datetime


class Station(db.Model):
    """EV charging station model. Only one VoltReserve station exists."""

    __tablename__ = 'stations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(500), nullable=True)
    is_voltreserve = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    ports = db.relationship(
        'Port', backref='station', lazy=True,
        cascade='all, delete-orphan',
        order_by='Port.port_number'
    )
    reservations = db.relationship('Reservation', backref='station', lazy='dynamic')

    # ------------------------------------------------------------------
    # Computed properties
    # ------------------------------------------------------------------

    @property
    def available_port_count(self) -> int:
        return sum(1 for p in self.ports if p.status == 'AVAILABLE')

    @property
    def total_port_count(self) -> int:
        return len(self.ports)

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self, include_ports: bool = False) -> dict:
        data = {
            'id': self.id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'is_voltreserve': self.is_voltreserve,
            'created_at': self.created_at.isoformat(),
        }
        if include_ports:
            data['ports'] = [port.to_dict() for port in self.ports]
            data['available_ports'] = self.available_port_count
            data['total_ports'] = self.total_port_count
        return data

    def __repr__(self) -> str:
        return f'<Station {self.name}>'
