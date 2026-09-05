import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Github, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>

          {/* Brand */}
          <div style={styles.brand}>
            <Link to="/" style={styles.logo}>
              <div style={styles.logoIcon}><Zap size={16} color="#0a0b0d" fill="#0a0b0d" /></div>
              <span style={styles.logoText}>VoltReserve</span>
            </Link>
            <p style={styles.tagline}>Find. Reserve. Charge.</p>
            <p style={styles.desc}>
              IoT-powered EV charging reservation platform. Smart, reliable, and sustainable.
            </p>
          </div>

          {/* Quick links */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Platform</h4>
            <ul style={styles.linkList}>
              <li><Link to="/" style={styles.link}>Home</Link></li>
              <li><Link to="/stations" style={styles.link}>Stations</Link></li>
              <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
              <li><Link to="/bookings" style={styles.link}>Bookings</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Account</h4>
            <ul style={styles.linkList}>
              <li><Link to="/login" style={styles.link}>Sign In</Link></li>
              <li><Link to="/register" style={styles.link}>Register</Link></li>
              <li><Link to="/profile" style={styles.link}>Profile</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>About</h4>
            <ul style={styles.linkList}>
              <li style={styles.infoItem}>
                <MapPin size={13} color="var(--text-muted)" />
                <span style={styles.infoText}>New Delhi, India</span>
              </li>
              <li style={styles.infoItem}>
                <Mail size={13} color="var(--text-muted)" />
                <span style={styles.infoText}>support@voltreserve.local</span>
              </li>
            </ul>
            <p style={styles.collegeNote}>College IoT Project</p>
          </div>

        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {year} VoltReserve. Built for the future of mobility.
          </p>
          <div style={styles.bottomLinks}>
            <span style={styles.tech}>React · Flask · MySQL · ESP32</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-surface-1)',
    marginTop: 'auto',
    padding: '48px 0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
    gap: '40px',
    marginBottom: '40px',
  },
  brand: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logo: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: 30, height: 30,
    background: 'var(--accent)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '1rem', fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    fontFamily: 'Inter, sans-serif',
  },
  tagline: {
    fontSize: '0.75rem', fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: 280,
    fontFamily: 'Inter, sans-serif',
  },
  col: { display: 'flex', flexDirection: 'column', gap: '16px' },
  colTitle: {
    fontSize: '0.75rem', fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  linkList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  link: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'color 150ms ease',
    fontFamily: 'Inter, sans-serif',
  },
  infoItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  infoText: {
    fontSize: '0.825rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
  collegeNote: {
    display: 'inline-block',
    fontSize: '0.72rem', fontWeight: 600,
    color: 'var(--accent)',
    background: 'rgba(111, 240, 160, 0.08)',
    border: '1px solid rgba(111, 240, 160, 0.2)',
    borderRadius: '4px',
    padding: '3px 8px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    paddingTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  copyright: {
    fontSize: '0.8rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
  bottomLinks: { display: 'flex', alignItems: 'center', gap: '16px' },
  tech: {
    fontSize: '0.75rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
}
