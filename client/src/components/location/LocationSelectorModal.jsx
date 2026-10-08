import React, { useState } from 'react';
import { MapPin, Crosshair, X, Check, Sliders } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';
import Button from '../common/Button';

const INDIA_LOCATIONS = [
  {
    state: 'Andhra Pradesh',
    cities: [
      { name: 'Guntur', localities: ['Broadipet', 'Arundelpet', 'Nallapadu', 'Kothapet', 'Vidyanagar'] },
      { name: 'Vijayawada', localities: ['Benz Circle', 'Labbipet', 'Patamata', 'Governorpet'] },
      { name: 'Visakhapatnam', localities: ['MVP Colony', 'Gajuwaka', 'Siripuram', 'Dwaraka Nagar'] },
      { name: 'Tirupati', localities: ['KT Road', 'Air Bypass Road', 'Chandragiri'] }
    ]
  },
  {
    state: 'Karnataka',
    cities: [
      { name: 'Bengaluru', localities: ['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'Jayanagar', 'Marathahalli'] },
      { name: 'Mysuru', localities: ['Gokulam', 'Vijayanagar', 'Saraswathipuram'] }
    ]
  },
  {
    state: 'Telangana',
    cities: [
      { name: 'Hyderabad', localities: ['Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur'] }
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: [
      { name: 'Chennai', localities: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery'] },
      { name: 'Coimbatore', localities: ['RS Puram', 'Gandhipuram', 'Peelamedu'] }
    ]
  },
  {
    state: 'Maharashtra',
    cities: [
      { name: 'Mumbai', localities: ['Bandra', 'Andheri', 'Powai', 'Colaba', 'Juhu'] },
      { name: 'Pune', localities: ['Koregaon Park', 'Kothrud', 'Viman Nagar', 'Hinjewadi'] }
    ]
  }
];

export const LocationSelectorModal = ({ isOpen, onClose }) => {
  const {
    location,
    setManualLocation,
    requestBrowserLocation,
    isGeoLoading,
    searchRadiusKm,
    setSearchRadius
  } = useLocationContext();

  const [selectedState, setSelectedState] = useState(location.state || 'Karnataka');
  const [selectedCity, setSelectedCity] = useState(location.city || 'Bengaluru');
  const [selectedLocality, setSelectedLocality] = useState(location.locality || 'Indiranagar');
  const [selectedRadius, setSelectedRadius] = useState(searchRadiusKm || 10);

  if (!isOpen) return null;

  const currentStateObj = INDIA_LOCATIONS.find((s) => s.state === selectedState) || INDIA_LOCATIONS[1];
  const currentCityObj = currentStateObj.cities.find((c) => c.name === selectedCity) || currentStateObj.cities[0];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const stateObj = INDIA_LOCATIONS.find((s) => s.state === newState);
    if (stateObj && stateObj.cities.length > 0) {
      setSelectedCity(stateObj.cities[0].name);
      setSelectedLocality(stateObj.cities[0].localities[0] || '');
    }
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    const cityObj = currentStateObj.cities.find((c) => c.name === newCity);
    if (cityObj && cityObj.localities.length > 0) {
      setSelectedLocality(cityObj.localities[0]);
    } else {
      setSelectedLocality('');
    }
  };

  const handleSave = () => {
    setManualLocation({
      country: 'India',
      state: selectedState,
      city: selectedCity,
      locality: selectedLocality,
      latitude: selectedCity === 'Guntur' ? 16.3067 : 12.9716,
      longitude: selectedCity === 'Guntur' ? 80.4365 : 77.5946
    });
    setSearchRadius(selectedRadius);
    if (onClose) onClose();
  };

  const handleGpsClick = () => {
    requestBrowserLocation();
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Select Your Location
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Discover reuse & borrow items in your local community
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Form Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Use GPS Button */}
          <button
            type="button"
            onClick={handleGpsClick}
            disabled={isGeoLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #10b981',
              color: '#047857',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)'
            }}
          >
            <Crosshair size={18} />
            <span>{isGeoLoading ? 'Detecting location...' : 'Use My Current GPS Location'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              OR SELECT MANUALLY
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* State Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
              State
            </label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              {INDIA_LOCATIONS.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
              City
            </label>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              {currentStateObj.cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locality / Area Dropdown */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>
              Locality / Area
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              {currentCityObj.localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Radius Pills */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={14} /> Maximum Search Radius
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 10, 25, 50].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => setSelectedRadius(rad)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    border: selectedRadius === rad ? '2px solid #059669' : '1px solid #cbd5e1',
                    backgroundColor: selectedRadius === rad ? '#ecfdf5' : '#ffffff',
                    color: selectedRadius === rad ? '#047857' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {rad} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} iconRight={Check}>
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectorModal;
