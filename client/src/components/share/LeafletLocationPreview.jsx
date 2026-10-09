import React from 'react';
import GoogleItemLocationView from '../maps/GoogleItemLocationView';

/**
 * Location Preview component using Google Maps Platform.
 * Supports city, locality, and coordinates props.
 */
export const LeafletLocationPreview = ({
  city = 'Bengaluru',
  locality = 'Indiranagar',
  coordinates = [12.9716, 77.5946]
}) => {
  return (
    <GoogleItemLocationView
      city={city}
      locality={locality}
      coordinates={coordinates}
      height="220px"
    />
  );
};

export default LeafletLocationPreview;
