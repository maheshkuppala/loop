import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * React Hook for Route Calculations
 * Communicates with backend /api/maps/route endpoint to calculate real distance & duration.
 */
export const useRoute = () => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRoute = useCallback(async ({ origin, destination, travelMode = 'DRIVE' }) => {
    if (!origin?.latitude || !origin?.longitude || !destination?.latitude || !destination?.longitude) {
      setError('Origin and destination coordinates are required.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/maps/route', {
        origin: { latitude: Number(origin.latitude), longitude: Number(origin.longitude) },
        destination: { latitude: Number(destination.latitude), longitude: Number(destination.longitude) },
        travelMode
      });

      if (res.data?.success && res.data?.routeAvailable) {
        setRoute(res.data);
        setLoading(false);
        return res.data;
      } else {
        const msg = res.data?.message || 'Route could not be calculated.';
        setError(msg);
        setLoading(false);
        return null;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to communicate with route service.';
      setError(msg);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    route,
    loading,
    error,
    calculateRoute,
    clearRoute: () => setRoute(null)
  };
};

export default useRoute;
