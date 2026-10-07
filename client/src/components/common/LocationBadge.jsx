import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * Resolves a location value into a display string.
 * Handles: string, object { city, district, state, locality }, or fallback.
 */
const resolveLocation = (location) => {
  if (!location) return 'Location not set';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.locality, location.district, location.city, location.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not set';
  }
  return String(location);
};

export const LocationBadge = ({ location = 'Bengaluru', distanceKm = null, className = '' }) => {
  const displayLocation = resolveLocation(location);

  return (
    <div
      className={`location-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.8rem',
        color: 'var(--color-slate-600)',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      <MapPin size={13} style={{ flexShrink: 0, color: 'var(--color-primary-600)' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {distanceKm !== null && distanceKm !== undefined ? (
          <>
            <strong style={{ color: 'var(--color-primary-700)' }}>Approx. {distanceKm} km away</strong>
            {' • '}
            <span>{displayLocation}</span>
          </>
        ) : (
          displayLocation
        )}
      </span>
    </div>
  );
};

export default LocationBadge;

