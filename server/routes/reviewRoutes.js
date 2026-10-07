const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, optionalAuth } = require('../middleware/auth');

// Create a review (Protected - requires transaction participant authentication)
router.post('/', auth, reviewController.createReview);

// Public / community review queries
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/user/:userId/summary', reviewController.getUserReviewSummary);

// Reviews for a transaction (with current user eligibility check)
router.get('/transaction/:transactionId', optionalAuth, reviewController.getTransactionReviews);

// Single review operations
router.get('/:id', reviewController.getReviewById);
router.patch('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
