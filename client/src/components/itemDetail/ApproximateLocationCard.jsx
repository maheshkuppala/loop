import React from 'react';
import { Compass, Lock } from 'lucide-react';
import GoogleItemLocationView from '../maps/GoogleItemLocationView';

export const ApproximateLocationCard = ({
  location = 'Indiranagar, Bengaluru',
  coordinates = [12.9716, 77.5946]
}) => {
  let locality = 'Indiranagar';
  let city = 'Bengaluru';
  let finalCoords = [12.9716, 77.5946];

  if (typeof location === 'string') {
    const parts = location.split(',');
    locality = parts[0]?.trim() || 'Indiranagar';
    city = parts[1]?.trim() || 'Bengaluru';
  } else if (location && typeof location === 'object') {
    locality = location.locality || location.name || location.area || 'Indiranagar';
    city = location.city || location.state || 'Bengaluru';
    if (location.latitude != null && location.longitude != null) {
      finalCoords = [Number(location.latitude), Number(location.longitude)];
    }
  }

  if (Array.isArray(coordinates) && coordinates.length === 2 && !isNaN(Number(coordinates[0])) && !isNaN(Number(coordinates[1]))) {
    finalCoords = [Number(coordinates[0]), Number(coordinates[1])];
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl, 16px)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
      className="approximate-location-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-slate-100)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={17} color="#059669" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
            Approximate Location Zone
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
          Public Radius Only
        </span>
      </div>

      {/* Google Maps Privacy View */}
      <GoogleItemLocationView
        locality={locality}
        city={city}
        coordinates={finalCoords}
        height="180px"
      />

      {/* Safety Notice Note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: 'var(--color-slate-600)', lineHeight: 1.45 }}>
        <Lock size={14} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          For community safety, exact home addresses are never published. Sharers arrange safe handovers in public neighborhood spots after mutual request confirmation.
        </span>
      </div>
    </div>
  );
};

export default ApproximateLocationCard;
