import React from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Fallback Component for Google Maps loading errors or missing API key.
 * Allows user to continue workflow cleanly without frustrating crashes.
 */
export const GoogleMapsFallback = ({
  message = 'Map preview is unavailable',
  onRetry,
  locality = '',
  city = '',
  height = '280px'
}) => {
  return (
    <div
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--radius-lg, 12px)',
        backgroundColor: '#f8fafc',
        border: '1.5px dashed #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      aria-label="Map Fallback Container"
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}
      >
        <AlertCircle size={24} />
      </div>

      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
        {message}
      </h4>

      {(locality || city) && (
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#64748b' }}>
          Selected Area: <strong style={{ color: '#0f172a' }}>{[locality, city].filter(Boolean).join(', ')}</strong>
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={14} />
          <span>Retry Map Load</span>
        </button>
      )}
    </div>
  );
};

export default GoogleMapsFallback;
