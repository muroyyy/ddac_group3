/**
 * Patient API Service
 * ==============================================
 * Real API calls to backend with correct endpoint paths
 * Mirrors donorAPI structure but for patient-specific routes
 *
 * Backend routes:
 * - GET /api/patient/{patientId}/dashboard
 * - GET /api/patient/{patientId}/requests
 * - POST /api/patient/{patientId}/request
 */

// Correct API base URL construction
// Uses VITE_EC2_PUBLIC_IP environment variable if available (for production)
// Falls back to localhost:5000 for development
const API_BASE_URL = import.meta.env.VITE_EC2_PUBLIC_IP
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api`
  : 'http://localhost:5000/api';

console.log('🔧 Patient API Base URL:', API_BASE_URL);

// =====================================================
// Type Definitions
// =====================================================

export interface PatientDashboard {
  totalRequests?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  fulfilled?: number;
  upcomingAppointments?: number;
}

export interface PatientProfile {
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  location?: string;
}

export interface BloodRequest {
  id?: number;
  bloodType?: string;
  unitsRequested?: number;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export interface Appointment {
  id?: number;
  hospitalName?: string;
  date?: string;
  time?: string;
  status?: string;
}

export interface NotificationItem {
  id?: number;
  title?: string;
  body?: string;
  date?: string;
  read?: boolean;
}

// =====================================================
// Safe JSON Response Parser
// =====================================================
/**
 * Parse JSON response safely
 * Detects and logs HTML error responses instead of crashing
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');

  // If response is not JSON, log the HTML error and throw
  if (!contentType?.includes('application/json')) {
    let bodyText = '';
    try {
      bodyText = await response.text();
      if (bodyText.length > 300) {
        bodyText = bodyText.substring(0, 300) + '...[truncated]';
      }
    } catch {
      bodyText = '(unable to read response body)';
    }

    const errorMsg = `Expected JSON but got ${contentType || 'unknown content-type'}. Status: ${response.status}. Body: ${bodyText}`;
    console.error('❌ Non-JSON Response:', errorMsg);
    throw new Error(errorMsg);
  }

  return response.json();
}

// =====================================================
// Patient API Service
// =====================================================

export const patientAPI = {
  /**
   * Get patient dashboard statistics
   * GET /api/patient/{patientId}/dashboard
   */
  getPatientDashboard: async (patientId: number): Promise<PatientDashboard> => {
    console.log(`📡 Fetching patient dashboard: ${API_BASE_URL}/patient/${patientId}/dashboard`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/dashboard`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonResponse(response);
      console.log('✅ Patient dashboard data loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching patient dashboard:', error);
      // Return safe defaults if API fails
      return {
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        fulfilled: 0,
        upcomingAppointments: 0,
      };
    }
  },

  /**
   * Get patient profile
   * GET /api/patient/{patientId}/profile (or use /api/auth endpoints)
   */
  getPatientProfile: async (patientId: number): Promise<PatientProfile> => {
    console.log(`📡 Fetching patient profile: ${API_BASE_URL}/patient/${patientId}/profile`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/profile`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonResponse(response);
      console.log('✅ Patient profile loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching patient profile:', error);
      return { userId: patientId };
    }
  },

  /**
   * Update patient profile
   * PUT /api/patient/{patientId}/profile
   */
  updatePatientProfile: async (patientId: number, data: Partial<PatientProfile>): Promise<{ message: string }> => {
    console.log(`📡 Updating patient profile: ${API_BASE_URL}/patient/${patientId}/profile`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await parseJsonResponse(response);
      console.log('✅ Profile updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating patient profile:', error);
      throw error;
    }
  },

  /**
   * Create a blood request
   * POST /api/patient/{patientId}/request
   */
  createBloodRequest: async (
    patientId: number,
    data: { bloodType?: string; unitsRequested?: number; notes?: string }
  ): Promise<{ message: string; id?: number }> => {
    console.log(`📡 Creating blood request: ${API_BASE_URL}/patient/${patientId}/request`, data);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await parseJsonResponse(response);
      console.log('✅ Blood request created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating blood request:', error);
      throw error;
    }
  },

  /**
   * Get patient's blood requests
   * GET /api/patient/{patientId}/requests
   */
  getBloodRequests: async (patientId: number): Promise<BloodRequest[]> => {
    console.log(`📡 Fetching blood requests: ${API_BASE_URL}/patient/${patientId}/requests`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/requests`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonResponse(response);
      console.log('✅ Blood requests loaded:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching blood requests:', error);
      return [];
    }
  },

  /**
   * Get patient appointments (if available)
   * GET /api/patient/{patientId}/appointments
   */
  getPatientAppointments: async (patientId: number): Promise<Appointment[]> => {
    console.log(`📡 Fetching appointments: ${API_BASE_URL}/patient/${patientId}/appointments`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/appointments`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonResponse(response);
      console.log('✅ Appointments loaded:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      return [];
    }
  },

  /**
   * Get notifications (if available)
   * GET /api/patient/{patientId}/notifications
   */
  getNotifications: async (patientId: number): Promise<NotificationItem[]> => {
    console.log(`📡 Fetching notifications: ${API_BASE_URL}/patient/${patientId}/notifications`);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}/notifications`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await parseJsonResponse(response);
      console.log('✅ Notifications loaded:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  },
};
