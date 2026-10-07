import api from './api';

/**
 * LOOOP Message Service
 * Interacts with the backend conversation and real-time messaging APIs.
 */
export const messageService = {
  /**
   * Fetch all conversations for the authenticated user
   */
  getConversations: async (params = {}) => {
    const response = await api.get('/conversations', { params });
    return response.data;
  },

  /**
   * Fetch single conversation by its ID
   */
  getConversationById: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Fetch conversation for an accepted request
   */
  getConversationByRequest: async (requestId) => {
    const response = await api.get(`/conversations/request/${requestId}`);
    return response.data;
  },

  /**
   * Fetch conversation for a transaction
   */
  getConversationByTransaction: async (transactionId) => {
    const response = await api.get(`/conversations/transaction/${transactionId}`);
    return response.data;
  },

  /**
   * Fetch paginated message history for a conversation
   */
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  /**
   * Send a message through the REST fallback endpoint
   */
  sendMessage: async (conversationId, text) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { text });
    return response.data;
  },

  /**
   * Mark messages in a conversation as read
   */
  markConversationRead: async (conversationId) => {
    const response = await api.patch(`/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * Get total unread messages count across all user conversations
   */
  getUnreadCount: async () => {
    const response = await api.get('/conversations/unread-count');
    return response.data;
  },

  /**
   * Fetch recent conversations for dashboard preview
   */
  getRecentConversations: async (params = {}) => {
    return messageService.getConversations(params);
  }
};

export default messageService;
