import React from 'react';
import { Map, MapPin, Compass, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

export const MapPreviewCard = ({ centerLocation = 'Indiranagar, Bengaluru', radiusKm = 5, itemsCount = 9 }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
      className="map-preview-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Compass size={16} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
            Explore on Map
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
          {radiusKm} km radius
        </span>
      </div>

      {/* Styled Map Preview Canvas Mockup */}
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
        className="map-canvas-mockup"
      >
        {/* Soft Circular Radar Ring for Privacy */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1.5px dashed rgba(16, 185, 129, 0.4)',
            pointerEvents: 'none'
          }}
        />

        {/* Center Community Pin */}
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
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.4)'
            }}
          >
            <MapPin size={17} />
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-slate-800)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {centerLocation.split(',')[0]}
          </span>
        </div>

        {/* Scattered items nearby pins */}
        <div
          style={{
            position: 'absolute',
            top: '25px',
            left: '30px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#0284c7',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
          title="Books & Study Materials"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '40px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ea580c',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
          title="DIY Cordless Drill"
        />
        <div
          style={{
            position: 'absolute',
            top: '35px',
            right: '60px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
          title="Scientific Calculator"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
        <span>Privacy protected • Approximate zones</span>
        <span style={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>
          {itemsCount} listings nearby
        </span>
      </div>
    </div>
  );
};

export default MapPreviewCard;
