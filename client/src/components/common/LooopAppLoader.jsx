import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LooopInitialLoader from './LooopInitialLoader';

/**
 * LooopAppLoader wraps the main application content.
 * Shows the premium LOOOP loading experience during auth initialization.
 * Once auth state resolves, transitions smoothly to the app.
 */
export const LooopAppLoader = ({ children }) => {
  const { isLoading } = useAuth();
  const [loadComplete, setLoadComplete] = useState(false);

  const handleExitComplete = () => {
    setLoadComplete(true);
  };

  return (
    <>
      {/* Initial full-screen loader shown during auth hydration */}
      {!loadComplete && (
        <LooopInitialLoader
          isLoading={isLoading}
          onExitComplete={handleExitComplete}
        />
      )}

      {/* App content - render immediately but behind the loader */}
      <div className={loadComplete ? 'looop-content-entering' : ''} style={{ opacity: loadComplete ? 1 : 0 }}>
        {children}
      </div>
    </>
  );
};

export default LooopAppLoader;
