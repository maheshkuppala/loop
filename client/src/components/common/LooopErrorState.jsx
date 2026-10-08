import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LooopErrorState = ({ onRetry, message = 'Something went wrong.' }) => {
  return (
    <div
      className="looop-loading-screen"
      role="alert"
      style={{ animation: 'none' }}
    >
      {/* Background Rings (muted) */}
      <div className="looop-loading-rings" style={{ opacity: 0.03 }}>
        <div className="looop-ring looop-ring-1" style={{ animation: 'none' }} />
        <div className="looop-ring looop-ring-2" style={{ animation: 'none' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '400px', padding: '0 1.5rem' }}>
        {/* LOOOP wordmark */}
        <div style={{
          fontFamily: 'var(--font-brand, Outfit, sans-serif)',
          fontSize: 'clamp(2.5rem, 7vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          color: '#16A34A',
          textShadow: '0 1px 0 #15803D, 0 2px 0 #15803D, 0 3px 0 #166534, 0 4px 8px rgba(22, 163, 74, 0.15)',
          marginBottom: '1.5rem'
        }}>
          LOOOP
        </div>

        <p style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--color-slate-700, #334155)',
          marginBottom: '0.5rem'
        }}>
          {message}
        </p>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-slate-500, #64748b)',
          marginBottom: '1.75rem',
          lineHeight: 1.5
        }}>
          Please check your connection and try again.
        </p>

        <button
          onClick={onRetry || (() => window.location.reload())}
          className="btn btn-primary btn-md"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: 'var(--radius-md, 12px)',
            padding: '0.75rem 1.5rem'
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default LooopErrorState;
