import api from './api';

/**
 * Report Service
 * Community moderation for listings and user profiles
 */
export const reportService = {
  /**
   * Report an item listing
   */
  createReport: async (itemId, reportData) => {
    const response = await api.post('/reports', {
      targetType: 'ITEM',
      itemId,
      ...reportData
    });
    return response.data;
  },

  /**
   * Report a user profile
   */
  reportUser: async ({ userId, reason, description }) => {
    const response = await api.post('/reports', {
      targetType: 'USER',
      userId,
      reason,
      description
    });
    return response.data;
  }
};

export default reportService;
