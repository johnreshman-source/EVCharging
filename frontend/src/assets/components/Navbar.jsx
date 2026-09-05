import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, Menu, X, LayoutDashboard, MapPin, ClipboardList, User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../App.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Add shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path))

  const linkStyle = (path) => ({
    ...styles.navLink,
    ...(isActive(path) ? styles.navLinkActive : {}),
  })

  return (
    <>
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div className="container" style={styles.inner}>

          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Zap size={15} color="#0a0b0d" fill="#0a0b0d" />
            </div>
            <span style={styles.logoText}>VoltReserve</span>
          </Link>

          {/* Desktop Nav */}
          <div style={styles.desktopNav}>
            {!user ? (
              <>
                <Link to="/" style={linkStyle('/')}>Home</Link>
                <Link to="/stations" style={linkStyle('/stations')}>Stations</Link>
                <a href="/#features" style={styles.navLink}>Features</a>
                <a href="/#how-it-works" style={styles.navLink}>How It Works</a>
              </>
            ) : (
              <>
                <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
                <Link to="/stations" style={linkStyle('/stations')}>Stations</Link>
                <Link to="/bookings" style={linkStyle('/bookings')}>Bookings</Link>
                {user.is_admin && (
                  <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div style={styles.actions}>
            {!user ? (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            ) : (
              <div style={styles.userMenu}>
                <Link to="/profile" style={styles.userAvatar} title={user.name}>
                  <span style={styles.avatarInitial}>
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              style={styles.hamburger}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu} className="animate-fade-in">
          <div style={styles.mobileLinks}>
            {!user ? (
              <>
                <MobileLink to="/" icon={<Zap size={16} />}      label="Home"       isActive={isActive('/')} />
                <MobileLink to="/stations" icon={<MapPin size={16} />} label="Stations" isActive={isActive('/stations')} />
                <div style={styles.mobileDivider} />
                <Link to="/login"    className="btn btn-secondary w-full" style={{ marginBottom: 8 }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary  w-full">Get Started</Link>
              </>
            ) : (
              <>
                <MobileLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" isActive={isActive('/dashboard')} />
                <MobileLink to="/stations"  icon={<MapPin size={16} />}           label="Stations"  isActive={isActive('/stations')} />
                <MobileLink to="/bookings"  icon={<ClipboardList size={16} />}    label="Bookings"  isActive={isActive('/bookings')} />
                <MobileLink to="/profile"   icon={<User size={16} />}             label="Profile"   isActive={isActive('/profile')} />
                {user.is_admin && (
                  <MobileLink to="/admin" icon={<Shield size={16} />} label="Admin" isActive={isActive('/admin')} />
                )}
                <div style={styles.mobileDivider} />
                <button onClick={handleLogout} className="btn btn-danger w-full" style={{ gap: 8 }}>
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {menuOpen && <div style={styles.backdrop} onClick={() => setMenuOpen(false)} />}
    </>
  )
}

function MobileLink({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-glow)' : 'transparent',
        fontWeight: 500,
        fontSize: '0.9rem',
        fontFamily: 'Inter, sans-serif',
        textDecoration: 'none',
        transition: 'all 150ms ease',
      }}
    >
      {icon}{label}
    </Link>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 'var(--z-sticky)',
    background: 'rgba(10, 11, 13, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    transition: 'box-shadow 200ms ease',
  },
  navScrolled: {
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    gap: 24,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    textDecoration: 'none', flexShrink: 0,
  },
  logoIcon: {
    width: 28, height: 28,
    background: 'var(--accent)',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem', fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  desktopNav: {
    display: 'flex', alignItems: 'center', gap: 4,
    flex: 1, justifyContent: 'center',
    '@media(maxWidth:768px)': { display: 'none' },
  },
  navLink: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', fontWeight: 500,
    color: 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    transition: 'color 150ms ease, background 150ms ease',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
  },
  navLinkActive: {
    color: 'var(--accent)',
    background: 'var(--accent-glow)',
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
  },
  userMenu: { display: 'flex', alignItems: 'center', gap: 8 },
  userAvatar: {
    width: 32, height: 32,
    background: 'var(--accent-glow)',
    border: '1px solid var(--border-accent)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  avatarInitial: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.8rem', fontWeight: 700,
    color: 'var(--accent)',
  },
  hamburger: {
    display: 'none',
    padding: 6,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    '@media(maxWidth:768px)': { display: 'flex' },
  },
  mobileMenu: {
    position: 'fixed',
    top: 64, left: 0, right: 0,
    zIndex: 'calc(var(--z-sticky) - 1)',
    background: 'var(--bg-surface-1)',
    borderBottom: '1px solid var(--border)',
    padding: '12px 16px 20px',
  },
  mobileLinks: { display: 'flex', flexDirection: 'column', gap: 4 },
  mobileDivider: {
    height: 1, background: 'var(--border)', margin: '8px 0',
  },
  backdrop: {
    position: 'fixed', inset: 0,
    zIndex: 'calc(var(--z-sticky) - 2)',
    background: 'rgba(0,0,0,0.4)',
  },
}

/* Hide hamburger on desktop, show on mobile */
const mediaStyle = `
  @media (min-width: 769px) {
    [data-hamburger] { display: none !important; }
    [data-desktop-nav] { display: flex !important; }
  }
  @media (max-width: 768px) {
    [data-desktop-nav] { display: none !important; }
    [data-hamburger] { display: flex !important; }
  }
`
