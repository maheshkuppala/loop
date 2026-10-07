import api from './api';

/**
 * Match Service
 * Handles user match feeds and actions
 */
export const matchService = {
  /**
   * Get user's matches
   * @param {Object} params - { role: 'all'|'requester'|'owner', status: 'ACTIVE', page, limit }
   */
  getMyMatches: async (params = {}) => {
    try {
      const response = await api.get('/matches', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { success: false, matches: [], total: 0 };
    }
  },

  /**
   * Get match by ID
   */
  getMatchById: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  /**
   * Dismiss a match
   */
  dismissMatch: async (id) => {
    const response = await api.patch(`/matches/${id}/dismiss`);
    return response.data;
  }
};

export default matchService;
