import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const verificationAPI = {
  getPendingVerifications: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/verification/pending`);
    return parseJsonResponse(response);
  },

  approveUser: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/verification/approve/${userId}`, {
      method: 'POST',
    });
    return parseJsonResponse(response);
  },

  rejectUser: async (userId: number, reason: string): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/verification/reject/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return parseJsonResponse(response);
  },

  getDocumentUrl: async (documentId: number): Promise<string> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/verification/document/${documentId}`);
    const data = await parseJsonResponse(response);
    return data.data.url;
  },
};
