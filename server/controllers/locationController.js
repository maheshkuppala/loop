const locationRulesService = require('../services/locationRulesService');
const { logAction } = require('../services/adminAuditService');

// Simple in-memory cache to respect Nominatim usage policy & speed up repeated requests
const geocodeCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour cache

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

    // Call OpenStreetMap Nominatim reverse geocoder
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    let geoData = null;

    try {
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'LooopMarketplace/1.0 (contact@looop.app; production location service)'
        }
      });

      if (response.ok) {
        geoData = await response.json();
      }
    } catch (fetchErr) {
      console.warn('[LocationController] Nominatim fetch error:', fetchErr.message);
    }

    // Fallback to BigDataCloud if Nominatim failed or returned empty
    if (!geoData || !geoData.address) {
      try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const bdcRes = await fetch(bdcUrl);
        if (bdcRes.ok) {
          const bdcJson = await bdcRes.json();
          geoData = {
            address: {
              country: bdcJson.countryName,
              state: bdcJson.principalSubdivision,
              city: bdcJson.city || bdcJson.locality || bdcJson.localityInfo?.administrative?.[2]?.name,
              suburb: bdcJson.locality || bdcJson.localityInfo?.informative?.[0]?.name,
              postcode: bdcJson.postcode || ''
            },
            display_name: `${bdcJson.locality || bdcJson.city || ''}, ${bdcJson.principalSubdivision || ''}, ${bdcJson.countryName || ''}`
          };
        }
      } catch (bdcErr) {
        console.warn('[LocationController] Fallback reverse geocoder error:', bdcErr.message);
      }
    }

    const address = (geoData && geoData.address) ? geoData.address : {};

    const city = address.city || address.town || address.village || address.municipality || address.county || address.state_district || 'Detected Area';
    const state = address.state || address.region || '';
    const locality = address.suburb || address.neighbourhood || address.residential || address.road || address.quarter || city;
    const district = address.state_district || address.county || state;
    const country = address.country || 'India';
    const postcode = address.postcode || '';

    const formattedAddress = [locality, city, state, postcode].filter(Boolean).join(', ');

    const result = {
      latitude: lat,
      longitude: lng,
      city,
      state,
      locality,
      district,
      country,
      postcode,
      formattedAddress: formattedAddress || geoData?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      raw: address
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
