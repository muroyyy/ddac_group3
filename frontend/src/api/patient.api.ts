import { API_BASE_URL, authenticatedFetch, parseJsonResponse } from './client';

export const patientAPI = {
  getDashboard: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/dashboard/patient/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  getInsights: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/insights/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  createBloodRequest: async (userId: number, data: any): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/blood-request/${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return parseJsonResponse(response);
  },

  getMyRequests: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/blood-requests/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  getAppointments: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/appointments/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  cancelAppointment: async (appointmentId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/cancel-appointment/${appointmentId}`,
      { method: 'PUT' }
    );
    return parseJsonResponse(response);
  },

  getProfile: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/profile/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  updateProfile: async (userId: number, data: any): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/profile/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return parseJsonResponse(response);
  },

  getNotifications: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notification/${userId}`,
      { method: 'GET' }
    );
    return parseJsonResponse(response);
  },

  markNotificationRead: async (notificationId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notification/mark-read/${notificationId}`,
      { method: 'PUT' }
    );
    return parseJsonResponse(response);
  },

  sendEmail: async (subject: string, message: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/email/send`,
      {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      }
    );
    return parseJsonResponse(response);
  },
};
