const API_BASE_URL = import.meta.env.VITE_EC2_PUBLIC_IP 
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
  location?: string;
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
      const stored = localStorage.getItem('bloodline_session');
      const session = stored ? JSON.parse(stored) : null;
      const adminUserId = session?.user?.id || 0;

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, adminUserId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  updateUserStatus: async (userId: number, status: string): Promise<boolean> => {
    try {
      const stored = localStorage.getItem('bloodline_session');
      const session = stored ? JSON.parse(stored) : null;
      const adminUserId = session?.user?.id || 0;

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminUserId }),
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
  getProfile: async (): Promise<{ success: boolean; data?: User; message?: string }> => {
    try {
      const stored = localStorage.getItem('bloodline_session');
      if (!stored) return { success: false, message: 'Not authenticated' };
      const session = JSON.parse(stored);
      const userId = session.user?.id;
      if (!userId) return { success: false, message: 'User ID not found' };

      const response = await fetch(`${API_BASE_URL}/admin/profile?userId=${userId}`);
      if (!response.ok) {
        return { success: false, message: 'Failed to fetch profile' };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, message: 'Network error' };
    }
  },

  updateProfile: async (profileData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const stored = localStorage.getItem('bloodline_session');
      if (!stored) return { success: false, message: 'Not authenticated' };
      const session = JSON.parse(stored);
      const userId = session.user?.id;
      if (!userId) return { success: false, message: 'User ID not found' };

      const response = await fetch(`${API_BASE_URL}/admin/profile?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        return { success: false, message: 'Failed to update profile' };
      }
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Network error' };
    }
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const stored = localStorage.getItem('bloodline_session');
      if (!stored) return { success: false, message: 'Not authenticated' };
      const session = JSON.parse(stored);
      const userId = session.user?.id;
      if (!userId) return { success: false, message: 'User ID not found' };

      const response = await fetch(`${API_BASE_URL}/admin/profile/password?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update password' };
      }
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, message: 'Network error' };
    }
  },
};