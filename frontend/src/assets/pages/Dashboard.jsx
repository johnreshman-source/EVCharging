import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Activity, RefreshCw } from 'lucide-react'
import { useAuth } from '../App'
import { reservationService } from '../services/reservationService'
import { deviceService } from '../services/deviceService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import BookingCard from '../components/BookingCard'
import PortCard from '../components/PortCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeReservation, setActiveReservation] = useState(null)
  const [deviceData, setDeviceData] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [resData, devData] = await Promise.all([
        reservationService.getActive(),
        deviceService.getStatus(),
      ])
      setActiveReservation(resData.reservation)
      setDeviceData(devData)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Poll device status every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return
    setCancelLoading(id)
    try {
      await reservationService.cancel(id)
      await fetchData() // Refresh to update port status immediately
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel reservation')
    } finally {
      setCancelLoading(null)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />

  const { station, ports, esp32 } = deviceData || {}
  const availableCount = ports?.filter(p => p.status === 'AVAILABLE').length || 0

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 16px' }}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Here's the current status of your charging sessions.</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Active Reservation */}
        <div style={styles.col}>
          <div style={styles.sectionHeader}>
            <Activity size={18} color="var(--accent)" />
            <h2 style={styles.sectionTitle}>Current Session</h2>
          </div>

          {activeReservation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BookingCard 
                reservation={activeReservation} 
                onCancel={handleCancel}
                cancelLoading={cancelLoading}
              />
              <Link to={`/booking-confirmation/${activeReservation.booking_id}`} className="btn btn-primary w-full">
                View Digital QR Code
              </Link>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Zap size={32} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>No Active Reservation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, textAlign: 'center', maxWidth: 280 }}>
                You don't have any ongoing charging sessions right now.
              </p>
              <Link to="/stations" className="btn btn-primary">
                Find a Station
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Live Station Status */}
        <div style={styles.col}>
          <div style={styles.sectionHeader}>
            <Zap size={18} color="var(--accent)" />
            <h2 style={styles.sectionTitle}>Live Station Status</h2>
            {esp32?.online ? (
              <span className="badge badge-available" style={{ marginLeft: 'auto' }}>
                <span className="dot dot-green" /> IoT Online
              </span>
            ) : (
              <span className="badge badge-expired" style={{ marginLeft: 'auto' }}>
                <span className="dot dot-red" /> IoT Offline (Demo Mode)
              </span>
            )}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{station?.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{station?.address}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {availableCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {ports?.length}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ports?.map(port => (
                <PortCard key={port.id} port={port} compact />
              ))}
            </div>

            <Link to={`/stations/${station?.id}`} className="btn btn-secondary w-full" style={{ marginTop: 8 }}>
              View Station Details
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  emptyState: {
    background: 'var(--bg-card)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 280,
  },
}
