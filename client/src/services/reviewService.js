import api from './api';

/**
 * Review Service
 * Manages authentic ratings and reviews tied exclusively to verified completed transactions.
 */
export const reviewService = {
  /**
   * Submit a review for a completed transaction
   * @param {Object} reviewData - { transactionId, rating, comment }
   */
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  /**
   * Get reviews received by a user (paginated)
   * @param {string} userId
   * @param {Object} params - { page, limit }
   */
  getUserReviews: async (userId, params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get(`/reviews/user/${userId}${qs}`);
    return response.data;
  },

  /**
   * Get real ratings summary and distribution from MongoDB aggregation
   * @param {string} userId
   */
  getUserReviewSummary: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}/summary`);
    return response.data;
  },

  /**
   * Get reviews and check review eligibility for a specific transaction
   * @param {string} transactionId
   */
  getTransactionReviews: async (transactionId) => {
    const response = await api.get(`/reviews/transaction/${transactionId}`);
    return response.data;
  },

  /**
   * Update reviewer's own review
   * @param {string} reviewId
   * @param {Object} data - { rating, comment }
   */
  updateReview: async (reviewId, data) => {
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  /**
   * Delete reviewer's own review
   * @param {string} reviewId
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

export default reviewService;
