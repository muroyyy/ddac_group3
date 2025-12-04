const API_BASE_URL = (
  import.meta.env.VITE_API_URL as string
) || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://bloodline.dev/api'
);

export interface DashboardStats {
  totalInventory: number;
  pendingApprovals: number;
  lowStockCount: number;
  systemHealth: string;
}

export interface BloodInventoryItem {
  id: number;
  bloodType: string;
  units: number;
  status: string;
  lastUpdated: string;
  hospitalId: number;
}

export interface ApprovalRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  requestType: string;
  bloodType?: string;
  status: string;
  createdAt: string;
}

export const hospitalAPI = {
  getDashboardStats: async (hospitalId: number): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/hospital/dashboard/stats?hospitalId=${hospitalId}`);
    return response.json();
  },

  getBloodInventory: async (hospitalId: number): Promise<BloodInventoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/hospital/blood-inventory?hospitalId=${hospitalId}`);
    return response.json();
  },

  addBloodInventory: async (item: Partial<BloodInventoryItem>): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/blood-inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return response.json();
  },

  updateBloodInventory: async (id: number, item: Partial<BloodInventoryItem>): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/blood-inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return response.json();
  },

  deleteBloodInventory: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/blood-inventory/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getApprovalRequests: async (): Promise<ApprovalRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/hospital/approval-requests`);
    return response.json();
  },

  updateApprovalRequest: async (id: number, status: string, reviewedBy: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/approval-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewedBy }),
    });
    return response.json();
  },
};
