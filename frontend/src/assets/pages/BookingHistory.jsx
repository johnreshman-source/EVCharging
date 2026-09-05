import React, { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { reservationService } from '../services/reservationService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import BookingCard from '../components/BookingCard'

export default function BookingHistory() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await reservationService.getAll()
      setReservations(data.reservations || [])
      setError(null)
    } catch (err) {
      setError('Failed to load booking history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    setCancelLoading(id)
    try {
      await reservationService.cancel(id)
      await fetchHistory()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel')
    } finally {
      setCancelLoading(null)
    }
  }

  if (loading && reservations.length === 0) return <Loading />
  if (error && reservations.length === 0) return <ErrorMessage message={error} onRetry={fetchHistory} />

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 16px', maxWidth: 900 }}>
      
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Booking History</h1>
        <p className="page-subtitle">View all your past and current charging sessions.</p>
      </div>

      {reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <ClipboardList size={32} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>No bookings yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't made any reservations.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reservations.map(res => (
            <BookingCard 
              key={res.id} 
              reservation={res} 
              onCancel={handleCancel}
              cancelLoading={cancelLoading}
            />
          ))}
        </div>
      )}

    </div>
  )
}
