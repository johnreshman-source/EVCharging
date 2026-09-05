from app import db
from datetime import datetime


class Notification(db.Model):
    """
    In-app notification for users.
    Reserved for future use — e.g. reservation expiry alerts.
    """

    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'),
        nullable=False, index=True
    )
    message = db.Column(db.Text, nullable=False)
    # info | success | warning | error
    type = db.Column(db.String(50), default='info', nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f'<Notification {self.id} for user {self.user_id}>'
