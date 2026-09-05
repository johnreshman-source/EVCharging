import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <div className="animate-fade-in-up">
      {/* ---------------------------------------------------------------------------
          Hero Section
          --------------------------------------------------------------------------- */}
      <section className="section hero-bg" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="grid-pattern" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={styles.heroContent}>
            <div style={styles.badge}>
              <Zap size={14} color="var(--accent)" />
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Next-Gen EV Charging
              </span>
            </div>
            <h1 style={styles.heroTitle}>
              Find. Reserve. <br />
              <span className="text-accent">Charge.</span>
            </h1>
            <p style={styles.heroDesc}>
              VoltReserve is an IoT-powered EV charging platform. Discover nearby public stations via OpenChargeMap, or reserve a guaranteed slot at a VoltReserve smart hub instantly.
            </p>
            <div style={styles.heroActions}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/stations" className="btn btn-secondary btn-lg">
                View Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------
          Features Section
          --------------------------------------------------------------------------- */}
      <section id="features" className="section" style={{ background: 'var(--bg-surface-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label">Features</span>
            <h2 className="section-title">Smart charging, simplified.</h2>
            <p className="section-body" style={{ margin: '0 auto' }}>
              Everything you need to eliminate range anxiety and charge your EV with confidence.
            </p>
          </div>

          <div className="grid-3">
            <FeatureCard
              icon={<MapPin size={24} color="var(--accent)" />}
              title="Global Discovery"
              desc="Powered by OpenChargeMap. Instantly find thousands of public EV charging stations around you."
            />
            <FeatureCard
              icon={<Clock size={24} color="var(--accent)" />}
              title="Instant Reservation"
              desc="Book a port at any VoltReserve station. We hold your slot for 30 minutes, guaranteed."
            />
            <FeatureCard
              icon={<ShieldCheck size={24} color="var(--accent)" />}
              title="Secure IoT Integration"
              desc="Our ESP32-powered hardware verifies your unique QR code at the station before unlocking the port."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------
          How It Works Section
          --------------------------------------------------------------------------- */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label">How it works</span>
            <h2 className="section-title">Three steps to full battery.</h2>
          </div>

          <div className="grid-3">
            <StepCard
              step="01"
              title="Find a Station"
              desc="Use our live map to locate the nearest VoltReserve smart hub."
            />
            <StepCard
              step="02"
              title="Reserve a Port"
              desc="Select an available port. You have 30 minutes to arrive."
            />
            <StepCard
              step="03"
              title="Scan & Charge"
              desc="Show your digital QR code to the station scanner to begin charging."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------
          CTA Section
          --------------------------------------------------------------------------- */}
      <section className="section" style={{ padding: '6rem 0', background: 'var(--accent-glow)', borderTop: '1px solid var(--border-accent)', borderBottom: '1px solid var(--border-accent)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Ready to plug in?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
            Join VoltReserve today and experience the future of EV charging.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-accent)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  )
}

function StepCard({ step, title, desc }) {
  return (
    <div style={{ padding: '24px', position: 'relative' }}>
      <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--bg-surface-3)', position: 'absolute', top: 0, left: 24, zIndex: -1, lineHeight: 1 }}>
        {step}
      </div>
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{desc}</p>
      </div>
    </div>
  )
}

const styles = {
  heroContent: {
    maxWidth: 680,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'flex-start',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '999px',
    background: 'rgba(111,240,160,0.08)',
    border: '1px solid rgba(111,240,160,0.2)',
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 7vw, 5rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  heroDesc: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: 'var(--text-secondary)',
    maxWidth: 580,
    lineHeight: 1.6,
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
}
