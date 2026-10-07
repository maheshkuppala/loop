const express = require('express');
const router = express.Router();
const wantedController = require('../controllers/wantedController');
const auth = require('../middleware/auth');

// POST /api/wanted - Create a Wanted Item (Protected)
router.post('/', auth, wantedController.createWantedItem);

// GET /api/wanted/nearby - Compatibility endpoint for nearby requests
router.get('/nearby', wantedController.getWantedItems);

// GET /api/wanted - List active wanted items
router.get('/', wantedController.getWantedItems);

// GET /api/wanted/:id/matches - Find matching available items for wanted request
router.get('/:id/matches', wantedController.getWantedMatches);

// GET /api/wanted/:id - Get specific wanted item details
router.get('/:id', wantedController.getWantedItemById);

// DELETE /api/wanted/:id - Remove/Close wanted item (Protected)
router.delete('/:id', auth, wantedController.deleteWantedItem);

module.exports = router;
