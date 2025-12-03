import { sessionManager } from './sessionManager';

// API Configuration with fallback
const getApiBaseUrl = () => {
  // Check if we're accessing via custom domain
  if (window.location.hostname === 'bloodline.dev' || window.location.hostname === 'www.bloodline.dev') {
    return 'https://bloodline.dev/api';
  }
  // Check if we're in production and have EC2 IP
  if (import.meta.env.VITE_EC2_PUBLIC_IP && import.meta.env.PROD) {
    return `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api`;
  }
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper to get authenticated headers
const getAuthHeaders = (): HeadersInit => {
  const token = sessionManager.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper for authenticated fetch requests
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    sessionManager.clearSession();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  return response;
};

/**
 * Helper to safely parse JSON responses, handling non-JSON errors
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  // If response is not JSON, throw a descriptive error
  if (!contentType?.includes('application/json')) {
    let bodyText = '';
    try {
      bodyText = await response.text();
      // Limit output to 200 chars to avoid huge error messages
      if (bodyText.length > 200) {
        bodyText = bodyText.substring(0, 200) + '...';
      }
    } catch {
      bodyText = '(unable to read response body)';
    }
    
    const errorMsg = `Server returned ${contentType || 'unknown content type'}: ${bodyText}`;
    console.error('❌ Non-JSON Response:', { status: response.status, errorMsg });
    throw new Error(errorMsg);
  }
  
  return response.json();
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  bloodType?: string;
  location: string;
  password: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    bloodType?: string;
    location: string;
    verificationStatus?: string;
  };
  token?: string;
  mockEmailData?: {
    email: string;
    resetToken: string;
    expiresAt: string;
  };
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('🔐 Login attempt:', {
      url: `${API_BASE_URL}/auth/login`,
      email: data.email,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      // Handle non-JSON responses (404, 500, etc. returning HTML error pages)
      const result = await parseJsonResponse(response);
      console.log('📦 Response data:', result);
      
      return result;
    } catch (error) {
      console.error('🚨 Login error caught:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: data
      });
      
      // Check if it's a network error
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check if the server is running.`);
      }
      
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(response);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(response);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseJsonResponse(response);
  },

  registerWithFiles: async (formData: FormData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData, // No Content-Type header for FormData
    });
    return parseJsonResponse(response);
  },
};

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
};

// Donor API endpoints
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

// Hospital API endpoints
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
};

// Session management API
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

