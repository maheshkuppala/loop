const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Route Calculation Endpoints
router.post('/route', mapController.computeRoute);
router.get('/route', mapController.computeRoute);

module.exports = router;
