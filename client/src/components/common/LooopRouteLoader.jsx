import React from 'react';

export const LooopRouteLoader = ({ message = 'Loading page...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        padding: '3rem 1.5rem',
        textAlign: 'center'
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Top Progress Line */}
      <div className="looop-route-progress" />

      {/* Small LOOOP branding */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-brand, Outfit, sans-serif)',
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#16A34A',
          letterSpacing: '-0.035em',
          textShadow: '0 1px 0 #15803D, 0 2px 4px rgba(22, 163, 74, 0.1)'
        }}>
          LOOOP
        </div>
      </div>

      {/* Loading dots */}
      <div className="looop-loading-dots">
        <div className="looop-loading-dot" />
        <div className="looop-loading-dot" />
        <div className="looop-loading-dot" />
      </div>

      {/* Status text */}
      <p style={{
        fontSize: '0.925rem',
        fontWeight: 600,
        color: 'var(--color-slate-500, #64748b)',
        margin: '1rem 0 0'
      }}>
        {message}
      </p>
    </div>
  );
};

export default LooopRouteLoader;
