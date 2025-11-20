const API_BASE_URL = 'http://localhost:5000/api';

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
    const response = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!response.ok) throw new Error('Failed to fetch overview');
    return response.json();
  },

  getUserGrowth: async (): Promise<UserGrowthData[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/user-growth`);
    if (!response.ok) throw new Error('Failed to fetch user growth');
    return response.json();
  },

  getUserDistribution: async (): Promise<UserDistribution[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/user-distribution`);
    if (!response.ok) throw new Error('Failed to fetch user distribution');
    return response.json();
  },

  getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
    const response = await fetch(`${API_BASE_URL}/analytics/blood-type-distribution`);
    if (!response.ok) throw new Error('Failed to fetch blood type distribution');
    return response.json();
  }
};