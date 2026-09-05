import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, AlertCircle } from 'lucide-react'

/**
 * MapView — MapLibre GL map with OpenStreetMap tiles.
 *
 * Props:
 *   userLocation     — { lat, lng } or null
 *   vrStation        — VoltReserve station object
 *   publicStations   — array of OCM station objects
 *   onStationClick   — called with station when marker clicked
 *   height           — CSS height string (default '480px')
 */
export default function MapView({
  userLocation,
  vrStation,
  publicStations = [],
  onStationClick,
  height = '480px',
}) {
  const mapContainerRef = useRef(null)
  const mapRef          = useRef(null)
  const markersRef      = useRef([])
  const [mapError, setMapError]   = useState(false)
  const [mapReady, setMapReady]   = useState(false)

  // ---------------------------------------------------------------------------
  // Initialise map
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let map = null

    async function init() {
      try {
        const maplibregl = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')

        if (!mapContainerRef.current || mapRef.current) return

        const center = userLocation
          ? [userLocation.lng, userLocation.lat]
          : vrStation
            ? [vrStation.longitude, vrStation.latitude]
            : [77.2090, 28.6139]  // New Delhi fallback

        map = new maplibregl.default.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              },
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
          },
          center,
          zoom: 13,
          attributionControl: false,
        })

        map.addControl(
          new maplibregl.default.AttributionControl({ compact: true }),
          'bottom-right'
        )
        map.addControl(new maplibregl.default.NavigationControl(), 'bottom-right')

        map.on('load', () => {
          mapRef.current = map
          setMapReady(true)
        })

        map.on('error', () => setMapError(true))
      } catch (e) {
        console.error('Map init error:', e)
        setMapError(true)
      }
    }

    init()

    return () => {
      if (map) {
        map.remove()
        mapRef.current = null
      }
    }
  }, [])  // Only once

  // ---------------------------------------------------------------------------
  // Update markers when data or map readiness changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    async function addMarkers() {
      try {
        const maplibregl = await import('maplibre-gl')
        const M = maplibregl.default

        // User location marker
        if (userLocation) {
          const el = createDot('#6FF0A0', 'You')
          const m = new M.Marker({ element: el })
            .setLngLat([userLocation.lng, userLocation.lat])
            .setPopup(new M.Popup({ offset: 16 }).setHTML('<b>📍 Your Location</b>'))
            .addTo(mapRef.current)
          markersRef.current.push(m)
        }

        // VoltReserve station marker
        if (vrStation?.latitude && vrStation?.longitude) {
          const el = createStationMarker(true)
          const popup = new M.Popup({ offset: 20 }).setHTML(
            `<div style="font-family:Inter,sans-serif">
               <div style="font-weight:700;color:#6FF0A0;margin-bottom:4px">⚡ ${vrStation.name}</div>
               <div style="color:#8896a8;font-size:0.8rem">${vrStation.address || ''}</div>
               <div style="margin-top:6px;font-size:0.8rem">
                 <span style="color:#6FF0A0">${vrStation.available_ports ?? '?'}</span>
                 <span style="color:#4a5568"> / ${vrStation.total_ports ?? 3} ports available</span>
               </div>
             </div>`
          )
          const m = new M.Marker({ element: el })
            .setLngLat([vrStation.longitude, vrStation.latitude])
            .setPopup(popup)
            .addTo(mapRef.current)
          m.getElement().addEventListener('click', () => onStationClick?.(vrStation))
          markersRef.current.push(m)
        }

        // Public OCM station markers
        publicStations.forEach(station => {
          if (!station?.latitude || !station?.longitude) return
          const el = createStationMarker(false)
          const popup = new M.Popup({ offset: 16 }).setHTML(
            `<div style="font-family:Inter,sans-serif">
               <div style="font-weight:600;color:#f0f4f8;margin-bottom:4px">${station.name}</div>
               <div style="color:#8896a8;font-size:0.78rem">${station.address || ''}</div>
               ${station.distance_formatted
                 ? `<div style="color:#4a5568;font-size:0.75rem;margin-top:4px">📍 ${station.distance_formatted}</div>`
                 : ''
               }
               <div style="color:#4a5568;font-size:0.72rem;margin-top:6px;font-style:italic">
                 Public station · No real-time data
               </div>
             </div>`
          )
          const m = new M.Marker({ element: el })
            .setLngLat([station.longitude, station.latitude])
            .setPopup(popup)
            .addTo(mapRef.current)
          markersRef.current.push(m)
        })

        // Fit bounds to include all markers
        if (markersRef.current.length > 1) {
          const coords = []
          if (userLocation)                        coords.push([userLocation.lng, userLocation.lat])
          if (vrStation?.longitude)                coords.push([vrStation.longitude, vrStation.latitude])
          publicStations.forEach(s => { if (s?.longitude) coords.push([s.longitude, s.latitude]) })

          if (coords.length > 1) {
            const bounds = coords.reduce(
              (b, c) => b.extend(c),
              new M.LngLatBounds(coords[0], coords[0])
            )
            mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 })
          }
        }
      } catch (e) {
        console.error('Marker error:', e)
      }
    }

    addMarkers()
  }, [mapReady, userLocation, vrStation, publicStations])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (mapError) {
    return (
      <div style={{ ...styles.container, height, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 12 }}>
        <AlertCircle size={32} color="var(--text-muted)" strokeWidth={1.5} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
          Map failed to load
        </p>
      </div>
    )
  }

  return (
    <div style={{ ...styles.container, height }}>
      <div ref={mapContainerRef} style={styles.mapEl} />
      {!mapReady && (
        <div style={styles.overlay}>
          <div style={styles.spinner} />
        </div>
      )}
      {/* Legend */}
      <div style={styles.legend}>
        <LegendItem color="#6FF0A0" label="VoltReserve" />
        <LegendItem color="#3b82f6" label="Public station" />
        <LegendItem color="#6FF0A0" dot label="You" />
      </div>
      <style>{spinnerCSS}</style>
    </div>
  )
}

