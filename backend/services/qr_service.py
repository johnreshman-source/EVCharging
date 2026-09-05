import qrcode
import qrcode.constants
import io
import base64
import hashlib
import json
import os


# ---------------------------------------------------------------------------
# Token generation / verification
# ---------------------------------------------------------------------------

def generate_qr_token(booking_id: str) -> str:
    """
    Derive a secure, non-guessable 32-char token from a booking ID.
    The server secret ensures tokens cannot be forged client-side.
    """
    secret = os.getenv('JWT_SECRET_KEY', 'dev-secret-change-in-production')
    raw = f'{booking_id}:{secret}:voltreserve'
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()[:32]


def verify_qr_token(booking_id: str, token: str) -> bool:
    """Return True when *token* matches the expected value for *booking_id*."""
    expected = generate_qr_token(booking_id)
    # Constant-time comparison to avoid timing attacks
    return hashlib.compare_digest(expected, token)


# ---------------------------------------------------------------------------
# QR image generation
# ---------------------------------------------------------------------------

def generate_qr_image(booking_id: str, qr_token: str) -> str:
    """
    Generate a QR code PNG and return it as a base64-encoded string.

    The QR payload contains only the booking_id and verification token —
    no user PII or sensitive details are embedded.
    """
    payload = json.dumps({
        'bid': booking_id,   # booking identifier
        'tok': qr_token,     # server-issued verification token
        'app': 'VoltReserve',
    }, separators=(',', ':'))

    qr = qrcode.QRCode(
        version=None,  # auto-size
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color='#0a0b0d', back_color='#ffffff')

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode('utf-8')
