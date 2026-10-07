const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const auth = require('../middleware/auth');

// All conversation routes require authentication
router.use(auth);

// GET /api/conversations/unread-count - Total unread message count for badge
router.get('/unread-count', conversationController.getUnreadCount);

// GET /api/conversations/request/:requestId - Retrieve conversation for accepted request
router.get('/request/:requestId', conversationController.getConversationByRequest);

// GET /api/conversations/transaction/:transactionId - Retrieve conversation for transaction
router.get('/transaction/:transactionId', conversationController.getConversationByTransaction);

// GET /api/conversations - List user conversations
router.get('/', conversationController.getConversations);

// GET /api/conversations/:id - Single conversation details
router.get('/:id', conversationController.getConversationById);

// GET /api/conversations/:id/messages - Paginated message history
router.get('/:id/messages', conversationController.getMessages);

// POST /api/conversations/:id/messages - Send message (REST fallback)
router.post('/:id/messages', conversationController.sendMessage);

// PATCH /api/conversations/:id/read - Mark conversation messages read
router.patch('/:id/read', conversationController.markAsRead);

module.exports = router;
