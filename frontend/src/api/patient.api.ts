/**
 * PATIENT API SERVICE
 * 
 * This module handles all API communication between the frontend and backend
 * for patient-related operations. It provides a clean interface for:
 * 
 * - Authentication (automatically adds session tokens)
 * - Error handling (standardized response parsing)
 * - Type safety (TypeScript interfaces)
 * - Consistent URL structure
 * 
 * SECURITY FEATURES:
 * - All requests use authenticatedFetch (includes session token)
 * - User ID validation on backend
 * - Proper error handling and user feedback
 */

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

  /**
   * CREATE BLOOD REQUEST API CALL
   * 
   * PURPOSE: Submits a new blood request from patient to hospital
   * 
   * FLOW:
   * 1. Sends POST request to backend with user ID and request data
   * 2. Backend validates user is a patient
   * 3. Backend converts user ID to patient ID for security
   * 4. Backend creates blood_requests record in database
   * 5. Backend sends confirmation notification to patient
   * 6. Hospital staff will later review and approve/reject
   * 
   * BUSINESS LOGIC:
   * - Creates pending blood request
   * - When approved by hospital, appointment is automatically created
   * - Patient receives notifications on status changes
   * 
   * @param userId - The authenticated user's ID
   * @param data - Blood request details (bloodType, units, urgency, hospitalId, notes)
   * @returns Promise with success/failure response
   */
  createBloodRequest: async (userId: number, data: any): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/blood-request/${userId}`,  // URL: POST /api/patient/blood-request/123
      {
        method: 'POST',  // HTTP POST method to create new data
        body: JSON.stringify(data),  // Convert request data to JSON
      }
    );
    return parseJsonResponse(response);  // Handle response and errors
  },

  /**
   * GET BLOOD REQUESTS API CALL
   * 
   * PURPOSE: Retrieves patient's blood request history
   * 
   * FLOW:
   * 1. Sends GET request to backend with user ID
   * 2. Backend converts user ID to patient ID for security
   * 3. Backend queries blood_requests table for this patient
   * 4. Backend JOINs with hospitals table to get hospital names
   * 5. Frontend receives formatted request history
   * 
   * USED BY: ViewRequests page to show request status and history
   * 
   * @param userId - The authenticated user's ID
   * @returns Promise with blood request history data
   */
  getMyRequests: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/blood-requests/${userId}`,  // URL: GET /api/patient/blood-requests/123
      { method: 'GET' }  // HTTP GET method to retrieve data
    );
    return parseJsonResponse(response);  // Convert response to JSON and handle errors
  },

  /**
   * GET APPOINTMENTS API CALL
   * 
   * PURPOSE: Retrieves all appointments for the logged-in patient
   * 
   * FLOW:
   * 1. Sends GET request to backend with user ID
   * 2. Backend converts user ID to patient ID for security
   * 3. Backend queries database and returns appointment data
   * 4. Frontend receives formatted appointment list
   * 
   * SECURITY: Uses authenticatedFetch to include session token
   * 
   * @param userId - The authenticated user's ID from login session
   * @returns Promise with appointment data or error message
   */
  getAppointments: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/appointments/${userId}`,  // URL: GET /api/patient/appointments/123
      { method: 'GET' }  // HTTP GET method to retrieve data
    );
    return parseJsonResponse(response);  // Convert response to JSON and handle errors
  },

  /**
   * CANCEL APPOINTMENT API CALL
   * 
   * PURPOSE: Allows patient to cancel an upcoming appointment
   * 
   * FLOW:
   * 1. Sends PUT request to backend with appointment ID
   * 2. Backend validates appointment exists and is "Upcoming"
   * 3. Backend updates appointment status to "Cancelled"
   * 4. Frontend receives success/failure response
   * 
   * BUSINESS RULE: Only "Upcoming" appointments can be cancelled
   * 
   * @param appointmentId - The ID of the appointment to cancel
   * @returns Promise with success/failure message
   */
  cancelAppointment: async (appointmentId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/cancel-appointment/${appointmentId}`,  // URL: PUT /api/patient/cancel-appointment/456
      { method: 'PUT' }  // HTTP PUT method to update data
    );
    return parseJsonResponse(response);  // Handle response and errors
  },

  /**
   * GET PATIENT PROFILE API CALL
   * 
   * PURPOSE: Retrieves patient's profile information including blood type
   * 
   * FLOW:
   * 1. Sends GET request to backend with user ID
   * 2. Backend JOINs users and patient_profile tables
   * 3. Backend returns combined user and medical profile data
   * 4. Frontend uses this to pre-fill forms and display profile
   * 
   * USED BY:
   * - RequestBlood page (to get blood type)
   * - Profile page (to display/edit profile)
   * - Dashboard (to show patient info)
   * 
   * @param userId - The authenticated user's ID
   * @returns Promise with patient profile data
   */
  getProfile: async (userId: number): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/patient/profile/${userId}`,  // URL: GET /api/patient/profile/123
      { method: 'GET' }  // HTTP GET method to retrieve data
    );
    return parseJsonResponse(response);  // Convert response to JSON and handle errors
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
