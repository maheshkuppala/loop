import { useState, useEffect } from 'react';
import { loadGoogleMaps, getGoogleMapsStatus, getGoogleMapsError, subscribeGoogleMapsError } from '../services/googleMapsLoader';
import { runGoogleMapsDiagnostics } from '../services/googleMapsDiagnostics';

/**
 * React Hook for Google Maps Platform Integration
 * Provides loader status, google.maps instance, error state, and dev diagnostics.
 */
export const useGoogleMaps = () => {
  const [maps, setMaps] = useState(window.google?.maps || null);
  const [status, setStatus] = useState(getGoogleMapsStatus());
  const [error, setError] = useState(getGoogleMapsError());

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeGoogleMapsError((err) => {
      if (mounted) {
        setStatus('error');
        setError(err);
      }
    });

    loadGoogleMaps()
      .then((mapsInstance) => {
        if (mounted) {
          setMaps(mapsInstance);
          setStatus('loaded');
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setStatus('error');
          setError(err?.message || 'Failed to load Google Maps SDK');
        }
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    maps,
    isLoaded: status === 'loaded' && !!maps,
    isLoading: status === 'loading',
    isError: status === 'error',
    error,
    runDiagnostics: runGoogleMapsDiagnostics
  };
};

export default useGoogleMaps;
