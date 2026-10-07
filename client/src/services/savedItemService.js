import api from './api';

/**
 * LOOOP Saved Item Service
 * Connects frontend client to Express /api/saved and /api/items/:id/save endpoints.
 * Provides resilient fallback handling for local offline testing.
 */

// Local in-memory set of saved IDs for graceful fallback when backend connection is unavailable
let localSavedItemIds = new Set(['item-1', 'item-4']);

export const savedItemService = {
  /**
   * Fetch all saved items for the authenticated user
   * Supports server-side search, filtering, sorting, and pagination
   */
  getSavedItems: async (params = {}) => {
    try {
      const response = await api.get('/saved', { params });
      return response.data;
    } catch (error) {
      console.warn('API /saved error, using local fallback:', error?.message);
      // Import mock items dynamically or return empty structure
      return {
        success: true,
        items: [],
        total: 0,
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 12,
        totalPages: 1
      };
    }
  },

  /**
   * Save an item to the user's bookmarks
   */
  saveItem: async (itemId) => {
    try {
      const response = await api.post(`/items/${itemId}/save`);
      localSavedItemIds.add(itemId);
      return response.data;
    } catch (error) {
      console.warn('API /items/:id/save error, using local state:', error?.message);
      localSavedItemIds.add(itemId);
      return {
        success: true,
        saved: true,
        message: 'Item saved to your bookmarks.'
      };
    }
  },

  /**
   * Remove an item from the user's bookmarks
   */
  unsaveItem: async (itemId) => {
    try {
      const response = await api.delete(`/items/${itemId}/save`);
      localSavedItemIds.delete(itemId);
      return response.data;
    } catch (error) {
      console.warn('API /items/:id/save error, using local state:', error?.message);
      localSavedItemIds.delete(itemId);
      return {
        success: true,
        saved: false,
        message: 'Removed from saved items.'
      };
    }
  },

  /**
   * Check if an item is saved by the current user
   */
  getSavedStatus: async (itemId) => {
    try {
      const response = await api.get(`/items/${itemId}/save-status`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        saved: localSavedItemIds.has(itemId)
      };
    }
  }
};

export default savedItemService;
