import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Getting things ready...',
  'Preparing your LOOOP...',
  'Connecting you to the community...'
];

export const LooopInitialLoader = ({ isLoading = true, onExitComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex] = useState(0); // Use first message primarily

  useEffect(() => {
    if (!isLoading && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onExitComplete) onExitComplete();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isExiting, onExitComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`looop-loading-screen ${isExiting ? 'looop-loading-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      aria-label="LOOOP is loading"
    >
      {/* Background Rings */}
      <div className="looop-loading-rings">
        <div className="looop-ring looop-ring-1" />
        <div className="looop-ring looop-ring-2" />
        <div className="looop-ring looop-ring-3" />
      </div>

      {/* Background Orbs */}
      <div className="looop-loading-orbs">
        <div className="looop-orb looop-orb-1" />
        <div className="looop-orb looop-orb-2" />
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* LOOOP Wordmark with 3D effect */}
        <div className="looop-loading-wordmark">
          <span className="looop-loading-sweep">LOOOP</span>
        </div>

        {/* Tagline */}
        <div className="looop-loading-tagline">
          Share. Reuse. Connect.
        </div>

        {/* Loading Dots */}
        <div className="looop-loading-dots" style={{ marginTop: '2rem' }}>
          <div className="looop-loading-dot" />
          <div className="looop-loading-dot" />
          <div className="looop-loading-dot" />
        </div>

        {/* Status Message */}
        <div className="looop-loading-status">
          {LOADING_MESSAGES[messageIndex]}
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading LOOOP application</span>
    </div>
  );
};

export default LooopInitialLoader;
