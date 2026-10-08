import React from 'react';
import { MapPin, CheckCircle2, RefreshCw, Edit3, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import Spinner from './Spinner';

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
    if (!accuracy || accuracy <= 0) return { label: 'Approximate', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    if (accuracy <= 50) return { label: `±${Math.round(accuracy)}m (Excellent Accuracy)`, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' };
    if (accuracy <= 200) return { label: `±${Math.round(accuracy)}m (Good Accuracy)`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (accuracy <= 500) return { label: `±${Math.round(accuracy)}m (Acceptable Accuracy)`, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
    return { label: `±${Math.round(accuracy)}m (Low Accuracy Warning)`, color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' };
  };

  const accuracyBadge = getAccuracyBadge(pendingLocation?.accuracy);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Navigation size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Confirm Your Location
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Verified via device GPS & reverse geocoding
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isDetecting ? (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <Spinner size="lg" />
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                Acquiring high-accuracy GPS coordinates...
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                Please allow device location access if prompted
              </p>
            </div>
          ) : (
            <>
              {/* Map Preview Embed */}
              {pendingLocation?.latitude && pendingLocation?.longitude && (
                <div style={{
                  height: '160px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #334155',
                  position: 'relative'
                }}>
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://maps.google.com/maps?q=${pendingLocation.latitude},${pendingLocation.longitude}&z=15&output=embed`}
                    style={{ border: 0, filter: 'contrast(1.1) saturate(1.1)' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: accuracyBadge.bg,
                    border: `1px solid ${accuracyBadge.color}`,
                    color: accuracyBadge.color,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {accuracyBadge.label}
                  </div>
                </div>
              )}

              {/* Detected Address Box */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <MapPin size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Detected Area
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {pendingLocation?.locality ? `${pendingLocation.locality}, ` : ''}{pendingLocation?.city || 'Unknown City'}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {[pendingLocation?.district, pendingLocation?.state, pendingLocation?.country, pendingLocation?.postcode]
                    .filter(Boolean)
                    .join(', ')}
                </div>

                {pendingLocation?.formattedAddress && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px dashed #334155', paddingTop: '8px', marginTop: '4px' }}>
                    Full Address: {pendingLocation.formattedAddress}
                  </div>
                )}
              </div>

              {/* Low Accuracy Advisory */}
              {pendingLocation?.accuracy > 500 && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fbbf24',
                  fontSize: '0.8rem'
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>
                    GPS signal has wide uncertainty (±{Math.round(pendingLocation.accuracy)}m). If this is not your exact location, you can try again in an open space or change it manually.
                  </span>
                </div>
              )}

              {geoError && (
                <div style={{
                  padding: '12px',
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
          padding: '16px 24px',
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
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isDetecting || !pendingLocation ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
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
              <span>TRY AGAIN (GPS)</span>
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
