import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import LocationConfirmationModal from '../components/common/LocationConfirmationModal';

const LocationContext = createContext(null);

const STORAGE_KEY = 'looop_user_location';
const RADIUS_KEY = 'looop_search_radius';

/**
 * Fast offline Indian city coordinate resolver (0ms latency)
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

  const activeRequestSeqId = useRef(0);

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
   * Request fresh device position with immediate UI feedback and fast options
   */
  const requestFreshGPS = () => {
    if (isGeoLoading) return; // Prevent duplicate concurrent requests

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation service is not supported on this browser/device.');
      setLocationStatus('LOCATION_DENIED');
      return;
    }

    // Increment request sequence ID to prevent race conditions
    activeRequestSeqId.current += 1;
    const currentSeqId = activeRequestSeqId.current;

    // 1. Immediate UI state transition (0ms)
    setIsGeoLoading(true);
    setGeoError(null);
    setLocationStatus('LOCATION_REQUESTING_PERMISSION');

    // 2. Request browser location immediately with low-latency options
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Race condition check: ignore if user initiated a newer request/selection
        if (currentSeqId !== activeRequestSeqId.current) return;

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 0;

        // 3. Instant city resolution via bounding boxes (0ms)
        const city = resolveCityFromCoordinates(lat, lng);
        const state = resolveStateFromCoordinates(lat, lng);

        const rawLoc = {
          latitude: lat,
          longitude: lng,
          accuracy,
          name: city,
          city: city,
          state: state,
          locality: city,
          district: state,
          country: 'India',
          formattedAddress: `${city}, ${state}`,
          source: 'GPS',
          timestamp: Date.now()
        };

        // 4. Update pending state instantly
        setPendingLocation(rawLoc);
        setIsGeoLoading(false);
        setLocationStatus('LOCATION_CONFIRMATION');
        setShowConfirmationModal(true);

        // 5. Asynchronous background reverse geocoding (non-blocking)
        api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`)
          .then((res) => {
            if (currentSeqId !== activeRequestSeqId.current) return;
            if (res.data?.success && res.data.data) {
              const geo = res.data.data;
              setPendingLocation((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  locality: geo.locality && geo.locality !== 'Detected Area' ? geo.locality : prev.city,
                  state: geo.state || prev.state,
                  formattedAddress: geo.formattedAddress || prev.formattedAddress
                };
              });
            }
          })
          .catch((err) => {
            console.warn('[LocationContext] Background geocode notice:', err.message);
          });
      },
      (err) => {
        if (currentSeqId !== activeRequestSeqId.current) return;

        setIsGeoLoading(false);
        let msg = 'Unable to detect your location quickly. Please search manually.';
        if (err.code === 1) msg = 'Location permission was denied. Please search for your city manually.';
        else if (err.code === 2) msg = 'Position unavailable. Please search for your city manually.';
        else if (err.code === 3) msg = 'Location detection took too long. Please search for your city manually.';

        setGeoError(msg);
        setLocationStatus('LOCATION_DENIED');
      },
      {
        enableHighAccuracy: false, // Fast, low-latency city level detection
        timeout: 8000,            // Never hang indefinitely
        maximumAge: 300000         // Reuse recent 5-min browser location if available
      }
    );
  };

  /**
   * Confirm pending location from GPS modal
   */
  const confirmLocation = (locObj) => {
    const rawLoc = locObj || pendingLocation;
    if (!rawLoc) return;

    activeRequestSeqId.current += 1; // Invalidate any pending GPS callbacks

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
    activeRequestSeqId.current += 1; // Invalidate any pending GPS callbacks

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
