import React, { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';

// Fix Leaflet default icon path issues in Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export const LeafletLocationPreview = ({
  city = 'Bengaluru',
  locality = 'Indiranagar',
  coordinates = [12.9716, 77.5946] // [lat, lng]
}) => {
  const [mapCenter, setMapCenter] = useState(coordinates);
  const [mapKey, setMapKey] = useState(0);

  // Approximate coordinate lookup for common areas to reflect city changes smoothly
  useEffect(() => {
    const defaultCoordsMap = {
      bengaluru: [12.9716, 77.5946],
      mumbai: [19.076, 72.8777],
      delhi: [28.6139, 77.209],
      hyderabad: [17.385, 78.4867],
      chennai: [13.0827, 80.2707],
      pune: [18.5204, 73.8567],
      kolkata: [22.5726, 88.3639],
      ahmedabad: [23.0225, 72.5714]
    };

    const cleanCity = city?.toLowerCase().trim();
    if (cleanCity && defaultCoordsMap[cleanCity]) {
      setMapCenter(defaultCoordsMap[cleanCity]);
      setMapKey((prev) => prev + 1);
    } else if (coordinates && coordinates.length === 2 && !isNaN(coordinates[0])) {
      setMapCenter(coordinates);
      setMapKey((prev) => prev + 1);
    }
  }, [city, locality]);

  const displayLocation = locality ? `${locality}, ${city}` : city || 'Community Area';

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--color-slate-200)',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Privacy guarantee header */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Approximate Discovery Zone</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 500 }}>
          Exact address is never shown
        </span>
      </div>

      {/* Map Canvas with translucent Radar / Radius Circle */}
      <div style={{ height: '170px', width: '100%', position: 'relative' }}>
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Privacy-Preserving Translucent Radar Circle (approx. 800 meters radius) */}
          <Circle
            center={mapCenter}
            radius={850}
            pathOptions={{
              color: '#059669',
              fillColor: '#10b981',
              fillOpacity: 0.22,
              weight: 2,
              dashArray: '4, 4'
            }}
          />
        </MapContainer>

        {/* Overlay Chip */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            zIndex: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-slate-800)'
          }}
        >
          <MapPin size={13} color="#059669" />
          <span>~1 km radius around {displayLocation}</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletLocationPreview;
