import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const adminAPI = {
  getDashboardStats: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return parseJsonResponse(response);
  },

  getUsers: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/users`);
    return parseJsonResponse(response);
  },

  getSystemAlerts: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/alerts`);
    return parseJsonResponse(response);
  },

  getActivityLogs: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/activity-logs`);
    return parseJsonResponse(response);
  },

  getBloodInventory: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/blood-inventory`);
    return parseJsonResponse(response);
  },
};
