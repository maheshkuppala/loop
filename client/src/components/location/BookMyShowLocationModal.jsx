import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocationContext } from '../../context/LocationContext';
import api from '../../services/api';

const DEFAULT_POPULAR = [
  { name: 'Guntur', city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi', city: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 }
];

export const BookMyShowLocationModal = ({ isOpen, onClose }) => {
  const {
    location,
    setManualLocation,
    requestFreshGPS,
    isGeoLoading,
    geoError
  } = useLocationContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [popularCities, setPopularCities] = useState(DEFAULT_POPULAR);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Fetch popular cities on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchPopular = async () => {
      try {
        const res = await api.get('/location/popular');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setPopularCities(res.data.data);
        }
      } catch (err) {
        // Fallback to default list
      }
    };
    fetchPopular();

    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 120);
  }, [isOpen]);

  // Debounced autocomplete search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/location/search?q=${encodeURIComponent(q)}`);
        if (res.data?.success) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectLocation = (locObj) => {
    const cityName = locObj.city || locObj.name || 'Guntur';
    const finalLoc = {
      name: cityName,
      city: cityName,
      locality: locObj.locality || cityName,
      state: locObj.state || '',
      country: locObj.country || 'India',
      latitude: locObj.latitude || 16.3067,
      longitude: locObj.longitude || 80.4365,
      source: locObj.source || 'MANUAL'
    };

    setManualLocation(finalLoc);
    if (onClose) onClose();
  };

  const handleDetectGPS = () => {
    if (isGeoLoading) return;
    // Call browser GPS immediately; modal stays open until coordinates arrive
    requestFreshGPS();
  };

  const currentCityName = location?.city || location?.name || '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem 1rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                Select Location
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Find products available near you
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Input Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city or area (e.g. Guntur, Brodipet)..."
              style={{
                width: '100%',
                padding: '12px 40px 12px 42px',
                borderRadius: '14px',
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Immediate Feedback Detect Location Button */}
          {!searchQuery && (
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isGeoLoading}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '14px',
                backgroundColor: isGeoLoading ? '#f1f5f9' : '#ecfdf5',
                border: isGeoLoading ? '1.5px solid #cbd5e1' : '1.5px solid #a7f3d0',
                color: isGeoLoading ? '#64748b' : '#047857',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isGeoLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: isGeoLoading ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.08)'
              }}
            >
              {isGeoLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Detecting location...</span>
                </>
              ) : (
                <>
                  <Navigation size={18} color="#059669" />
                  <span>Detect my location</span>
                </>
              )}
            </button>
          )}

          {geoError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#dc2626',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{geoError}</span>
            </div>
          )}

          {/* Search Autocomplete Results */}
          {searchQuery ? (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
              </div>

              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {searchResults.map((item, idx) => (
                    <button
                      key={item._id || idx}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={18} color="#10b981" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px' }}>
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              ) : !isSearching ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                  No locations found matching "{searchQuery}". Try typing another city or area name.
                </div>
              ) : null}
            </div>
          ) : (
            /* Popular Locations Grid */
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Popular Locations
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                {popularCities.map((pop) => {
                  const popName = pop.name || pop.city || '';
                  const isSelected = currentCityName && popName && currentCityName.toLowerCase() === popName.toLowerCase();
                  return (
                    <button
                      key={popName}
                      type="button"
                      onClick={() => handleSelectLocation(pop)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                        color: isSelected ? '#047857' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Building2 size={18} color={isSelected ? '#10b981' : '#64748b'} />
                      <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{popName}</span>
                      {isSelected && (
                        <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BookMyShowLocationModal;
