const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const impactController = require('../controllers/impactController');

// 1. Authenticated User Impact Routes
router.get('/me', authMiddleware, impactController.getMyImpact);
router.get('/me/history', authMiddleware, impactController.getMyImpactHistory);
router.get('/me/trends', authMiddleware, impactController.getMyImpactTrends);

// 2. Public Platform & User Impact Routes
router.get('/summary', impactController.getPlatformSummary);
router.get('/user/:id', impactController.getUserPublicImpact);
router.get('/', impactController.getPlatformSummary);

module.exports = router;
