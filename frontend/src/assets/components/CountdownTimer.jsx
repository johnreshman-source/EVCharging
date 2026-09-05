import React, { useState, useEffect, useRef } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

/**
 * CountdownTimer — shows remaining time for an active reservation.
 *
 * Props:
 *   expiresAt   — ISO string or Date of expiry
 *   onExpire    — callback when timer hits zero
 *   large       — whether to use the large display style
 */
export default function CountdownTimer({ expiresAt, onExpire, large = false }) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [expired, setExpired] = useState(false)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!expiresAt) return

    const expiry = new Date(expiresAt).getTime()

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0 && !expired) {
        setExpired(true)
        clearInterval(intervalRef.current)
        onExpireRef.current?.()
      }
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current)
  }, [expiresAt])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isUrgent = secondsLeft > 0 && secondsLeft <= 300  // < 5 min
  const color = expired ? 'var(--error)' : isUrgent ? 'var(--warning)' : 'var(--accent)'

  if (expired) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <AlertTriangle size={14} color="var(--error)" />
        <span style={{ ...styles.label, color: 'var(--error)', fontFamily: 'Inter, sans-serif' }}>
          Expired
        </span>
      </div>
    )
  }

  if (large) {
    return (
      <div style={styles.large}>
        <div style={{ ...styles.digits, color, fontSize: '3rem' }}>
          {formatted}
        </div>
        <div style={styles.sublabel}>
          <Clock size={12} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
            Reservation expires in
          </span>
        </div>
        {isUrgent && (
          <div style={styles.urgentBadge}>
            <AlertTriangle size={11} />
            Expiring soon
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Clock size={13} color={color} />
      <span style={{ ...styles.digits, color, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
        {formatted}
      </span>
    </div>
  )
}

const styles = {
  large: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  digits: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  sublabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  urgentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--warning)',
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: '999px',
    padding: '2px 8px',
    fontFamily: 'Inter, sans-serif',
  },
}
