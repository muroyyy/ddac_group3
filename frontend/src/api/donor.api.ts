import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const donorAPI = {
  getDashboard: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/donor/dashboard`);
    return parseJsonResponse(response);
  },

  getDonationHistory: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/donor/history`);
    return parseJsonResponse(response);
  },

  getPendingRequests: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/donor/pending-requests`);
    return parseJsonResponse(response);
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/donor/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return parseJsonResponse(response);
  },
};
