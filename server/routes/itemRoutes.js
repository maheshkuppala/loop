const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');

// Protected personal user listing endpoints (scoped to authenticated user)
router.get('/my/summary', auth, itemController.getMyItemsSummary);
router.get('/my', auth, itemController.getMyItems);

// Protected item creation endpoint
router.post('/', auth, itemController.createItem);

const savedItemController = require('../controllers/savedItemController');

// Protected item status, deletion, and save bookmark endpoints
router.patch('/:id/availability', auth, itemController.updateAvailability);
router.delete('/:id', auth, itemController.deleteItem);
router.post('/:id/save', auth, savedItemController.saveItem);
router.delete('/:id/save', auth, savedItemController.unsaveItem);
router.get('/:id/save-status', auth, savedItemController.getSavedStatus);

// Public item discovery endpoints
router.get('/discover', itemController.discoverItems);
router.get('/nearby', itemController.getNearbyItems);
router.get('/:id/matches', itemController.getItemMatches);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

module.exports = router;
