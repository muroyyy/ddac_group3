const API_BASE_URL = import.meta.env.PROD 
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api` 
  : 'http://localhost:5000/api';

export interface DashboardStats {
  totalUsers: number;
  activeDonors: number;
  bloodRequests: number;
  systemHealth: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface BloodInventoryItem {
  bloodType: string;
  units: number;
  status: 'good' | 'warning' | 'critical';
}

export interface SystemAlert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  userRole: string;
}

export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      // Return mock data for now
      return {
        totalUsers: 0,
        activeDonors: 0,
        bloodRequests: 0,
        systemHealth: 'Unknown'
      };
    }
    return response.json();
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  updateUserStatus: async (userId: number, status: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.ok;
  },

  // Blood Inventory
  getBloodInventory: async (): Promise<BloodInventoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/blood-inventory`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  // System Alerts
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  },

  // Activity Logs
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/activity-logs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  },
};