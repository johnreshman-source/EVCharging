import React from 'react'
import { Calendar, Clock, Zap, Hash } from 'lucide-react'
import CountdownTimer from './CountdownTimer.jsx'

const STATUS_STYLE = {
  ACTIVE:    { cls: 'badge-active',    label: 'Active' },
  COMPLETED: { cls: 'badge-completed', label: 'Completed' },
  EXPIRED:   { cls: 'badge-expired',   label: 'Expired' },
  CANCELLED: { cls: 'badge-cancelled', label: 'Cancelled' },
}

/**
 * BookingCard — displays a single reservation in booking history.
 *
 * Props:
 *   reservation  — reservation object
 *   onCancel     — called with reservation.id to cancel
 *   cancelLoading— ID of reservation being cancelled
 */
export default function BookingCard({ reservation, onCancel, cancelLoading }) {
  if (!reservation) return null

  const st = STATUS_STYLE[reservation.status] || STATUS_STYLE.EXPIRED
  const isActive = reservation.status === 'ACTIVE'
  const createdAt = new Date(reservation.created_at)
  const expiresAt = new Date(reservation.expires_at)

  return (
    <div style={{ ...styles.card, ...(isActive ? styles.activeCard : {}) }} className="animate-fade-in">
      {/* Header row */}
      <div style={styles.header}>
        <div style={styles.idWrap}>
          <Hash size={12} color="var(--text-muted)" />
          <span style={styles.bookingId}>
            {reservation.booking_id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <span className={`badge ${st.cls}`}>
          <span className="dot" style={dotColor(reservation.status)} />
          {st.label}
        </span>
      </div>

      {/* Station + Port */}
      <div style={styles.details}>
        <div style={styles.detailItem}>
          <Zap size={13} color="var(--accent)" />
          <span style={styles.detailLabel}>Station</span>
          <span style={styles.detailValue}>{reservation.station_name || 'VoltReserve Station'}</span>
        </div>
        <div style={styles.detailItem}>
          <Zap size={13} color="var(--text-muted)" />
          <span style={styles.detailLabel}>Port</span>
          <span style={styles.detailValue}>Port {reservation.port_number}</span>
        </div>
        <div style={styles.detailItem}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={styles.detailLabel}>Date</span>
          <span style={styles.detailValue}>{createdAt.toLocaleDateString()}</span>
        </div>
        <div style={styles.detailItem}>
          <Clock size={13} color="var(--text-muted)" />
          <span style={styles.detailLabel}>Time</span>
          <span style={styles.detailValue}>{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={styles.detailItem}>
          <Clock size={13} color="var(--text-muted)" />
          <span style={styles.detailLabel}>Expires</span>
          <span style={styles.detailValue}>{expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Countdown for active reservations */}
      {isActive && reservation.time_remaining_seconds > 0 && (
        <div style={styles.countdown}>
          <CountdownTimer expiresAt={reservation.expires_at} />
          <span style={styles.countdownLabel}>remaining</span>
        </div>
      )}

      {/* Cancel button */}
      {isActive && onCancel && (
        <button
          className="btn btn-danger btn-sm"
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
          onClick={() => onCancel(reservation.id)}
          disabled={cancelLoading === reservation.id}
        >
          {cancelLoading === reservation.id ? 'Cancelling…' : 'Cancel Reservation'}
        </button>
      )}
    </div>
  )
}

function dotColor(status) {
  const map = {
    ACTIVE: { background: 'var(--status-available)' },
    EXPIRED: { background: 'var(--status-occupied)' },
    CANCELLED: { background: 'var(--text-muted)' },
    COMPLETED: { background: 'var(--info)' },
  }
  return map[status] || {}
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  activeCard: {
    borderColor: 'rgba(111,240,160,0.2)',
    background: 'rgba(111,240,160,0.02)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  idWrap: { display: 'flex', alignItems: 'center', gap: 5 },
  bookingId: {
    fontFamily: 'monospace',
    fontSize: '0.8rem', fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em',
  },
  details: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '6px 12px',
  },
  detailItem: { display: 'flex', alignItems: 'center', gap: 6 },
  detailLabel: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif', minWidth: 42,
  },
  detailValue: {
    fontSize: '0.8rem', fontWeight: 500,
    color: 'var(--text-secondary)',
    fontFamily: 'Inter, sans-serif',
  },
  countdown: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  countdownLabel: {
    fontSize: '0.78rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
}
