const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

// Protected current user profile endpoints
router.get('/me', auth, userController.getMe);
router.patch('/me', auth, userController.updateMe);

// Public / community user profile endpoint
router.get('/:id', optionalAuth, userController.getPublicProfile);

module.exports = router;
