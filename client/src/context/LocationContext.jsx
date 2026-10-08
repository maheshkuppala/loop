import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LocationConfirmationModal from '../components/common/LocationConfirmationModal';

const LocationContext = createContext(null);

const STORAGE_KEY = 'looop_user_location';
const RADIUS_KEY = 'looop_search_radius';

/**
 * Fast offline Indian city coordinate resolver
 */
function resolveCityFromCoordinates(lat, lng) {
  if (!lat || !lng) return 'Guntur';
  if (lat >= 16.0 && lat <= 16.45 && lng >= 80.1 && lng <= 80.6) return 'Guntur';
  if (lat >= 16.45 && lat <= 16.75 && lng >= 80.5 && lng <= 80.8) return 'Vijayawada';
  if (lat >= 17.5 && lat <= 17.9 && lng >= 83.1 && lng <= 83.4) return 'Visakhapatnam';
  if (lat >= 13.5 && lat <= 13.7 && lng >= 79.3 && lng <= 79.6) return 'Tirupati';
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) return 'Hyderabad';
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'Bengaluru';
  if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.3) return 'Chennai';
  if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.0) return 'Mumbai';
  if (lat >= 18.4 && lat <= 18.7 && lng >= 73.7 && lng <= 74.0) return 'Pune';
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.9 && lng <= 77.4) return 'Delhi';
  return 'Guntur';
}

function resolveStateFromCoordinates(lat, lng) {
  if (!lat || !lng) return 'Andhra Pradesh';
  if (lat >= 15.5 && lat <= 17.0 && lng >= 79.5 && lng <= 81.5) return 'Andhra Pradesh';
  if (lat >= 17.0 && lat <= 18.5 && lng >= 77.5 && lng <= 79.5) return 'Telangana';
  if (lat >= 11.5 && lat <= 15.0 && lng >= 74.0 && lng <= 78.5) return 'Karnataka';
  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.0 && lng <= 80.5) return 'Tamil Nadu';
  if (lat >= 15.5 && lat <= 22.0 && lng >= 72.5 && lng <= 80.0) return 'Maharashtra';
  if (lat >= 28.0 && lat <= 29.0 && lng >= 76.5 && lng <= 77.8) return 'Delhi';
  return 'Andhra Pradesh';
}

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
          let cleanCity = parsed.city || parsed.name;
          if (!cleanCity || cleanCity === 'Detected Area' || cleanCity === 'Current Location') {
            cleanCity = resolveCityFromCoordinates(parsed.latitude, parsed.longitude);
          }
          const cleanLoc = {
            ...parsed,
            name: cleanCity,
            city: cleanCity
          };
          setLocationState(cleanLoc);
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
            name: userObj.city || 'Guntur',
            city: userObj.city || 'Guntur',
            state: userObj.state || 'Andhra Pradesh',
            locality: userObj.locality || userObj.area || 'Guntur',
            country: 'India',
            latitude: userObj.latitude || 16.3067,
            longitude: userObj.longitude || 80.4365,
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

          const fallbackCity = resolveCityFromCoordinates(lat, lng);
          const fallbackState = resolveStateFromCoordinates(lat, lng);

          // Call server reverse geocoding proxy
          let geoResult = null;
          try {
            const res = await api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.data && res.data.success) {
              geoResult = res.data.data;
            }
          } catch (apiErr) {
            console.warn('[LocationContext] Reverse geocode API notice:', apiErr.message);
          }

          let city = geoResult?.city;
          if (!city || city === 'Detected Area' || city === 'Current Location') {
            city = fallbackCity;
          }

          let state = geoResult?.state || fallbackState;
          let locality = geoResult?.locality && geoResult.locality !== 'Detected Area' ? geoResult.locality : city;

          const rawLoc = {
            latitude: lat,
            longitude: lng,
            accuracy,
            name: city,
            city: city,
            state: state,
            locality: locality,
            district: geoResult?.district || state,
            country: geoResult?.country || 'India',
            postcode: geoResult?.postcode || '',
            formattedAddress: `${locality}, ${city}, ${state}`,
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
    const rawLoc = locObj || pendingLocation;
    if (!rawLoc) return;

    let city = rawLoc.city;
    if (!city || city === 'Detected Area' || city === 'Current Location') {
      city = resolveCityFromCoordinates(rawLoc.latitude, rawLoc.longitude);
    }

    let state = rawLoc.state || resolveStateFromCoordinates(rawLoc.latitude, rawLoc.longitude);
    let locality = rawLoc.locality && rawLoc.locality !== 'Detected Area' ? rawLoc.locality : city;

    const finalLoc = {
      ...rawLoc,
      name: city,
      city: city,
      locality: locality,
      state: state,
      country: rawLoc.country || 'India',
      source: 'GPS',
      timestamp: Date.now()
    };

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
    let cityName = locData.city || locData.name;
    if (!cityName || cityName === 'Detected Area' || cityName === 'Custom Area') {
      cityName = resolveCityFromCoordinates(locData.latitude, locData.longitude);
    }

    const manualLoc = {
      name: cityName,
      city: cityName,
      state: locData.state || resolveStateFromCoordinates(locData.latitude, locData.longitude),
      locality: locData.locality || cityName,
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

  const getCleanLocationText = (loc) => {
    if (!loc) return 'Select Location';
    const text = loc.city || loc.name || loc.locality;
    if (!text || text === 'Detected Area' || text === 'Detected City' || text === 'Custom Area') {
      return resolveCityFromCoordinates(loc.latitude, loc.longitude);
    }
    return text;
  };

  const displayLocationText = getCleanLocationText(location);

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
