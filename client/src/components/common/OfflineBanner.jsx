import React, { useState, useEffect } from 'react';

/**
 * Offline Awareness Banner
 * Detects online/offline browser state and informs user gracefully
 */
export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        backgroundColor: '#ef4444',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      role="alert"
    >
      <span style={{ fontSize: '1rem' }}>⚡</span>
      <span>You are currently offline. Active internet connection is required to sync and submit requests.</span>
    </div>
  );
};

export default OfflineBanner;
