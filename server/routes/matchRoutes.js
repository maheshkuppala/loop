const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');

// All match routes require authentication
router.use(auth);

// GET /api/matches - Retrieve user matches
router.get('/', matchController.getMyMatches);

// GET /api/matches/:id - Retrieve specific match
router.get('/:id', matchController.getMatchById);

// PATCH /api/matches/:id/dismiss - Dismiss match
router.patch('/:id/dismiss', matchController.dismissMatch);

module.exports = router;
