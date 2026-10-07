import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { ShieldCheck, MapPin, ExternalLink, Tag, Sparkles } from 'lucide-react';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom colored community marker
const createCommunityIcon = (color = '#059669') => {
  return L.divIcon({
    className: 'custom-community-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32]
  });
};

export const BrowseMap = ({
  items = [],
  userCoordinates = null, // [lat, lng]
  radiusKm = 25,
  centerLocation = 'Community Area'
}) => {
  // Determine center coordinates [lat, lng]
  // Default to user coordinates, or first item coordinates, or Bengaluru
  let defaultCenter = [12.9716, 77.5946];
  if (userCoordinates && userCoordinates.length === 2 && !isNaN(userCoordinates[0])) {
    defaultCenter = userCoordinates;
  } else if (items.length > 0 && items[0].locationCoordinates?.coordinates) {
    const coords = items[0].locationCoordinates.coordinates;
    defaultCenter = [coords[1], coords[0]]; // GeoJSON [lng, lat] -> Leaflet [lat, lng]
  }

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-slate-200)',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Privacy Guarantee Header */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#059669" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
            Privacy Protected Discovery
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
            • Approximate neighborhood areas only (never exact private addresses)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {radiusKm} km search radius
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontWeight: 600 }}>
            {items.length} items mapped
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height: '520px', width: '100%', position: 'relative' }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Search Radius Ring */}
          {userCoordinates && (
            <Circle
              center={userCoordinates}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#059669',
                fillColor: '#10b981',
                fillOpacity: 0.08,
                dashArray: '6, 8',
                weight: 1.5
              }}
            />
          )}

          {/* Item Markers with Approximate Locations */}
          {items.map((item) => {
            const coords = item.locationCoordinates?.coordinates;
            if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) {
              return null;
            }
            // GeoJSON order [longitude, latitude] -> Leaflet [latitude, longitude]
            const position = [coords[1], coords[0]];
            const primaryImg =
              item.images && item.images.length > 0
                ? typeof item.images[0] === 'string'
                  ? item.images[0]
                  : item.images[0].url
                : 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80';

            return (
              <Marker
                key={item._id || item.id}
                position={position}
                icon={createCommunityIcon(item.sharingType === 'free' ? '#059669' : '#2563eb')}
              >
                <Popup className="looop-map-popup">
                  <div style={{ maxWidth: '220px', padding: '4px' }}>
                    <div
                      style={{
                        height: '110px',
                        width: '100%',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        marginBottom: '8px',
                        backgroundColor: '#e2e8f0'
                      }}
                    >
                      <img
                        src={primaryImg}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        margin: '0 0 4px 0',
                        color: 'var(--color-slate-900)',
                        lineHeight: 1.2
                      }}
                    >
                      {item.title}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--color-slate-600)',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {item.sharingType?.replace('_', ' ')}
                      </span>
                      {item.distanceKm !== null && item.distanceKm !== undefined && (
                        <span style={{ color: '#059669', fontWeight: 700 }}>
                          ~{item.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--color-slate-500)',
                        marginBottom: '8px'
                      }}
                    >
                      <MapPin size={12} />
                      <span>{item.location?.locality || item.location?.city || 'Local area'}</span>
                    </div>
                    <Link
                      to={`/items/${item._id || item.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '6px 12px',
                        backgroundColor: 'var(--color-primary-600, #059669)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <span>View Listing</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default BrowseMap;
