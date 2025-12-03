// API Configuration with custom domain support
const getApiBaseUrl = () => {
  // Check if we're accessing via custom domain
  if (window.location.hostname === 'bloodline.dev' || window.location.hostname === 'www.bloodline.dev') {
    return 'https://bloodline.dev';
  }
  // Check if we're in production and have EC2 IP
  if (import.meta.env.VITE_EC2_PUBLIC_IP && import.meta.env.PROD) {
    return `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000`;
  }
  // Development fallback
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

export interface AnalyticsOverview {
  totalUsers: number;
  totalDonors: number;
  totalPatients: number;
  totalHospitals: number;
  activeUsers: number;
  newUsersToday: number;
}

export interface UserGrowthData {
  date: string;
  count: number;
}

export interface UserDistribution {
  role: string;
  count: number;
}

export interface BloodTypeDistribution {
  bloodType: string;
  count: number;
}

export const analyticsAPI = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/overview`);
    if (!response.ok) throw new Error('Failed to fetch overview');
    return response.json();
  },

  getUserGrowth: async (): Promise<UserGrowthData[]> => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/user-growth`);
    if (!response.ok) throw new Error('Failed to fetch user growth');
    return response.json();
  },

  getUserDistribution: async (): Promise<UserDistribution[]> => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/user-distribution`);
    if (!response.ok) throw new Error('Failed to fetch user distribution');
    return response.json();
  },

  getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/blood-type-distribution`);
    if (!response.ok) throw new Error('Failed to fetch blood type distribution');
    return response.json();
  }
};