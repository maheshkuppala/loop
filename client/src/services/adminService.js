import api from './api';

/**
 * Centralized Admin API Service
 * Interacts with backend /api/admin endpoints with verified administrative JWT credentials.
 */
export const adminService = {
  // 1. Dashboard Overview
  getDashboard: async (range = '30d') => {
    const res = await api.get(`/admin/dashboard?range=${range}`);
    return res.data;
  },

  // 2. Platform Analytics
  getAnalytics: async (range = '30d') => {
    const res = await api.get(`/admin/analytics?range=${range}`);
    return res.data;
  },

  // 3. User Governance
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);

    const res = await api.get(`/admin/users?${query.toString()}`);
    return res.data;
  },

  getUserDetails: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  updateUserStatus: async (id, data) => {
    const res = await api.patch(`/admin/users/${id}/status`, data);
    return res.data;
  },

  // 4. Listing Moderation
  getItems: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.sharingType) query.append('sharingType', params.sharingType);
    if (params.status) query.append('status', params.status);
    if (params.condition) query.append('condition', params.condition);

    const res = await api.get(`/admin/items?${query.toString()}`);
    return res.data;
  },

  getItemDetails: async (id) => {
    const res = await api.get(`/admin/items/${id}`);
    return res.data;
  },

  moderateItem: async (id, data) => {
    const res = await api.patch(`/admin/items/${id}/moderation`, data);
    return res.data;
  },

  approveItem: async (id) => {
    const res = await api.patch(`/admin/items/${id}/approve`);
    return res.data;
  },

  rejectItem: async (id, reason) => {
    const res = await api.patch(`/admin/items/${id}/reject`, { reason });
    return res.data;
  },

  // 5. Wanted Items
  getWantedItems: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);

    const res = await api.get(`/admin/wanted?${query.toString()}`);
    return res.data;
  },

  // 6. Requests
  getRequests: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);

    const res = await api.get(`/admin/requests?${query.toString()}`);
    return res.data;
  },

  getRequestDetails: async (id) => {
    const res = await api.get(`/admin/requests/${id}`);
    return res.data;
  },

  // 7. Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);

    const res = await api.get(`/admin/transactions?${query.toString()}`);
    return res.data;
  },

  getTransactionDetails: async (id) => {
    const res = await api.get(`/admin/transactions/${id}`);
    return res.data;
  },

  // 8. Reports & Dispute Moderation
  getReports: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.targetType) query.append('targetType', params.targetType);

    const res = await api.get(`/admin/reports?${query.toString()}`);
    return res.data;
  },

  getReportDetails: async (id) => {
    const res = await api.get(`/admin/reports/${id}`);
    return res.data;
  },

  resolveReport: async (id, data) => {
    const res = await api.patch(`/admin/reports/${id}/resolve`, data);
    return res.data;
  },

  // 9. Categories Management
  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.patch(`/admin/categories/${id}`, data);
    return res.data;
  },

  toggleCategoryStatus: async (id, status) => {
    const res = await api.patch(`/admin/categories/${id}/status`, { status });
    return res.data;
  },

  // 10. Platform Settings & Points Rules
  getSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  updateSettings: async (data) => {
    const res = await api.put('/admin/settings', data);
    return res.data;
  },

  getPointsSettings: async () => {
    const res = await api.get('/admin/points-settings');
    return res.data;
  },

  updatePointsSettings: async (data) => {
    const res = await api.put('/admin/points-settings', data);
    return res.data;
  },

  getLocationRules: async () => {
    const res = await api.get('/admin/location-rules');
    return res.data;
  },

  updateLocationRules: async (data) => {
    const res = await api.put('/admin/location-rules', data);
    return res.data;
  },

  getPointsLedger: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.userId) query.append('userId', params.userId);

    try {
      const res = await api.get(`/points/admin/ledger?${query.toString()}`);
      return res.data;
    } catch {
      const res = await api.get(`/points/history?${query.toString()}`);
      return res.data;
    }
  },

  awardUserPoints: async (data) => {
    const res = await api.post('/points/manual-award', data);
    return res.data;
  },

  // 11. Security Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.targetType) query.append('targetType', params.targetType);
    if (params.action) query.append('action', params.action);

    const res = await api.get(`/admin/audit-logs?${query.toString()}`);
    return res.data;
  }
};

export default adminService;
