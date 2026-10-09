import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';
import BookMyShowLocationModal from './BookMyShowLocationModal';

export const LocationBadge = () => {
  const { location, isLocationModalOpen, openLocationModal, closeLocationModal, displayLocationText } = useLocationContext();

  return (
    <>
      <button
        type="button"
        onClick={openLocationModal}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#047857',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
          whiteSpace: 'nowrap'
        }}
        title="Click to select or change your location"
      >
        <MapPin size={15} color="#059669" />
        <span>{displayLocationText || 'Select Location'}</span>
        <ChevronDown size={14} style={{ color: '#059669', opacity: 0.8 }} />
      </button>

      <BookMyShowLocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />
    </>
  );
};

export default LocationBadge;
