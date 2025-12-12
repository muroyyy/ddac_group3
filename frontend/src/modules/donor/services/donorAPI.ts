const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://bloodline.dev/api';

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
  hospitalName?: string;
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
  availabilityStatus: string;
  eligibleForImmediate: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  location: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: number;
  hospitalName: string;
  date: string;
  time: string;
  status: string;
  bloodType: string;
  units: number;
}

export const donorAPI = {
  getProfile: async (userId: number): Promise<DonorProfile> => {
    const response = await fetch(`${API_BASE_URL}/donor/profile/${userId}`);
    return response.json();
  },

  updateProfile: async (userId: number, data: { bloodType?: string; location: string; isAvailable: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/donor/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  createDonationRequest: async (userId: number, data: { bloodType: string; unitsRequested: number; notes?: string; hospitalId: number }) => {
    const response = await fetch(`${API_BASE_URL}/donor/donation-request?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDonationRequests: async (userId: number): Promise<DonationRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/donation-requests/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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

  getHospitals: async (): Promise<Hospital[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/hospitals`);
    return response.json();
  },

  getAppointments: async (userId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/appointments/${userId}`);
    return response.json();
  },

  getCompletedDonations: async (userId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/completed-donations/${userId}`);
    return response.json();
  },

  getAppointmentHistory: async (userId: number): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/donor/appointment-history/${userId}`);
    return response.json();
  },
};
