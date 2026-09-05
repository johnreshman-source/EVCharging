import React, { useState, useEffect } from 'react'
import { stationService } from '../services/stationService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import MapView from '../components/MapView'
import StationCard from '../components/StationCard'
import { MapPin, Navigation, Compass } from 'lucide-react'

export default function Stations() {
  const [data, setData] = useState({ voltreserve_station: null, public_stations: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Location state
  const [userLoc, setUserLoc] = useState(null) // { lat, lng }
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState(null)

  // Fetch stations (optionally with coordinates)
  const fetchStations = async (lat = null, lng = null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await stationService.getStations(lat, lng)
      setData(res)
    } catch (err) {
      console.error(err)
      setError('Failed to load charging stations.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load without location
  useEffect(() => {
    fetchStations()
  }, [])

  // Handle GPS location request
  const requestLocation = () => {
    setLocLoading(true)
    setLocError(null)

    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser')
      setLocLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLoc({ lat: latitude, lng: longitude })
        setLocLoading(false)
        fetchStations(latitude, longitude) // Re-fetch with coords for OCM data and distance
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setLocError('Location access denied. Displaying default view.')
        setLocLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // Scroll to station card if clicked on map
  const handleStationClick = (station) => {
    const el = document.getElementById(`station-${station.id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.borderColor = 'var(--accent)'
      setTimeout(() => { el.style.borderColor = '' }, 2000)
    }
  }

  if (loading && !data.voltreserve_station) return <Loading />
  if (error && !data.voltreserve_station) return <ErrorMessage message={error} onRetry={() => fetchStations()} />

  return (
    <div className="container animate-fade-in-up" style={{ padding: '32px 16px' }}>
      
      <div style={styles.header}>
        <div>
          <h1 className="page-title">Discover Stations</h1>
          <p className="page-subtitle">Find VoltReserve smart hubs and public chargers near you.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={requestLocation} 
          disabled={locLoading}
          style={{ gap: 8 }}
        >
          {locLoading ? <div style={styles.spinner} /> : <Compass size={16} />}
          {userLoc ? 'Update Location' : 'Use My Location'}
        </button>
      </div>

      {locError && (
        <div style={{ marginBottom: 20 }}>
          <ErrorMessage message={locError} type="default" compact />
        </div>
      )}

      <div className="stations-layout">
        
        {/* Left: Map */}
        <div style={{ position: 'sticky', top: 88, height: 'calc(100vh - 120px)' }}>
          <MapView 
            userLocation={userLoc}
            vrStation={data.voltreserve_station}
            publicStations={data.public_stations}
            onStationClick={handleStationClick}
            height="100%"
          />
        </div>

        {/* Right: Station List */}
        <div style={styles.listContainer}>
          <div style={styles.listHeader}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {data.total} Stations Found
            </span>
            {userLoc && (
              <span className="badge badge-available">Location Active</span>
            )}
          </div>

          <div style={styles.list}>
            {/* VoltReserve Station (Always first) */}
            {data.voltreserve_station && (
              <div id={`station-${data.voltreserve_station.id}`} style={{ transition: 'border-color 0.5s' }}>
                <StationCard station={data.voltreserve_station} />
              </div>
            )}

            {/* Public Stations */}
            {data.public_stations.map(station => (
              <div key={station.id} id={`station-${station.id}`} style={{ transition: 'border-color 0.5s' }}>
                <StationCard station={station} />
              </div>
            ))}

            {data.public_stations.length === 0 && userLoc && (
              <div style={styles.emptyOcm}>
                <MapPin size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                <p>No public stations found within 10km.</p>
              </div>
            )}
            
            {data.public_stations.length === 0 && !userLoc && (
              <div style={styles.emptyOcm}>
                <Navigation size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                <p>Enable location to see nearby public stations.</p>
              </div>
            )}
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
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  spinner: {
    width: 14, height: 14,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: '#fff',
    animation: 'vr-spin 0.8s linear infinite',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-surface-1)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  listHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-surface-2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 20,
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 180px)',
  },
  emptyOcm: {
    padding: '32px 20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    background: 'var(--bg-surface-2)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}
