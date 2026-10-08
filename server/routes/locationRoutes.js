const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public endpoints
router.get('/reverse-geocode', locationController.reverseGeocode);
router.get('/rules', locationController.getLocationRules);

// Admin-only rule updates
router.put('/rules', adminMiddleware, locationController.updateLocationRules);

module.exports = router;
