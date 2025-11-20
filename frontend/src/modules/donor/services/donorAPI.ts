const API_BASE_URL = import.meta.env.VITE_EC2_PUBLIC_IP 
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api`
  : 'http://localhost:5269/api';

export interface DonorProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  isAvailable: boolean;
  lastDonationDate?: string;
}

export interface DonationRequest {
  id: number;
  bloodType: string;
  unitsRequested: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DonationHistory {
  id: number;
  hospitalName: string;
  bloodType: string;
  unitsDonated: number;
  donationDate: string;
  status: string;
}

export interface DashboardStats {
  totalDonations: number;
  pendingRequests: number;
  bloodType: string;
  lastDonation?: string;
  isAvailable: boolean;
}

export const donorAPI = {
  getProfile: async (userId: number): Promise<DonorProfile> => {
    const response = await fetch(`${API_BASE_URL}/donor/profile/${userId}`);
    return response.json();
  },

  updateProfile: async (userId: number, data: { bloodType: string; location: string; isAvailable: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/donor/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  createDonationRequest: async (userId: number, data: { bloodType: string; unitsRequested: number; notes?: string }) => {
    const response = await fetch(`${API_BASE_URL}/donor/donation-request?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDonationRequests: async (userId: number): Promise<DonationRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/donation-requests/${userId}`);
    return response.json();
  },

  getDonationHistory: async (userId: number): Promise<DonationHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/donation-history/${userId}`);
    return response.json();
  },

  getDashboardStats: async (userId: number): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/donor/dashboard-stats/${userId}`);
    return response.json();
  },
};
