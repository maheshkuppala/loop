import api from './api';

/**
 * Transaction Service
 * Connects directly to real backend endpoints for item handover,
 * scheduling, return coordination, and transaction completion.
 */
export const transactionService = {
  /**
   * Fetch user transactions with optional filters and search
   * @param {Object} params - { status, type, search, sort }
   * @returns {Promise<Object>}
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  /**
   * Get transaction summary statistics (active, pending, completed counts)
   * @returns {Promise<Object>}
   */
  getTransactionSummary: async () => {
    const response = await api.get('/transactions/summary');
    return response.data;
  },

  /**
   * Get full transaction details by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Schedule or update handover details (date, time, location, notes, method)
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateHandover: async (id, data) => {
    const response = await api.patch(`/transactions/${id}/handover`, data);
    return response.data;
  },

  /**
   * Confirm handover (by owner or recipient)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  confirmHandover: async (id) => {
    const response = await api.patch(`/transactions/${id}/handover/confirm`);
    return response.data;
  },

  /**
   * Start return process for active borrow transaction
   * @param {string} id
   * @param {Object} data - { returnDate, returnNotes }
   * @returns {Promise<Object>}
   */
  startReturn: async (id, data = {}) => {
    const response = await api.patch(`/transactions/${id}/return`, data);
    return response.data;
  },

  /**
   * Confirm return (by owner or borrower)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  confirmReturn: async (id) => {
    const response = await api.patch(`/transactions/${id}/return/confirm`);
    return response.data;
  }
};

export default transactionService;
