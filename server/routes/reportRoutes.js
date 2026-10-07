const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

// Create user or item report (Protected)
router.post('/', auth, reportController.createReport);

// Admin reports listing (Protected)
router.get('/', auth, reportController.getReports);

module.exports = router;
