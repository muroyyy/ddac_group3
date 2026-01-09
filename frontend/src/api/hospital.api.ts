import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const hospitalAPI = {
  getDashboard: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/dashboard`);
    return parseJsonResponse(response);
  },

  getInventory: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/inventory`);
    return parseJsonResponse(response);
  },

  updateInventory: async (inventoryData: any): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/inventory`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData),
    });
    return parseJsonResponse(response);
  },

  getApprovals: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/approvals`);
    return parseJsonResponse(response);
  },

  approveRequest: async (requestId: number): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/approvals/${requestId}/approve`, {
      method: 'POST',
    });
    return parseJsonResponse(response);
  },

  getAllHospitals: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/list`);
    return parseJsonResponse(response);
  },

  getDonorAppointments: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospital/donor-appointments/${userId}`);
    return parseJsonResponse(response);
  },
};

export const hospitalCodeAPI = {
  getAllCodes: async (): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospitalcode/list`);
    return parseJsonResponse(response);
  },

  generateCode: async (hospitalId: number): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospitalcode/generate`, {
      method: 'POST',
      body: JSON.stringify({ hospitalId }),
    });
    return parseJsonResponse(response);
  },

  validateCode: async (verificationCode: string, hospitalId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospitalcode/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verificationCode, hospitalId }),
    });
    return parseJsonResponse(response);
  },

  deactivateCode: async (codeId: number): Promise<any> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/hospitalcode/deactivate/${codeId}`, {
      method: 'POST',
    });
    return parseJsonResponse(response);
  },
};
