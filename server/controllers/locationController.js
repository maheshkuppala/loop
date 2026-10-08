const locationRulesService = require('../services/locationRulesService');
const locationService = require('../services/locationService');
const { logAction } = require('../services/adminAuditService');

// Simple in-memory cache to respect Nominatim usage policy & speed up repeated requests
const geocodeCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

/**
 * Fast offline Indian city coordinate resolver
 */
function resolveCityFromCoordinates(lat, lng) {
  if (!lat || !lng) return 'Guntur';
  
  // Andhra Pradesh - Guntur Region (lat ~ 16.0 to 16.45, lng ~ 80.1 to 80.6)
  if (lat >= 16.0 && lat <= 16.45 && lng >= 80.1 && lng <= 80.6) return 'Guntur';
  // Andhra Pradesh - Vijayawada Region (lat ~ 16.45 to 16.75, lng ~ 80.5 to 80.8)
  if (lat >= 16.45 && lat <= 16.75 && lng >= 80.5 && lng <= 80.8) return 'Vijayawada';
  // Andhra Pradesh - Visakhapatnam
  if (lat >= 17.5 && lat <= 17.9 && lng >= 83.1 && lng <= 83.4) return 'Visakhapatnam';
  // Andhra Pradesh - Tirupati
  if (lat >= 13.5 && lat <= 13.7 && lng >= 79.3 && lng <= 79.6) return 'Tirupati';
  // Telangana - Hyderabad
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) return 'Hyderabad';
  // Karnataka - Bengaluru
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'Bengaluru';
  // Tamil Nadu - Chennai
  if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.3) return 'Chennai';
  // Maharashtra - Mumbai
  if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.0) return 'Mumbai';
  // Maharashtra - Pune
  if (lat >= 18.4 && lat <= 18.7 && lng >= 73.7 && lng <= 74.0) return 'Pune';
  // Delhi NCR
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.9 && lng <= 77.4) return 'Delhi';

  return 'Guntur';
}

function resolveStateFromCoordinates(lat, lng) {
  if (!lat || !lng) return 'Andhra Pradesh';
  if (lat >= 15.5 && lat <= 17.0 && lng >= 79.5 && lng <= 81.5) return 'Andhra Pradesh';
  if (lat >= 17.0 && lat <= 18.5 && lng >= 77.5 && lng <= 79.5) return 'Telangana';
  if (lat >= 11.5 && lat <= 15.0 && lng >= 74.0 && lng <= 78.5) return 'Karnataka';
  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.0 && lng <= 80.5) return 'Tamil Nadu';
  if (lat >= 15.5 && lat <= 22.0 && lng >= 72.5 && lng <= 80.0) return 'Maharashtra';
  if (lat >= 28.0 && lat <= 29.0 && lng >= 76.5 && lng <= 77.8) return 'Delhi';
  return 'Andhra Pradesh';
}

/**
 * Search Location Autocomplete (BookMyShow-Style)
 * GET /api/location/search?q=gunt
 */
exports.searchLocations = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || '';
    const results = await locationService.searchLocations(query);
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('[LocationController] Search locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search locations.'
    });
  }
};

/**
 * Get Popular Cities
 * GET /api/location/popular
 */
exports.getPopularLocations = async (req, res) => {
  try {
    const populars = await locationService.getPopularLocations();
    return res.status(200).json({
      success: true,
      data: populars
    });
  } catch (error) {
    console.error('[LocationController] Popular locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch popular locations.'
    });
  }
};

/**
 * Reverse Geocode (Lat/Lng -> Human Readable Address)
 * GET /api/location/reverse-geocode?lat=...&lng=...
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude coordinates.'
      });
    }

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    const fallbackCity = resolveCityFromCoordinates(lat, lng);
    const fallbackState = resolveStateFromCoordinates(lat, lng);

    let geoData = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 sec timeout

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'LooopMarketplace/1.0 (contact@looop.app; production location service)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        geoData = await response.json();
      }
    } catch (fetchErr) {
      console.warn('[LocationController] Nominatim fetch timeout/notice:', fetchErr.message);
    }

    const address = (geoData && geoData.address) ? geoData.address : {};

    let city = address.city || address.town || address.village || address.suburb || address.municipality || address.county || address.state_district;
    if (!city || city === 'Detected Area' || city === 'Current Location') {
      city = fallbackCity;
    }

    let state = address.state || address.region || fallbackState;
    let locality = address.suburb || address.neighbourhood || address.residential || address.road || address.quarter || city;
    if (locality === 'Detected Area') locality = city;

    const district = address.state_district || address.county || state;
    const country = address.country || 'India';
    const postcode = address.postcode || '';

    const formattedAddress = [locality, city, state, country].filter(Boolean).join(', ');

    const result = {
      latitude: lat,
      longitude: lng,
      city,
      state,
      locality,
      district,
      country,
      postcode,
      formattedAddress: formattedAddress || `${city}, ${state}`
    };

    geocodeCache.set(cacheKey, { timestamp: Date.now(), data: result });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[LocationController] Reverse geocode internal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode coordinates.'
    });
  }
};

/**
 * Get Location Governance Rules
 * GET /api/location/rules
 */
exports.getLocationRules = async (req, res) => {
  try {
    const rules = await locationRulesService.getLocationRules();
    return res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('[LocationController] Error fetching rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location rules.'
    });
  }
};

/**
 * Update Location Governance Rules (Admin Only)
 * PUT /api/location/rules
 */
exports.updateLocationRules = async (req, res) => {
  try {
    const adminId = req.user?._id || req.user?.id;
    const updatedRules = await locationRulesService.updateLocationRules(req.body, adminId);

    if (adminId) {
      await logAction({
        adminId,
        action: 'UPDATE_LOCATION_RULES',
        targetModel: 'AdminSetting',
        details: req.body,
        ipAddress: req.ip
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location governance rules updated successfully.',
      data: updatedRules
    });
  } catch (error) {
    console.error('[LocationController] Error updating rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location rules.'
    });
  }
};
