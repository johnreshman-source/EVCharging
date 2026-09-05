import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Activity, Users, ClipboardList, RefreshCw, Zap, Settings, Play } from 'lucide-react'
import { adminService } from '../services/adminService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Admin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchData = useCallback(async () => {
    try {
      const res = await adminService.getDashboard()
      setData(res)
      setError(null)
    } catch (err) {
      setError('Failed to load admin dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleDemoCycle = async () => {
    try {
      await adminService.triggerDemoCycle()
      fetchData()
    } catch (err) {
      alert('Failed to trigger demo cycle')
    }
  }

  const handlePortOverride = async (portId, currentStatus) => {
    const statuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED']
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length
    const nextStatus = statuses[nextIdx]
    
    try {
      await adminService.setPortStatus(portId, nextStatus)
      fetchData()
    } catch (err) {
      alert('Failed to override port status')
    }
  }

  if (loading && !data) return <Loading />
  if (error && !data) return <ErrorMessage message={error} onRetry={fetchData} />

  const { station, ports, esp32, stats, active_reservations } = data

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 16px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={28} color="var(--accent)" />
            System Administration
          </h1>
          <p className="page-subtitle">IoT device status and global platform metrics.</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-grid">
        
        {/* KPI Cards */}
        <KpiCard icon={<Users />} label="Total Users" value={stats?.total_users} />
        <KpiCard icon={<ClipboardList />} label="Total Bookings" value={stats?.total_reservations} />
        <KpiCard icon={<Activity />} label="Active Sessions" value={stats?.active_reservations} color="var(--status-available)" />

        {/* IoT Device Control Panel */}
        <div className="card" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Zap size={20} color="var(--accent)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>IoT Hardware Status: {station?.name}</h2>
            </div>
            {esp32?.online ? (
              <span className="badge badge-available"><span className="dot dot-green"/> ESP32 ONLINE</span>
            ) : (
              <span className="badge badge-expired"><span className="dot dot-red"/> ESP32 OFFLINE</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {ports?.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Port {p.port_number}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Sensor: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{p.sensor_value ?? 'N/A'}V</span>
                </div>
                <button 
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => handlePortOverride(p.id, p.status)}
                >
                  <Settings size={12} /> Override Status
                </button>
              </div>
            ))}
          </div>

          {!esp32?.online && (
            <div style={{ padding: 16, background: 'rgba(245,158,11,0.1)', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: 4 }}>Hardware Offline (Demo Mode Active)</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ESP32 has not checked in for > 60 seconds.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleDemoCycle} style={{ gap: 6, borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                <Play size={12} /> Cycle Statuses
              </button>
            </div>
          )}
        </div>

        {/* Active Reservations Table */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Active Reservations</h2>
          
          {active_reservations?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active reservations across the network.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={styles.th}>Booking ID</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Port</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {active_reservations?.map(res => (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--bg-surface-2)' }}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{res.booking_id.slice(0,8).toUpperCase()}</span></td>
                      <td style={styles.td}>{res.user_name}</td>
                      <td style={styles.td}>Port {res.port_number}</td>
                      <td style={styles.td}>{new Date(res.created_at).toLocaleTimeString()}</td>
                      <td style={styles.td}>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={async () => {
                            if(window.confirm('Force cancel this reservation?')) {
                              await adminService.cancelReservation(res.id);
                              fetchData();
                            }
                          }}
                        >
                          Force Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, color = 'var(--text-primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    AVAILABLE: { c: 'var(--status-available)', b: 'rgba(111,240,160,0.2)', bg: 'rgba(111,240,160,0.1)' },
    RESERVED:  { c: 'var(--status-reserved)',  b: 'rgba(245,158,11,0.2)',  bg: 'rgba(245,158,11,0.1)' },
    OCCUPIED:  { c: 'var(--status-occupied)',  b: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.1)' },
  }
  const s = map[status] || map.AVAILABLE
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: s.c, border: `1px solid ${s.b}`, background: s.bg }}>
      {status}
    </span>
  )
}

const styles = {
  th: { padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' },
  td: { padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-primary)' },
}
