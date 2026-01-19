import { API_BASE_URL, parseJsonResponse } from './client';

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
      
      const result = await parseJsonResponse(response);
      console.log('📦 Response data:', result);
      
      return result;
    } catch (error) {
      console.error('🚨 Login error caught:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: data
      });
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check if the server is running.`);
      }
      
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('📝 Register attempt:', {
      url: `${API_BASE_URL}/auth/register`,
      role: data.role,
      email: data.email,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Register response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      const result = await parseJsonResponse(response);
      console.log('📦 Register response data:', result);

      return result;
    } catch (error) {
      console.error('🚨 Register error caught:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: { ...data, password: '[REDACTED]' }
      });

      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check if the server is running.`);
      }

      throw error;
    }
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
    const registerUrl = `${API_BASE_URL}/auth/register`;
    console.log('📝 Register with files attempt:', {
      url: registerUrl,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(registerUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Register with files response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        contentType: response.headers.get('content-type')
      });

      const result = await parseJsonResponse(response);
      console.log('📦 Register with files data:', result);

      return result;
    } catch (error) {
      console.error('🚨 Register with files error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: registerUrl
      });

      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please check if the server is running.`);
      }

      throw error;
    }
  },
};
