import React from 'react'

/**
 * Loading spinner component.
 * Use for full-page loading states (Suspense fallback) or inline loading.
 */
export default function Loading({ message = 'Loading…', fullPage = true }) {
  if (fullPage) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.wrapper}>
          <div style={styles.ring} aria-label="Loading">
            <div style={styles.inner} />
          </div>
          {message && <p style={styles.message}>{message}</p>}
        </div>
        <style>{css}</style>
      </div>
    )
  }

  return (
    <div style={styles.inline}>
      <div style={{ ...styles.ring, width: 24, height: 24 }} aria-label="Loading">
        <div style={{ ...styles.inner, width: 24, height: 24, borderWidth: 2 }} />
      </div>
      <style>{css}</style>
    </div>
  )
}

const styles = {
  fullPage: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  ring: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  inner: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '3px solid rgba(111, 240, 160, 0.15)',
    borderTopColor: '#6FF0A0',
    animation: 'vr-spin 0.8s linear infinite',
  },
  message: {
    color: '#8896a8',
    fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif',
  },
  inline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

const css = `
  @keyframes vr-spin {
    to { transform: rotate(360deg); }
  }
`
