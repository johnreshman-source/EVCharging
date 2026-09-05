import React from 'react'
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react'
import { useAuth } from '../App'

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) return null

  const joinDate = new Date(user.created_at).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  })

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 16px', maxWidth: 600 }}>
      
      <h1 className="page-title" style={{ marginBottom: 32 }}>Your Profile</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Avatar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: 'var(--accent-glow)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'var(--accent)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{user.name}</h2>
            {user.is_admin && (
              <span className="badge badge-available" style={{ background: 'rgba(111,240,160,0.1)' }}>
                <Shield size={12} style={{ marginRight: 4 }} />
                System Administrator
              </span>
            )}
          </div>
        </div>

        <div className="divider" style={{ margin: 0 }} />

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={styles.row}>
            <Mail size={16} color="var(--text-muted)" />
            <span style={styles.label}>Email Address</span>
            <span style={styles.value}>{user.email}</span>
          </div>
          
          <div style={styles.row}>
            <Calendar size={16} color="var(--text-muted)" />
            <span style={styles.label}>Joined</span>
            <span style={styles.value}>{joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        {user.stats && (
          <>
            <div className="divider" style={{ margin: 0 }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Charging Stats</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                <StatBox label="Total Bookings" value={user.stats.total_bookings} />
                <StatBox label="Completed" value={user.stats.completed_bookings} />
                <StatBox label="Cancelled" value={user.stats.cancelled_bookings} />
              </div>
            </div>
          </>
        )}

        <div className="divider" style={{ margin: 0 }} />

        <button className="btn btn-danger" onClick={logout} style={{ alignSelf: 'flex-start' }}>
          Sign Out
        </button>

      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, background: 'var(--bg-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 12 },
  label: { width: 120, fontSize: '0.9rem', color: 'var(--text-muted)' },
  value: { fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' },
}
