const API_BASE_URL = import.meta.env.PROD 
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api` 
  : 'http://localhost:5000/api';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};