function LegendItem({ color, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {dot
        ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
        : <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      }
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Marker element creators
// ---------------------------------------------------------------------------
function createStationMarker(isVR) {
  const el = document.createElement('div')
  el.style.cssText = `
    width: ${isVR ? 36 : 28}px;
    height: ${isVR ? 36 : 28}px;
    border-radius: 50%;
    background: ${isVR ? '#6FF0A0' : '#3b82f6'};
    border: 2.5px solid ${isVR ? '#0a0b0d' : '#1e3a8a'};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 ${isVR ? '12px' : '6px'} ${isVR ? 'rgba(111,240,160,0.4)' : 'rgba(59,130,246,0.3)'};
    transition: transform 150ms ease;
  `
  el.innerHTML = `<svg width="${isVR ? 16 : 12}" height="${isVR ? 16 : 12}" viewBox="0 0 24 24" fill="${isVR ? '#0a0b0d' : '#ffffff'}" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>`
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

function createDot(color, label) {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 14px; height: 14px;
    border-radius: 50%;
    background: ${color};
    border: 2px solid #0a0b0d;
    box-shadow: 0 0 8px ${color}88;
  `
  return el
}

const styles = {
  container: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    background: 'var(--bg-surface-1)',
    display: 'flex',
  },
  mapEl: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'var(--bg-surface-1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 36, height: 36,
    borderRadius: '50%',
    border: '3px solid rgba(111,240,160,0.15)',
    borderTopColor: '#6FF0A0',
    animation: 'vr-spin 0.8s linear infinite',
  },
  legend: {
    position: 'absolute',
    bottom: 40, left: 12,
    background: 'rgba(17,19,24,0.9)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    zIndex: 10,
  },
}

const spinnerCSS = `@keyframes vr-spin { to { transform: rotate(360deg); } }`
