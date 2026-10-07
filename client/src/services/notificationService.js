import api from './api';

/**
 * Real Backend Notification Service
 * Strictly database-backed; no mock fallbacks
 */
export const notificationService = {
  /**
   * Fetch paginated notifications with optional filters
   * @param {Object} params - { page, limit, read, type, category }
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Fetch authoritative unread notification count
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param {string} id - Notification ID
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all unread notifications as read for current user
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Dismiss / soft delete notification
   * @param {string} id - Notification ID
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Fetch user notification preferences
   */
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update user notification preferences
   * @param {Object} preferences
   */
  updatePreferences: async (preferences) => {
    const response = await api.patch('/notifications/preferences', preferences);
    return response.data;
  },

  /**
   * Fetch recent notifications (for dashboard widget preview)
   * @param {number} limit
   */
  getRecentNotifications: async (limit = 5) => {
    const response = await api.get('/notifications/recent', { params: { limit } });
    return response.data;
  }
};

export default notificationService;
