import React, { useState } from 'react';
import { MapPin, Crosshair, ArrowRight } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';
import LocationSelectorModal from './LocationSelectorModal';
import Button from '../common/Button';

export const LocationPromptModal = () => {
  const {
    locationStatus,
    requestBrowserLocation,
    isGeoLoading,
    geoError
  } = useLocationContext();

  const [showManualSelector, setShowManualSelector] = useState(false);

  // Render prompt modal ONLY if location status requires selection
  if (locationStatus !== 'LOCATION_MANUAL_SELECTION' && locationStatus !== 'LOCATION_DENIED') {
    return null;
  }

  if (showManualSelector) {
    return <LocationSelectorModal isOpen={true} onClose={() => setShowManualSelector(false)} />;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Icon Circle */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '2px solid #a7f3d0'
          }}
        >
          <MapPin size={32} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
          Find Products Near You
        </h2>

        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          To discover items shared by people in your local community, set your location.
        </p>

        {geoError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.825rem',
              marginBottom: '1.25rem'
            }}
          >
            {geoError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* GPS Button */}
          <button
            type="button"
            onClick={requestBrowserLocation}
            disabled={isGeoLoading}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Crosshair size={18} />
            <span>{isGeoLoading ? 'Detecting Location...' : 'Use My Current Location'}</span>
          </button>

          {/* Manual Selection Button */}
          <button
            type="button"
            onClick={() => setShowManualSelector(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '14px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Enter Location Manually</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPromptModal;
