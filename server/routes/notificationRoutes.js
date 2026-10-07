const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes require authentication
router.use(auth);

// GET /api/notifications/unread-count - Total unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications/recent - Quick preview for dashboard
router.get('/recent', notificationController.getRecentNotifications);

// GET /api/notifications/preferences - Retrieve authenticated user's notification preferences
router.get('/preferences', notificationController.getPreferences);

// PATCH /api/notifications/preferences - Update user's notification preferences
router.patch('/preferences', notificationController.updatePreferences);

// PATCH /api/notifications/read-all - Mark all user notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// GET /api/notifications - List paginated user notifications with filtering
router.get('/', notificationController.getNotifications);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Dismiss / soft delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
