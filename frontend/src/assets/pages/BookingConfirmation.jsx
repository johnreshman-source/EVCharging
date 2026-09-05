import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { reservationService } from '../services/reservationService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import QRCodeCard from '../components/QRCodeCard'

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await reservationService.getQRCode(bookingId)
        setData(res)
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error?.includes('active reservations')) {
          setError('This reservation is no longer active (expired or completed). QR code is unavailable.')
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this reservation.')
        } else {
          setError('Failed to load reservation details.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchQR()
  }, [bookingId])

  const handleExpire = () => {
    // When the timer hits zero, refresh the page state or go to dashboard
    alert('Your reservation has expired.')
    navigate('/dashboard')
  }

  if (loading) return <Loading />

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 16px', maxWidth: 800 }}>
      
      <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 32, alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <QRCodeCard 
          reservation={data?.reservation}
          qrImage={data?.qr_image}
          onExpire={handleExpire}
        />
      )}
      
    </div>
  )
}
