// API Configuration with fallback
const getApiBaseUrl = () => {
  // Check if we're in production and have EC2 IP
  if (import.meta.env.VITE_EC2_PUBLIC_IP && import.meta.env.PROD) {
    return `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5269/api`;
  }
  // Development fallback
  return 'http://localhost:5269/api';
};

const API_BASE_URL = getApiBaseUrl();

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
      
      // Check if it's a connection timeout or network error
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
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
    const response = await fetch(`${API_BASE_URL}/verification/pending`);
    return parseJsonResponse(response);
  },

  approveUser: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/approve/${userId}`, {
      method: 'POST',
    });
    return parseJsonResponse(response);
  },

  rejectUser: async (userId: number, reason: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/reject/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },
};

