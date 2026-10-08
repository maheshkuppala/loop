const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// All transaction routes require authentication
router.use(auth);

// GET /api/transactions - Get list of user transactions
router.get('/', transactionController.getMyTransactions);

// GET /api/transactions/summary - Get summary statistics for user transactions
router.get('/summary', transactionController.getTransactionSummary);

// GET /api/transactions/:id - Get detailed transaction by ID
router.get('/:id', transactionController.getTransactionById);

// PATCH /api/transactions/:id/handover - Schedule or update handover details
router.patch('/:id/handover', transactionController.updateHandover);

// PATCH /api/transactions/:id/handover/confirm - Confirm handover
router.patch('/:id/handover/confirm', transactionController.confirmHandover);

// PATCH /api/transactions/:id/return - Start return process (borrow only)
router.patch('/:id/return', transactionController.startReturn);

// PATCH /api/transactions/:id/return/confirm - Confirm return
router.patch('/:id/return/confirm', transactionController.confirmReturn);

// PATCH /api/transactions/:id/confirm-receipt - Customer confirms product receipt
router.patch('/:id/confirm-receipt', transactionController.confirmCustomerReceipt);

module.exports = router;
