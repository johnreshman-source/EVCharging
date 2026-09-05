import React from 'react'
import { AlertTriangle, RefreshCw, WifiOff, Lock } from 'lucide-react'

const ICON_MAP = {
  default:    AlertTriangle,
  network:    WifiOff,
  auth:       Lock,
}

/**
 * ErrorMessage component for displaying inline or page-level errors.
 *
 * Props:
 *   title      — Error heading (optional)
 *   message    — Error body text
 *   type       — 'default' | 'network' | 'auth'
 *   onRetry    — If provided, shows a "Try again" button
 *   compact    — Smaller, inline style
 */
export default function ErrorMessage({
  title,
  message = 'Something went wrong.',
  type = 'default',
  onRetry,
  compact = false,
}) {
  const Icon = ICON_MAP[type] || AlertTriangle

  if (compact) {
    return (
      <div style={styles.compact}>
        <Icon size={14} color="var(--error)" />
        <span style={styles.compactText}>{message}</span>
      </div>
    )
  }

  return (
    <div style={styles.container} className="animate-fade-in" role="alert">
      <div style={styles.iconWrap}>
        <Icon size={24} color="var(--error)" strokeWidth={1.5} />
      </div>
      {title && <h3 style={styles.title}>{title}</h3>}
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 24px',
    gap: '8px',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
  },
  message: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    maxWidth: '380px',
    lineHeight: 1.6,
    fontFamily: 'Inter, sans-serif',
  },
  compact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  compactText: {
    fontSize: '0.8rem',
    color: 'var(--error)',
    fontFamily: 'Inter, sans-serif',
  },
}
