import { loadGoogleMaps, getGoogleMapsApiKey } from './googleMapsLoader';
import api from './api';

/**
 * Dev-Only Google Maps Diagnostics Utility
 * Checks key configuration, API loading status, library availability,
 * and backend route endpoint health. Safe for production (no secrets printed).
 */
export const runGoogleMapsDiagnostics = async () => {
  const diagnostics = {
    apiKeyConfigured: false,
    apiKeyMasked: 'Missing',
    mapsLoaded: false,
    placesAvailable: false,
    geocoderAvailable: false,
    routeEndpointAvailable: false,
    errors: []
  };

  const key = getGoogleMapsApiKey();
  if (key && key !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    diagnostics.apiKeyConfigured = true;
    diagnostics.apiKeyMasked = `${key.slice(0, 6)}...${key.slice(-4)}`;
  } else {
    diagnostics.errors.push('VITE_GOOGLE_MAPS_API_KEY is missing or unconfigured in client environment.');
  }

  try {
    const maps = await loadGoogleMaps();
    diagnostics.mapsLoaded = true;
    diagnostics.placesAvailable = !!maps.places;
    diagnostics.geocoderAvailable = !!maps.Geocoder;
  } catch (err) {
    diagnostics.errors.push(`Maps SDK Load Failure: ${err?.message || 'Unknown error'}`);
  }

  try {
    const routeCheck = await api.get('/maps/route', {
      params: {
        originLat: 12.9716,
        originLng: 77.5946,
        destLat: 12.9352,
        destLng: 77.6245
      }
    });
    if (routeCheck.data?.success || routeCheck.data?.routeAvailable) {
      diagnostics.routeEndpointAvailable = true;
    }
  } catch (err) {
    // If status is 400 or 503, endpoint exists but returned expected error
    if (err.response?.status === 400 || err.response?.status === 503) {
      diagnostics.routeEndpointAvailable = true;
    } else {
      diagnostics.errors.push(`Backend Route API Check: ${err.message}`);
    }
  }

  if (import.meta.env.DEV) {
    console.group('[LOOOP Google Maps Diagnostics]');
    console.log('API Key Configured:', diagnostics.apiKeyConfigured ? `YES (${diagnostics.apiKeyMasked})` : 'NO');
    console.log('Maps JS API Loaded:', diagnostics.mapsLoaded ? 'YES' : 'NO');
    console.log('Places Library:', diagnostics.placesAvailable ? 'YES' : 'NO');
    console.log('Geocoder Service:', diagnostics.geocoderAvailable ? 'YES' : 'NO');
    console.log('Backend Route Endpoint:', diagnostics.routeEndpointAvailable ? 'REACHABLE' : 'UNREACHABLE');
    if (diagnostics.errors.length > 0) {
      console.warn('Diagnostic Errors:', diagnostics.errors);
    }
    console.groupEnd();
  }

  return diagnostics;
};
