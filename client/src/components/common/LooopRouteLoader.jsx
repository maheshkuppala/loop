import React from 'react';

export const LooopRouteLoader = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '260px',
        width: '100%',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Sleek top progress indicator */}
      <div className="looop-route-progress" />

      {/* Pleasant Loader Card */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '30px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        <span
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2.5px solid #10b981',
            borderTopColor: 'transparent',
            display: 'inline-block',
            animation: 'looop-ring-rotate 0.8s linear infinite'
          }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#059669',
            letterSpacing: '0.01em'
          }}
        >
          {message}
        </span>
      </div>
    </div>
  );
};

export default LooopRouteLoader;
