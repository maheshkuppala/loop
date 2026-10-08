import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

const STORAGE_KEY = 'looop_user_location';
const RADIUS_KEY = 'looop_search_radius';

const DEFAULT_LOCATION = {
  city: 'Bengaluru',
  state: 'Karnataka',
  locality: 'Indiranagar',
  country: 'India',
  latitude: 12.9784,
  longitude: 77.6408,
  source: 'DEFAULT'
};

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [searchRadiusKm, setSearchRadiusKmState] = useState(10);
  const [locationStatus, setLocationStatus] = useState('LOCATION_CHECKING'); // 'LOCATION_CHECKING' | 'LOCATION_RESOLVED' | 'LOCATION_MANUAL_SELECTION' | 'LOCATION_DENIED'
  const [geoError, setGeoError] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  useEffect(() => {
    try {
      // 1. Try restoring previously saved location
      const savedLoc = localStorage.getItem(STORAGE_KEY);
      const savedRad = localStorage.getItem(RADIUS_KEY);

      if (savedRad) {
        setSearchRadiusKmState(Number(savedRad) || 10);
      }

      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed && (parsed.city || parsed.latitude)) {
          setLocationState(parsed);
          setLocationStatus('LOCATION_RESOLVED');
          return;
        }
      }

      // 2. Try restoring user profile location if available
      const storedUserRaw = localStorage.getItem('looop_user');
      if (storedUserRaw) {
        const userObj = JSON.parse(storedUserRaw);
        if (userObj && userObj.city) {
          const profileLoc = {
            city: userObj.city,
            state: userObj.state || 'Karnataka',
            locality: userObj.locality || userObj.area || '',
            country: 'India',
            latitude: userObj.city === 'Guntur' ? 16.3067 : 12.9716,
            longitude: userObj.city === 'Guntur' ? 80.4365 : 77.5946,
            source: 'PROFILE'
          };
          setLocationState(profileLoc);
          setLocationStatus('LOCATION_RESOLVED');
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profileLoc));
          return;
        }
      }

      // 3. Otherwise prompt for location
      setLocationStatus('LOCATION_MANUAL_SELECTION');
    } catch (err) {
      console.warn('[LocationContext] Initialization notice:', err);
      setLocationStatus('LOCATION_MANUAL_SELECTION');
    }
  }, []);

  const saveLocation = (locObj) => {
    setLocationState(locObj);
    setLocationStatus('LOCATION_RESOLVED');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locObj));
    } catch (e) {}
  };

  const requestBrowserLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setLocationStatus('LOCATION_DENIED');
      return;
    }

    setIsGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeoLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const gpsLoc = {
          city: 'Bengaluru',
          locality: 'Near your GPS location',
          state: 'Karnataka',
          country: 'India',
          latitude: lat,
          longitude: lng,
          source: 'GPS'
        };

        saveLocation(gpsLoc);
      },
      (err) => {
        setIsGeoLoading(false);
        console.warn('Geolocation permission error:', err.message);
        setGeoError('Location permission denied or unavailable. Please choose your city manually.');
        setLocationStatus('LOCATION_DENIED');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const setManualLocation = (locData) => {
    const lat = locData.latitude || (locData.city === 'Guntur' ? 16.3067 : 12.9716);
    const lng = locData.longitude || (locData.city === 'Guntur' ? 80.4365 : 77.5946);

    const manualLoc = {
      city: locData.city || 'Bengaluru',
      state: locData.state || 'Karnataka',
      locality: locData.locality || locData.area || '',
      country: locData.country || 'India',
      latitude: lat,
      longitude: lng,
      source: 'MANUAL'
    };

    saveLocation(manualLoc);
  };

  const changeLocation = () => {
    setLocationStatus('LOCATION_MANUAL_SELECTION');
  };

  const setSearchRadius = (radiusKm) => {
    const rad = Number(radiusKm) || 10;
    setSearchRadiusKmState(rad);
    try {
      localStorage.setItem(RADIUS_KEY, String(rad));
    } catch (e) {}
  };

  const value = {
    location,
    locationStatus,
    searchRadiusKm,
    isGeoLoading,
    geoError,
    requestBrowserLocation,
    setManualLocation,
    changeLocation,
    setSearchRadius,
    displayLocationText: `${location.locality ? location.locality + ', ' : ''}${location.city || 'Bengaluru'}`
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
