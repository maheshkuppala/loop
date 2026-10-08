/**
 * Geographic Utility Module for LOOOP
 * Provides Haversine distance calculation and coordinate resolution for cities/localities
 */

// Known coordinates map for Indian cities and localities to ensure instant precise distance math
const CITY_COORDINATES = {
  // Karnataka
  'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'indiranagar': { lat: 12.9784, lng: 77.6408, state: 'Karnataka' },
  'whitefield': { lat: 12.9698, lng: 77.7499, state: 'Karnataka' },
  'koramangala': { lat: 12.9352, lng: 77.6245, state: 'Karnataka' },
  'hsr layout': { lat: 12.9121, lng: 77.6445, state: 'Karnataka' },
  'jayanagar': { lat: 12.9250, lng: 77.5938, state: 'Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },

  // Andhra Pradesh
  'guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh' },
  'broadipet': { lat: 16.3082, lng: 80.4340, state: 'Andhra Pradesh' },
  'arundelpet': { lat: 16.3015, lng: 80.4390, state: 'Andhra Pradesh' },
  'brodipet': { lat: 16.3082, lng: 80.4340, state: 'Andhra Pradesh' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  'tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' },

  // Telangana
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'hitech city': { lat: 17.4435, lng: 78.3772, state: 'Telangana' },
  'banjara hills': { lat: 17.4156, lng: 78.4347, state: 'Telangana' },

  // Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },

  // Maharashtra
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },

  // Delhi NCR
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'noida': { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' }
};

/**
 * Calculates straight-line geographic distance between two sets of coordinates using the Haversine formula.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers (rounded to 1 decimal place)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 999;
  }

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Resolve coordinates for a given city or locality string
 * @param {string|Object} locationData 
 * @returns {{lat: number, lng: number, city: string, state: string, locality: string}}
 */
function resolveCoordinates(locationData) {
  if (!locationData) {
    return { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka', locality: '' };
  }

  if (typeof locationData === 'object' && locationData.lat && locationData.lng) {
    return {
      lat: Number(locationData.lat),
      lng: Number(locationData.lng),
      city: locationData.city || 'Bengaluru',
      state: locationData.state || 'Karnataka',
      locality: locationData.locality || locationData.area || ''
    };
  }

  const locStr = typeof locationData === 'string' ? locationData : (locationData.locality || locationData.city || '');
  const cleanStr = locStr.toLowerCase().trim();

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cleanStr.includes(key)) {
      return {
        lat: coords.lat,
        lng: coords.lng,
        city: key.charAt(0).toUpperCase() + key.slice(1),
        state: coords.state,
        locality: cleanStr.includes(key) && key !== 'bengaluru' && key !== 'guntur' ? key : ''
      };
    }
  }

  // Default to Bengaluru if unmatched
  return { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka', locality: '' };
}

module.exports = {
  calculateHaversineDistance,
  resolveCoordinates,
  CITY_COORDINATES
};
