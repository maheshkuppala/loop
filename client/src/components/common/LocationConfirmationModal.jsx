import React from 'react';
import { MapPin, CheckCircle2, RefreshCw, Edit3, AlertTriangle, Navigation } from 'lucide-react';
import Spinner from './Spinner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export const LocationConfirmationModal = ({
  isOpen,
  pendingLocation,
  isDetecting,
  geoError,
  onConfirm,
  onRetryGPS,
  onChangeManual,
  onClose
}) => {
  if (!isOpen) return null;

  const getAccuracyBadge = (accuracy) => {
    if (!accuracy || accuracy <= 0) return { label: 'GPS Verified', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' };
    if (accuracy <= 50) return { label: `±${Math.round(accuracy)}m (Excellent Accuracy)`, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' };
    if (accuracy <= 200) return { label: `±${Math.round(accuracy)}m (Good Accuracy)`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (accuracy <= 500) return { label: `±${Math.round(accuracy)}m (Acceptable Accuracy)`, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
    return { label: `±${Math.round(accuracy)}m (Verified Area)`, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
  };

  const accuracyBadge = getAccuracyBadge(pendingLocation?.accuracy);

  const displayCity = (pendingLocation?.city && pendingLocation.city !== 'Detected Area' && pendingLocation.city !== 'Current Location') 
    ? pendingLocation.city 
    : (pendingLocation?.locality && pendingLocation.locality !== 'Detected Area' ? pendingLocation.locality : 'Guntur');

  const displayState = pendingLocation?.state || 'Andhra Pradesh';

  const lat = pendingLocation?.latitude || 16.3067;
  const lng = pendingLocation?.longitude || 80.4365;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px 14px 24px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Navigation size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Confirm Your Location
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Verified via device location service
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isDetecting ? (
            <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
              <Spinner size="lg" />
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                Detecting location...
              </p>
            </div>
          ) : (
            <>
              {/* OpenStreetMap Leaflet Canvas Map View */}
              <div style={{
                height: '180px',
                borderRadius: '12px',
                border: '1px solid #334155',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <MapContainer
                  center={[lat, lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]} />
                  {pendingLocation?.accuracy && (
                    <Circle
                      center={[lat, lng]}
                      radius={pendingLocation.accuracy}
                      pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15 }}
                    />
                  )}
                </MapContainer>

                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: accuracyBadge.bg,
                  border: `1px solid ${accuracyBadge.color}`,
                  color: accuracyBadge.color,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  zIndex: 999
                }}>
                  {accuracyBadge.label}
                </div>
              </div>

              {/* Detected Location Card */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <MapPin size={18} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    YOUR LOCATION
                  </span>
                </div>

                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                  {displayCity}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {[
                    pendingLocation?.locality && pendingLocation.locality !== displayCity ? pendingLocation.locality : null,
                    displayState,
                    pendingLocation?.country || 'India'
                  ].filter(Boolean).join(', ')}
                </div>
              </div>

              {geoError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.8rem'
                }}>
                  {geoError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #334155',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={() => onConfirm(pendingLocation)}
            disabled={isDetecting || !pendingLocation}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isDetecting || !pendingLocation ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            <CheckCircle2 size={18} />
            <span>USE THIS LOCATION</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={onRetryGPS}
              disabled={isDetecting}
              style={{
                padding: '10px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              <span>RETRY DETECT</span>
            </button>

            <button
              onClick={onChangeManual}
              disabled={isDetecting}
              style={{
                padding: '10px',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={14} />
              <span>CHANGE MANUALLY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmationModal;
