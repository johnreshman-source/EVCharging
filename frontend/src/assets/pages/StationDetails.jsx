import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, ShieldCheck } from 'lucide-react'
import { stationService } from '../services/stationService'
import { reservationService } from '../services/reservationService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import PortCard from '../components/PortCard'
import MapView from '../components/MapView'

export default function StationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [userLoc, setUserLoc] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState(null)
  
  const [reservingPort, setReservingPort] = useState(null)
  const [resError, setResError] = useState(null)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const data = await stationService.getStationById(id)
        setStation(data.station)
      } catch (err) {
        setError('Station not found or failed to load.')
      } finally {
        setLoading(false)
      }
    }
    fetchStation()
  }, [id])

  // Get location explicitly for reservation validation
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      setLocLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLoc(loc)
          setLocLoading(false)
          resolve(loc)
        },
        (err) => {
          setLocLoading(false)
          reject(err)
        },
        { timeout: 10000 }
      )
    })
  }

  const handleReserve = async (portId) => {
    setResError(null)
    setReservingPort(portId)

    try {
      // Must have location to reserve
      let currentLoc = userLoc
      if (!currentLoc) {
        try {
          currentLoc = await getLocation()
        } catch (err) {
          throw new Error('You must allow location access to verify you are near the station to reserve a port.')
        }
      }

      const res = await reservationService.create(portId, currentLoc.lat, currentLoc.lng)
      navigate(`/booking-confirmation/${res.reservation.booking_id}`)
      
    } catch (err) {
      setResError(err.response?.data?.error || err.message || 'Failed to create reservation.')
    } finally {
      setReservingPort(null)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  if (!station) return <ErrorMessage message="Station not found." />

  return (
    <div className="container animate-fade-in-up" style={{ padding: '32px 16px' }}>
      
      <button onClick={() => navigate('/stations')} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Stations
      </button>

      <div className="grid-2">
        {/* Left: Details & Ports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 className="page-title" style={{ margin: 0 }}>{station.name}</h1>
              {station.is_voltreserve && (
                <span className="badge badge-available">
                  <ShieldCheck size={12} /> Official Smart Hub
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
              <MapPin size={14} />
              <span style={{ fontSize: '0.9rem' }}>{station.address}</span>
            </div>
          </div>

          {resError && (
            <ErrorMessage type="default" message={resError} compact />
          )}

          {locError && (
            <ErrorMessage type="default" message={locError} compact />
          )}

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Charging Ports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {station.ports?.map(port => (
                <PortCard 
                  key={port.id} 
                  port={port} 
                  onReserve={handleReserve}
                  loading={reservingPort === port.id}
                  disabled={reservingPort !== null && reservingPort !== port.id}
                />
              ))}
              {(!station.ports || station.ports.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                  No ports configured for this station.
                </p>
              )}
            </div>
          </div>
          
        </div>

        {/* Right: Map */}
        <div style={{ height: 500, position: 'sticky', top: 88 }}>
          <MapView 
            userLocation={userLoc}
            vrStation={station}
            height="100%"
          />
          {!userLoc && (
            <button 
              className="btn btn-secondary w-full" 
              style={{ marginTop: 12, gap: 8 }}
              onClick={getLocation}
              disabled={locLoading}
            >
              {locLoading ? <div style={styles.spinner} /> : <Navigation size={16} />}
              Verify My Location
            </button>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
            Location verification is required to reserve a port. You must be within 2km of the station.
          </p>
        </div>

      </div>
    </div>
  )
}

const styles = {
  spinner: {
    width: 14, height: 14,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    animation: 'vr-spin 0.8s linear infinite',
  }
}
