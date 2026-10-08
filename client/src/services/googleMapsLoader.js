import { Loader } from '@googlemaps/js-api-loader';

/**
 * Centralized Google Maps Loader & Utility Service for LOOOP
 * Ensures API key is read exclusively from import.meta.env.VITE_GOOGLE_MAPS_API_KEY.
 * Handles loading, singleton instance management, auth failure detection, and privacy rounding.
 */

let loaderInstance = null;
let googleMapsPromise = null;
let loadStatus = 'unloaded'; // 'unloaded' | 'loading' | 'loaded' | 'error'
let loadError = null;
const errorListeners = new Set();

// Listen for Google Maps Authentication Errors globally (e.g. invalid key, referrer restriction)
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    console.error('[LOOOP Google Maps] Authentication failed. Check VITE_GOOGLE_MAPS_API_KEY restrictions or validity.');
    loadStatus = 'error';
    loadError = 'Google Maps Authentication Failed. Please verify VITE_GOOGLE_MAPS_API_KEY.';
    errorListeners.forEach((listener) => listener(loadError));
  };
}

export const getGoogleMapsApiKey = () => {
  return import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';
};

export const getGoogleMapsStatus = () => loadStatus;
export const getGoogleMapsError = () => loadError;

export const subscribeGoogleMapsError = (callback) => {
  errorListeners.add(callback);
  return () => errorListeners.delete(callback);
};

export const loadGoogleMaps = () => {
  if (loadStatus === 'loaded' && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    loadStatus = 'error';
    loadError = 'Google Maps API key is missing or not configured in environment.';
    return Promise.reject(new Error(loadError));
  }

  loadStatus = 'loading';

  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  googleMapsPromise = loaderInstance
    .load()
    .then(() => {
      loadStatus = 'loaded';
      loadError = null;
      return window.google.maps;
    })
    .catch((err) => {
      loadStatus = 'error';
      loadError = err?.message || 'Failed to load Google Maps SDK';
      console.error('[LOOOP Google Maps Loader Error]', err);
      googleMapsPromise = null;
      throw err;
    });

  return googleMapsPromise;
};

/**
 * Privacy Protection Utility: Approximate Coordinates
 * Jitters precise coordinates by up to ~300-500 meters to ensure private customer
 * residential addresses are NEVER stored or publicly displayed.
 */
export const approximateCoordinates = (lat, lng, jitterRadiusMeters = 350) => {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return [12.9716, 77.5946]; // Default to Bengaluru city center
  }

  // 1 degree latitude ~ 111,000 meters
  const latOffset = ((Math.random() - 0.5) * 2 * jitterRadiusMeters) / 111000;
  // 1 degree longitude ~ 111,000 * cos(lat)
  const lngOffset =
    ((Math.random() - 0.5) * 2 * jitterRadiusMeters) /
    (111000 * Math.cos((lat * Math.PI) / 180));

  return [
    Number((lat + latOffset).toFixed(5)),
    Number((lng + lngOffset).toFixed(5))
  ];
};

/**
 * Calculate distance in kilometers between two coordinates
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null || isNaN(v))) {
    return null;
  }

  if (window.google?.maps?.geometry?.spherical) {
    const p1 = new window.google.maps.LatLng(lat1, lon1);
    const p2 = new window.google.maps.LatLng(lat2, lon2);
    const meters = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    return Number((meters / 1000).toFixed(1));
  }

  // Haversine fallback formula
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};
