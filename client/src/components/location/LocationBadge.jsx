import React, { useState } from 'react';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';
import LocationSelectorModal from './LocationSelectorModal';

export const LocationBadge = () => {
  const { location, searchRadiusKm, displayLocationText } = useLocationContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          fontSize: '0.825rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
          whiteSpace: 'nowrap'
        }}
        title="Click to change your location or search radius"
      >
        <MapPin size={14} color="#059669" />
        <span>{displayLocationText}</span>
        <span style={{ color: '#059669', opacity: 0.7 }}>· {searchRadiusKm} km</span>
        <SlidersHorizontal size={12} style={{ marginLeft: '2px', opacity: 0.6 }} />
      </button>

      {isModalOpen && (
        <LocationSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default LocationBadge;
