import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Loader2 } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuth } from '../App'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await authService.login(formData.email, formData.password)
      login(data.access_token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page animate-fade-in-up">
      <div style={styles.card}>
        
        <div style={styles.header}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}><Zap size={18} color="#0a0b0d" fill="#0a0b0d" /></div>
            <span style={styles.logoText}>VoltReserve</span>
          </Link>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to manage your charging reservations.</p>
        </div>

        {error && (
          <div style={{ marginBottom: 20 }}>
            <ErrorMessage type="auth" message={error} compact />
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one now</Link>
        </p>

      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    textDecoration: 'none', marginBottom: 24,
  },
  logoIcon: {
    width: 32, height: 32,
    background: 'var(--accent)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem', fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    fontFamily: 'Inter, sans-serif',
  },
  title: {
    fontSize: '1.5rem', fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: '0.9rem', color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  footer: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
