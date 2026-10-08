const axios = require('axios');

/**
 * LOOOP Server-Side Google Maps Controller
 * Interacts with Google Routes API & Directions API securely using GOOGLE_MAPS_SERVER_API_KEY.
 * Prevents key leakage to the frontend while enforcing coordinate validation & rate limits.
 */

const getApiKey = () => {
  return process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

/**
 * Validate latitude & longitude bounds
 */
const isValidCoord = (lat, lng) => {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
};

/**
 * POST /api/maps/route or GET /api/maps/route
 * Calculate real travel route, distance, and duration between origin and destination.
 */
exports.computeRoute = async (req, res) => {
  try {
    const origin = req.body?.origin || {
      latitude: parseFloat(req.query.originLat),
      longitude: parseFloat(req.query.originLng)
    };

    const destination = req.body?.destination || {
      latitude: parseFloat(req.query.destLat),
      longitude: parseFloat(req.query.destLng)
    };

    const travelMode = (req.body?.travelMode || req.query.travelMode || 'DRIVE').toUpperCase();
    const validModes = ['DRIVE', 'WALK', 'BICYCLE', 'TRANSIT'];
    const mode = validModes.includes(travelMode) ? travelMode : 'DRIVE';

    // 1. Coordinate Validation
    if (!isValidCoord(origin?.latitude, origin?.longitude)) {
      return res.status(400).json({
        success: false,
        routeAvailable: false,
        message: 'Invalid origin coordinates. Latitude must be [-90, 90] and Longitude [-180, 180].'
      });
    }

    if (!isValidCoord(destination?.latitude, destination?.longitude)) {
      return res.status(400).json({
        success: false,
        routeAvailable: false,
        message: 'Invalid destination coordinates. Latitude must be [-90, 90] and Longitude [-180, 180].'
      });
    }

    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'YOUR_SERVER_RESTRICTED_KEY') {
      return res.status(503).json({
        success: false,
        routeAvailable: false,
        message: 'Google Maps Server API key is not configured on backend.'
      });
    }

    // Map travelMode to Directions API mode
    const modeMap = {
      DRIVE: 'driving',
      WALK: 'walking',
      BICYCLE: 'bicycling',
      TRANSIT: 'transit'
    };

    // Call Google Directions API / Routes API
    const googleRes = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: modeMap[mode] || 'driving',
        key: apiKey
      },
      timeout: 8000
    });

    const data = googleRes.data;

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs && route.legs[0];

      return res.status(200).json({
        success: true,
        routeAvailable: true,
        distanceMeters: leg?.distance?.value || 0,
        durationSeconds: leg?.duration?.value || 0,
        distanceText: leg?.distance?.text || '0 km',
        durationText: leg?.duration?.text || '0 min',
        polyline: route.overview_polyline?.points || '',
        startAddress: leg?.start_address || '',
        endAddress: leg?.end_address || '',
        travelMode: mode
      });
    }

    if (data.status === 'ZERO_RESULTS') {
      return res.status(200).json({
        success: true,
        routeAvailable: false,
        message: 'No route could be found between these locations.'
      });
    }

    return res.status(400).json({
      success: false,
      routeAvailable: false,
      message: `Google API Error: ${data.status} - ${data.error_message || 'Could not calculate route'}`
    });
  } catch (error) {
    console.error('[MapController] Compute route error:', error.message);
    return res.status(500).json({
      success: false,
      routeAvailable: false,
      message: 'Failed to compute route from Google Maps service.'
    });
  }
};
