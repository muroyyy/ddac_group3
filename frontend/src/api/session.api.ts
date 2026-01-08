import { sessionManager } from '../utils/sessionManager';
import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const sessionAPI = {
  validateToken: async (): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/validate`);
      return parseJsonResponse(response);
    } catch {
      return { valid: false };
    }
  },

  refreshToken: async (): Promise<{ success: boolean; token?: string }> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
      });
      return parseJsonResponse(response);
    } catch {
      return { success: false };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore errors on logout
    } finally {
      sessionManager.clearSession();
    }
  },
};
