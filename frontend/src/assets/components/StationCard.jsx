import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Zap, Navigation, ChevronRight, Wifi } from 'lucide-react'

/**
 * StationCard — displays a station summary (VoltReserve or public OCM).
 *
 * Props:
 *   station    — station object with id, name, address, distance_formatted, etc.
 *   onSelect   — optional click handler
 */
export default function StationCard({ station, onSelect }) {
  if (!station) return null

  const isVR = station.is_voltreserve
  const availablePorts = station.available_ports ?? null
  const totalPorts = station.total_ports ?? station.num_points ?? null

  return (
    <div
      style={{
        ...styles.card,
        ...(isVR ? styles.cardVR : {}),
      }}
      onClick={() => onSelect?.(station)}
      className="animate-fade-in"
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.nameWrap}>
          <div style={{ ...styles.iconDot, background: isVR ? 'var(--accent)' : '#3b82f6' }}>
            <Zap size={11} color="#0a0b0d" fill="#0a0b0d" />
          </div>
          <div>
            <div style={styles.name}>{station.name}</div>
            {isVR && (
              <span style={styles.vrBadge}>VoltReserve</span>
            )}
            {!isVR && station.source === 'openchargemap' && (
              <span style={styles.ocmBadge}>Public · OpenChargeMap</span>
            )}
          </div>
        </div>
        {station.distance_formatted && (
          <div style={styles.distance}>
            <Navigation size={11} color="var(--text-muted)" />
            {station.distance_formatted}
          </div>
        )}
      </div>

      {/* Address */}
      {station.address && (
        <div style={styles.address}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={styles.addressText}>{station.address}</span>
        </div>
      )}

      {/* Port info */}
      <div style={styles.meta}>
        {isVR && availablePorts !== null && (
          <div style={styles.metaItem}>
            <Zap size={12} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{availablePorts}</span>
            <span style={{ color: 'var(--text-muted)' }}>/ {totalPorts} ports available</span>
          </div>
        )}
        {!isVR && station.connector_types?.length > 0 && (
          <div style={styles.metaItem}>
            <Zap size={12} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              {station.connector_types.slice(0, 2).join(' · ')}
            </span>
          </div>
        )}
        {!isVR && station.power_kw > 0 && (
          <div style={styles.metaItem}>
            <Wifi size={12} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>{station.power_kw} kW</span>
          </div>
        )}
        {!isVR && station.status_type && (
          <div style={styles.metaItem}>
            <span style={{
              fontSize: '0.72rem',
              color: station.status_type === 'Operational' ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {station.status_type}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      {isVR && (
        <Link
          to={`/stations/${station.id}`}
          className="btn btn-primary btn-sm"
          style={{ marginTop: 4 }}
          onClick={e => e.stopPropagation()}
        >
          View & Reserve <ChevronRight size={13} />
        </Link>
      )}
      {!isVR && (
        <div style={styles.ocmNote}>
          Real-time availability not provided by OpenChargeMap
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    cursor: 'pointer',
    transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
    ':hover': { transform: 'translateY(-2px)' },
  },
  cardVR: {
    borderColor: 'rgba(111,240,160,0.2)',
    background: 'rgba(111,240,160,0.03)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameWrap: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  iconDot: {
    width: 26, height: 26,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  name: {
    fontSize: '0.9rem', fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.3,
  },
  vrBadge: {
    fontSize: '0.68rem', fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  ocmBadge: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  },
  distance: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: '0.8rem', color: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
  },
  address: {
    display: 'flex', alignItems: 'flex-start', gap: 6,
  },
  addressText: {
    fontSize: '0.8rem', color: 'var(--text-muted)',
    lineHeight: 1.4, fontFamily: 'Inter, sans-serif',
  },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
  },
  ocmNote: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    fontStyle: 'italic', fontFamily: 'Inter, sans-serif',
  },
}
