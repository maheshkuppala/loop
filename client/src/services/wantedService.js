import api from './api';
import { mockWantedItems } from '../data/mockData';

export const wantedService = {
  /**
   * Create a new Wanted Item request
   * @param {Object} data - Form payload
   * @returns {Promise<Object>}
   */
  createWantedItem: async (data) => {
    const response = await api.post('/wanted', data);
    return response.data;
  },

  /**
   * Fetch active wanted items with optional filter parameters
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getWantedItems: async (params = {}) => {
    try {
      const response = await api.get('/wanted', { params });
      return response.data;
    } catch {
      return { success: true, wantedItems: mockWantedItems };
    }
  },

  /**
   * Fetch nearby wanted items for smart discovery
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getNearbyWanted: async (params = {}) => {
    try {
      const response = await api.get('/wanted/nearby', { params });
      return response.data;
    } catch {
      return { success: true, wantedItems: mockWantedItems };
    }
  },

  /**
   * Fetch a single wanted item by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getWantedItemById: async (id) => {
    const response = await api.get(`/wanted/${id}`);
    return response.data;
  },

  /**
   * Remove/close a wanted item request
   * @param {string} id
   * @returns {Promise<Object>}
   */
  deleteWantedItem: async (id) => {
    const response = await api.delete(`/wanted/${id}`);
    return response.data;
  },

  /**
   * Fetch matching available items for a wanted request
   * @param {string} id
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getWantedMatches: async (id, params = {}) => {
    try {
      const response = await api.get(`/wanted/${id}/matches`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching wanted matches:', error);
      return { success: false, matches: [], count: 0 };
    }
  }
};

export default wantedService;
