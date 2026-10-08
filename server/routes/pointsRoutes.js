const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pointsService = require('../services/pointsService');

// All points routes require authentication
router.use(auth);

// GET /api/points - Get user points dashboard & ledger history
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const dashboard = await pointsService.getPointsDashboard(userId);
    return res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error fetching points dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve points data.'
    });
  }
});

// GET /api/points/settings - Get current point reward settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await pointsService.getPointsSettings();
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to load point settings.'
    });
  }
});

module.exports = router;
