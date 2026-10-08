import React from 'react';
import GoogleBrowseMap from '../maps/GoogleBrowseMap';

/**
 * BrowseMap component wrapper using Google Maps Platform.
 * Supports legacy props (userCoordinates, items, etc.) while rendering GoogleBrowseMap.
 */
export const BrowseMap = ({
  items = [],
  userCoordinates = null, // [lat, lng]
  radiusKm = 25,
  centerLocation = 'Community Area',
  onSelectItem,
  selectedItem = null
}) => {
  return (
    <GoogleBrowseMap
      items={items}
      userLocation={userCoordinates}
      selectedItem={selectedItem}
      onSelectItem={onSelectItem}
      height="620px"
    />
  );
};

export default BrowseMap;
