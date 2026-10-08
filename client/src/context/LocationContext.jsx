import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LocationConfirmationModal from '../components/common/LocationConfirmationModal';

const LocationContext = createContext(null);

const STORAGE_KEY = 'looop_user_location';
const RADIUS_KEY = 'looop_search_radius';

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(null);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [searchRadiusKm, setSearchRadiusKmState] = useState(10);
  const [locationStatus, setLocationStatus] = useState('LOCATION_UNKNOWN');
  const [geoError, setGeoError] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      // 1. Restore saved confirmed location from localStorage
      const savedLoc = localStorage.getItem(STORAGE_KEY);
      const savedRad = localStorage.getItem(RADIUS_KEY);

      if (savedRad) {
        setSearchRadiusKmState(Number(savedRad) || 10);
      }

      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed && (parsed.latitude || parsed.city || parsed.name)) {
          setLocationState(parsed);
          setLocationStatus(parsed.source === 'GPS' ? 'LOCATION_CONFIRMED' : 'LOCATION_MANUAL');
          return;
        }
      }

      // 2. Restore from user account profile if present
      const storedUserRaw = localStorage.getItem('looop_user');
      if (storedUserRaw) {
        const userObj = JSON.parse(storedUserRaw);
        if (userObj && (userObj.city || userObj.locality)) {
          const profileLoc = {
            name: userObj.city || 'Detected City',
            city: userObj.city || 'Detected City',
            state: userObj.state || '',
            locality: userObj.locality || userObj.area || '',
            country: 'India',
            latitude: userObj.latitude || 12.9784,
            longitude: userObj.longitude || 77.6408,
            source: 'PROFILE'
          };
          setLocationState(profileLoc);
          setLocationStatus('LOCATION_MANUAL');
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profileLoc));
          return;
        }
      }

      // If no valid stored location on first visit, open BookMyShow location selector modal
      setLocationStatus('LOCATION_UNKNOWN');
      setIsLocationModalOpen(true);
    } catch (err) {
      console.warn('[LocationContext] Init warning:', err);
      setLocationStatus('LOCATION_UNKNOWN');
    }
  }, []);

  /**
   * Request fresh high-accuracy device GPS position
   */
  const requestFreshGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation service is not supported on this browser/device.');
      setLocationStatus('LOCATION_DENIED');
      return;
    }

    setIsGeoLoading(true);
    setGeoError(null);
    setLocationStatus('LOCATION_REQUESTING_PERMISSION');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 0;

          setLocationStatus('LOCATION_REVERSE_GEOCODING');

          // Call server reverse geocoding proxy
          let geoResult = null;
          try {
            const res = await api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.data && res.data.success) {
              geoResult = res.data.data;
            }
          } catch (apiErr) {
            console.warn('[LocationContext] Reverse geocode API fallback notice:', apiErr.message);
          }

          const rawLoc = {
            latitude: lat,
            longitude: lng,
            accuracy,
            name: geoResult?.locality || geoResult?.city || 'Detected Area',
            city: geoResult?.city || 'Detected Area',
            state: geoResult?.state || '',
            locality: geoResult?.locality || geoResult?.city || '',
            district: geoResult?.district || '',
            country: geoResult?.country || 'India',
            postcode: geoResult?.postcode || '',
            formattedAddress: geoResult?.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            source: 'GPS',
            timestamp: Date.now()
          };

          setPendingLocation(rawLoc);
          setIsGeoLoading(false);
          setLocationStatus('LOCATION_CONFIRMATION');
          setShowConfirmationModal(true);
        } catch (err) {
          setIsGeoLoading(false);
          setGeoError('Failed to process location data. Please try again.');
          setLocationStatus('LOCATION_ERROR');
        }
      },
      (err) => {
        setIsGeoLoading(false);
        let msg = 'Location permission denied or device GPS unavailable.';
        if (err.code === 1) msg = 'Location access was denied. Please allow location permissions in your browser.';
        else if (err.code === 2) msg = 'Position unavailable. Please ensure your device GPS is turned on.';
        else if (err.code === 3) msg = 'GPS acquisition timed out. Please try again in an open space.';
        setGeoError(msg);
        setLocationStatus('LOCATION_DENIED');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Confirm pending location from GPS modal
   */
  const confirmLocation = (locObj) => {
    const finalLoc = locObj || pendingLocation;
    if (!finalLoc) return;

    setLocationState(finalLoc);
    setPendingLocation(null);
    setShowConfirmationModal(false);
    setIsLocationModalOpen(false);
    setLocationStatus('LOCATION_CONFIRMED');

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalLoc));
    } catch (e) {}
  };

  /**
   * Set location manually from BookMyShow location selector
   */
  const setManualLocation = (locData) => {
    const manualLoc = {
      name: locData.name || locData.city || 'Custom Area',
      city: locData.city || locData.name || 'Custom Area',
      state: locData.state || '',
      locality: locData.locality || locData.area || locData.name || '',
      district: locData.district || '',
      country: locData.country || 'India',
      latitude: locData.latitude || null,
      longitude: locData.longitude || null,
      accuracy: 0,
      source: 'MANUAL',
      timestamp: Date.now()
    };

    setLocationState(manualLoc);
    setPendingLocation(null);
    setShowConfirmationModal(false);
    setIsLocationModalOpen(false);
    setLocationStatus('LOCATION_MANUAL');

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(manualLoc));
    } catch (e) {}
  };

  /**
   * Set search radius in KM
   */
  const setSearchRadius = (radiusKm) => {
    const rad = Number(radiusKm) || 10;
    setSearchRadiusKmState(rad);
    try {
      localStorage.setItem(RADIUS_KEY, String(rad));
    } catch (e) {}
  };

  const displayLocationText = location
    ? (location.city ? location.city : location.name)
    : 'Select Location';

  const value = {
    location,
    pendingLocation,
    locationStatus,
    searchRadiusKm,
    isGeoLoading,
    geoError,
    showConfirmationModal,
    isLocationModalOpen,
    openLocationModal: () => setIsLocationModalOpen(true),
    closeLocationModal: () => setIsLocationModalOpen(false),
    requestFreshGPS,
    requestBrowserLocation: requestFreshGPS,
    confirmLocation,
    setManualLocation,
    changeLocation: () => setIsLocationModalOpen(true),
    setSearchRadius,
    closeConfirmationModal: () => setShowConfirmationModal(false),
    displayLocationText
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
      <LocationConfirmationModal
        isOpen={showConfirmationModal}
        pendingLocation={pendingLocation}
        isDetecting={isGeoLoading}
        geoError={geoError}
        onConfirm={confirmLocation}
        onRetryGPS={requestFreshGPS}
        onChangeManual={() => {
          setShowConfirmationModal(false);
          setIsLocationModalOpen(true);
        }}
        onClose={() => setShowConfirmationModal(false)}
      />
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
