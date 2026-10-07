import React from 'react';

/**
 * Polished route loading fallback displayed during React.lazy suspense transitions
 */
export const RouteLoadingFallback = ({ message = 'Loading page...' }) => {
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
    >
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          marginBottom: '1.25rem'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(16, 185, 129, 0.15)',
            borderTopColor: '#10b981',
            animation: 'spin 0.85s linear infinite'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }}
          />
        </div>
      </div>
      <p
        style={{
          fontSize: '0.925rem',
          fontWeight: 600,
          color: 'var(--color-slate-600, #475569)',
          margin: 0
        }}
      >
        {message}
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RouteLoadingFallback;
