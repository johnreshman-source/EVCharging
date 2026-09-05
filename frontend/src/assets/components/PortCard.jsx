import React from 'react'
import { Zap, CheckCircle, Clock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    color: 'var(--status-available)',
    bg: 'rgba(111, 240, 160, 0.08)',
    border: 'rgba(111, 240, 160, 0.2)',
    icon: CheckCircle,
    dotClass: 'dot-green',
  },
  RESERVED: {
    label: 'Reserved',
    color: 'var(--status-reserved)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    icon: Clock,
    dotClass: 'dot-yellow',
  },
  OCCUPIED: {
    label: 'Occupied',
    color: 'var(--status-occupied)',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.2)',
    icon: XCircle,
    dotClass: 'dot-red',
  },
}

/**
 * PortCard — displays a single charging port status with optional reserve action.
 *
 * Props:
 *   port       — { id, port_number, status }
 *   onReserve  — called with port.id when user clicks Reserve
 *   loading    — shows loading state on Reserve button
 *   disabled   — disables reserve button (e.g. user not logged in, out of range)
 *   compact    — smaller layout for dashboard
 */
export default function PortCard({ port, onReserve, loading, disabled, compact }) {
  const cfg = STATUS_CONFIG[port?.status] || STATUS_CONFIG.AVAILABLE
  const Icon = cfg.icon
  const isAvailable = port?.status === 'AVAILABLE'

  return (
    <div
      style={{
        ...styles.card,
        borderColor: cfg.border,
        background: cfg.bg,
        ...(compact ? styles.compact : {}),
      }}
      className="animate-fade-in"
    >
      {/* Port number */}
      <div style={styles.header}>
        <div style={styles.portNum}>
          <Zap size={12} color={cfg.color} />
          Port {port?.port_number}
        </div>
        <div style={{ ...styles.dot, background: cfg.color }} className="dot dot-pulse" />
      </div>

      {/* Status icon + label */}
      <div style={styles.statusWrap}>
        <div style={{ ...styles.iconRing, borderColor: cfg.border, background: `${cfg.bg}` }}>
          <Icon size={compact ? 18 : 22} color={cfg.color} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ ...styles.statusLabel, color: cfg.color }}>
            {cfg.label}
          </div>
          {!compact && (
            <div style={styles.statusSub}>
              {port?.status === 'AVAILABLE' && 'Ready to reserve'}
              {port?.status === 'RESERVED'  && 'Currently reserved'}
              {port?.status === 'OCCUPIED'  && 'Charging in progress'}
            </div>
          )}
        </div>
      </div>

      {/* Reserve button */}
      {!compact && onReserve && (
        <button
          className={`btn btn-primary w-full ${!isAvailable || disabled ? '' : ''}`}
          style={{ marginTop: 12 }}
          disabled={!isAvailable || disabled || loading}
          onClick={() => onReserve(port.id)}
        >
          {loading
            ? 'Reserving…'
            : isAvailable
              ? 'Reserve Port'
              : cfg.label}
        </button>
      )}
    </div>
  )
}

const styles = {
  card: {
    padding: '20px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'box-shadow 200ms ease, transform 200ms ease',
  },
  compact: {
    padding: '14px 16px',
    gap: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portNum: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
  dot: {
    width: 7, height: 7,
    borderRadius: '50%',
    animation: 'pulse-dot 2s infinite',
  },
  statusWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  iconRing: {
    width: 44, height: 44,
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.2,
  },
  statusSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
    marginTop: 2,
  },
}
