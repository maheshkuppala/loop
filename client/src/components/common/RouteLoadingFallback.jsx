import React from 'react';
import LooopRouteLoader from './LooopRouteLoader';

/**
 * Polished route loading fallback displayed during React.lazy suspense transitions.
 * Uses the LOOOP-branded loading experience.
 */
export const RouteLoadingFallback = ({ message = 'Loading page...' }) => {
  return <LooopRouteLoader message={message} />;
};

export default RouteLoadingFallback;
