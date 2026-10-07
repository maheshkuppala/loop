import React from 'react';
import { MapPin, ShieldAlert, Compass, Lock } from 'lucide-react';

export const ApproximateLocationCard = ({ location = 'Indiranagar, Bengaluru' }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
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
            Approximate Location
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
          Public Zone Only
        </span>
      </div>

      {/* Styled Privacy Radar Map Preview Mockup */}
      <div
        style={{
          position: 'relative',
          height: '140px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#e2e8f0',
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, #f1f5f9 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-slate-200)'
        }}
        className="map-privacy-canvas"
      >
        {/* Radar Radius Zone Circle */}
        <div
          style={{
            position: 'absolute',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '2px dashed rgba(16, 185, 129, 0.5)',
            pointerEvents: 'none'
          }}
        />

        {/* Center Neighborhood Pin */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.35)'
            }}
          >
            <MapPin size={17} />
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#ffffff',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-slate-800)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {location.split(',')[0]}
          </span>
        </div>
      </div>

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
