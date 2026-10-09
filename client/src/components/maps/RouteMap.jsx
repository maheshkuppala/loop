import React, { useState, useEffect } from 'react';
import { Navigation, Car, Footprints, Bike, Bus, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import GoogleMap from './GoogleMap';

/**
 * RouteMap Component for LOOOP Handover / Directions
 * Calls real backend Google Routes API endpoint (/api/maps/route)
 * Displays origin/destination markers, real polyline, exact distance, and estimated travel duration.
 */
export const RouteMap = ({
  origin = null, // { latitude, longitude, label }
  destination = null, // { latitude, longitude, label }
  height = '450px'
}) => {
  const [travelMode, setTravelMode] = useState('DRIVE');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoute = async (mode = travelMode) => {
    if (!origin?.latitude || !origin?.longitude || !destination?.latitude || !destination?.longitude) {
      setError('Origin or destination coordinates are missing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/maps/route', {
        origin: { latitude: Number(origin.latitude), longitude: Number(origin.longitude) },
        destination: { latitude: Number(destination.latitude), longitude: Number(destination.longitude) },
        travelMode: mode
      });

      if (res.data && res.data.success && res.data.routeAvailable) {
        setRouteData(res.data);
      } else {
        setError(res.data?.message || 'No valid route found between these locations.');
      }
    } catch (err) {
      console.error('[RouteMap] Route fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to calculate route from Google Maps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      fetchRoute(travelMode);
    }
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude]);

  const handleModeChange = (mode) => {
    setTravelMode(mode);
    fetchRoute(mode);
  };

  const markers = [];
  if (origin?.latitude && origin?.longitude) {
    markers.push({
      id: 'origin-marker',
      latitude: origin.latitude,
      longitude: origin.longitude,
      title: origin.label || 'Start Location',
      color: '#0284c7'
    });
  }
  if (destination?.latitude && destination?.longitude) {
    markers.push({
      id: 'dest-marker',
      latitude: destination.latitude,
      longitude: destination.longitude,
      title: destination.label || 'LOOOP Pickup Zone',
      color: '#059669'
    });
  }

  const mapCenter = origin?.latitude && origin?.longitude
    ? [origin.latitude, origin.longitude]
    : [12.9716, 77.5946];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Travel Mode Selector & Metric Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          backgroundColor: '#ffffff',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'DRIVE', label: 'Driving', icon: Car },
            { id: 'WALK', label: 'Walking', icon: Footprints },
            { id: 'BICYCLE', label: 'Cycling', icon: Bike },
            { id: 'TRANSIT', label: 'Transit', icon: Bus }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = travelMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleModeChange(mode.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                  color: isSelected ? '#047857' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={14} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real Distance & Duration Badges */}
        {routeData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: 800 }}>
              <Navigation size={15} color="#059669" />
              {routeData.distanceText}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 600 }}>
              <Clock size={15} color="#0284c7" />
              {routeData.durationText}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Map Display */}
      <GoogleMap
        center={mapCenter}
        zoom={13}
        markers={markers}
        polyline={routeData?.polyline || ''}
        height={height}
      />
    </div>
  );
};

export default RouteMap;
