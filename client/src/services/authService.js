import api from './api';

/**
 * Authentication Service
 * Decouples network/API communication from authentication visual components
 */
export const authService = {
  /**
   * Log in user with credentials
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Backend response with { token, user }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user account
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} - Backend response with { token, user }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Request password reset link
   * @param {Object} data - { email }
   * @returns {Promise<Object>} - Backend confirmation message
   */
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with secure token
   * @param {Object} data - { token, password }
   * @returns {Promise<Object>} - Backend confirmation
   */
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile
   * @returns {Promise<Object>}
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Clears local authentication session
   */
  logoutSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('looop_token');
      localStorage.removeItem('looop_user');
    }
  }
};

export default authService;
