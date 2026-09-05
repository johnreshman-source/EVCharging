import React from 'react'
import { Zap, Calendar, Clock, Hash, CheckCircle, Download } from 'lucide-react'
import CountdownTimer from './CountdownTimer.jsx'

/**
 * QRCodeCard — shows the QR code image and booking details for an active reservation.
 *
 * Props:
 *   reservation — reservation object
 *   qrImage     — base64 data URL for the QR code image
 *   onExpire    — callback when countdown reaches zero
 */
export default function QRCodeCard({ reservation, qrImage, onExpire }) {
  if (!reservation) return null

  const createdAt = new Date(reservation.created_at)
  const expiresAt = new Date(reservation.expires_at)

  const handleDownload = () => {
    if (!qrImage) return
    const a = document.createElement('a')
    a.href = qrImage
    a.download = `voltreserve-qr-${reservation.booking_id.slice(0, 8)}.png`
    a.click()
  }

  return (
    <div style={styles.card} className="animate-fade-in-up">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <CheckCircle size={16} color="var(--accent)" />
          Reservation Confirmed
        </div>
        <div style={styles.timeLeft}>
          <CountdownTimer expiresAt={reservation.expires_at} onExpire={onExpire} />
        </div>
      </div>

      <div style={styles.body}>
        {/* QR Code */}
        <div style={styles.qrWrap}>
          {qrImage ? (
            <img
              src={qrImage}
              alt="Reservation QR Code"
              style={styles.qrImg}
            />
          ) : (
            <div style={styles.qrPlaceholder}>
              <div style={styles.qrSpin} />
            </div>
          )}
          <p style={styles.qrHint}>Show this QR at the charging station</p>
          {qrImage && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary btn-sm"
              style={{ gap: 5 }}
            >
              <Download size={12} />
              Download QR
            </button>
          )}
        </div>

        {/* Booking Details */}
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <Hash size={13} color="var(--text-muted)" />
            <span style={styles.dlabel}>Booking ID</span>
            <span style={styles.dvalue}>{reservation.booking_id.slice(0, 16).toUpperCase()}…</span>
          </div>
          <div style={styles.detailRow}>
            <Zap size={13} color="var(--accent)" />
            <span style={styles.dlabel}>Station</span>
            <span style={styles.dvalue}>{reservation.station_name || 'VoltReserve Station'}</span>
          </div>
          <div style={styles.detailRow}>
            <Zap size={13} color="var(--text-muted)" />
            <span style={styles.dlabel}>Port</span>
            <span style={styles.dvalue}>Port {reservation.port_number}</span>
          </div>
          <div style={styles.detailRow}>
            <Calendar size={13} color="var(--text-muted)" />
            <span style={styles.dlabel}>Reserved at</span>
            <span style={styles.dvalue}>
              {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={styles.detailRow}>
            <Clock size={13} color="var(--warning)" />
            <span style={styles.dlabel}>Expires at</span>
            <span style={{ ...styles.dvalue, color: 'var(--warning)' }}>
              {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Large countdown */}
          <div style={styles.countdownBlock}>
            <CountdownTimer
              expiresAt={reservation.expires_at}
              onExpire={onExpire}
              large
            />
          </div>
        </div>
      </div>

      <style>{spinCSS}</style>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(111,240,160,0.2)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: '0 0 32px rgba(111,240,160,0.05)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 12,
  },
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '1rem', fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
  },
  timeLeft: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    alignItems: 'start',
  },
  qrWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
  },
  qrImg: {
    width: '100%', maxWidth: 200,
    borderRadius: 'var(--radius-md)',
    border: '3px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    imageRendering: 'pixelated',
  },
  qrPlaceholder: {
    width: 180, height: 180,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-surface-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qrSpin: {
    width: 32, height: 32,
    border: '3px solid rgba(111,240,160,0.15)',
    borderTopColor: '#6FF0A0',
    borderRadius: '50%',
    animation: 'vr-spin 0.8s linear infinite',
  },
  qrHint: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    textAlign: 'center', fontFamily: 'Inter, sans-serif',
  },
  details: {
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  detailRow: { display: 'flex', alignItems: 'center', gap: 8 },
  dlabel: {
    fontSize: '0.78rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif', minWidth: 80,
  },
  dvalue: {
    fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
  },
  countdownBlock: {
    marginTop: 8,
    padding: '16px',
    background: 'var(--bg-surface-2)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    display: 'flex', justifyContent: 'center',
  },
}

const spinCSS = `@keyframes vr-spin { to { transform: rotate(360deg); } }`
