import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { loadGoogleMaps } from '../../services/googleMapsLoader';

/**
 * Reusable Google Places Location Autocomplete Component for LOOOP
 * Features: Debounced API calls, keyboard navigation, clear button, and exact place metadata output.
 */
export const LocationAutocomplete = ({
  placeholder = 'Search city, locality, or landmark...',
  initialValue = '',
  onPlaceSelect,
  className = '',
  style = {}
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps()
      .then((maps) => {
        if (!mounted || !inputRef.current || !maps.places) return;

        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['geometry', 'name', 'formatted_address', 'address_components']
        });

        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const formatted = place.formatted_address || place.name || '';

            setValue(formatted);

            let locality = '';
            let city = '';
            let state = '';

            (place.address_components || []).forEach((comp) => {
              const types = comp.types || [];
              if (types.includes('sublocality') || types.includes('neighborhood')) {
                locality = comp.long_name;
              } else if (types.includes('locality')) {
                city = comp.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
            });

            if (onPlaceSelect) {
              onPlaceSelect({
                latitude: lat,
                longitude: lng,
                formattedAddress: formatted,
                locality: locality || city,
                city: city || state,
                state
              });
            }
          }
        });

        setLoaded(true);
      })
      .catch((err) => {
        console.warn('[LocationAutocomplete] Places API load failure:', err);
      });

    return () => {
      mounted = false;
    };
  }, [onPlaceSelect]);

  const handleClear = () => {
    setValue('');
    if (inputRef.current) inputRef.current.focus();
    if (onPlaceSelect) onPlaceSelect(null);
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          pointerEvents: 'none'
        }}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.65rem 2.2rem 0.65rem 2.4rem',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1.5px solid #cbd5e1',
          fontSize: '0.875rem',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px'
          }}
          aria-label="Clear location input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default LocationAutocomplete;
