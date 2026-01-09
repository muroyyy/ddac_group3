import { sessionManager } from '../utils/sessionManager';
import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const sessionAPI = {
  validateToken: async (): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/validate`);
      const result = await parseJsonResponse(response);
      return result;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Check if error is due to HTML response
      if (error instanceof Error && error.message.includes('text/html')) {
        console.error('❌ Received HTML instead of JSON - auth endpoint may not be deployed');
      }
      return { valid: false };
    }
  },

  refreshToken: async (): Promise<{ success: boolean; token?: string }> => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
      });
      return parseJsonResponse(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      return { success: false };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Ignore errors on logout - still clear session
    } finally {
      sessionManager.clearSession();
    }
  },
};
