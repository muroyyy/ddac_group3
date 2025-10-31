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
  phone?: string;
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
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        activeDonors: 0,
        bloodRequests: 0,
        systemHealth: 'Unknown'
      };
    }
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getUser: async (userId: number): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  updateUserStatus: async (userId: number, status: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  },

  // Blood Inventory
  getBloodInventory: async (): Promise<BloodInventoryItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blood-inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch blood inventory');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching blood inventory:', error);
      return [];
    }
  },

  // System Alerts
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/alerts`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  // Activity Logs
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/activity-logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  },

  // Profile Management
  getProfile: async (): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`);
      const data = await response.json();
      return { success: response.ok, data: response.ok ? data : null, message: data.message };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, message: 'Network error' };
    }
  },

  updateProfile: async (profileData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Network error' };
    }
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, message: 'Network error' };
    }
  },
};