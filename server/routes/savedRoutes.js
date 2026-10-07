const express = require('express');
const router = express.Router();
const savedItemController = require('../controllers/savedItemController');
const auth = require('../middleware/auth');

// Protected personal saved items routes
router.get('/', auth, savedItemController.getSavedItems);
router.delete('/:id', auth, savedItemController.unsaveItem);

module.exports = router;
