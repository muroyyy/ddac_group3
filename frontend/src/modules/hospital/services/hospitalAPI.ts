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
  doctorNote?: string;
}

export const hospitalAPI = {
  // Blood Requests Management
  getBloodRequests: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/blood-requests/${userId}`);
    return response.json();
  },

  getAllBloodRequests: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/all-blood-requests/${userId}`);
    return response.json();
  },

  approveRequest: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  rejectRequest: async (id: number, rejectionNotes?: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionNotes }),
    });
    return response.json();
  },

  // Patient Appointments Management
  createAppointment: async (data: { requestId: number; doctorName: string; appointmentDate: Date; initialNotes?: string }): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/appointments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAppointments: async (userId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/hospital/appointments/${userId}`);
    const result = await response.json();
    return result.success ? (result.data || []) : [];
  },

  completeAppointment: async (id: number, doctorNotes?: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/appointments/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorNotes }),
    });
    return response.json();
  },

  cancelAppointment: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/appointments/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Doctors Management
  getDoctors: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/doctors/${userId}`);
    return response.json();
  },

  // Donor Requests Management
  getDonorRequests: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-requests/${userId}`);
    return response.json();
  },

  approveDonorRequest: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  rejectDonorRequest: async (id: number, rejectionNotes?: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionNotes }),
    });
    return response.json();
  },

  // Donor Appointments Management
  getDonorAppointments: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-appointments/${userId}`);
    return response.json();
  },

  createDonorAppointment: async (data: { donationId: number; appointmentDate: Date; appointmentTime: string }): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-appointments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  completeDonorAppointment: async (id: number, unitsCollected: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-appointments/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitsCollected }),
    });
    return response.json();
  },

  cancelDonorAppointment: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/donor-appointments/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  // Blood Inventory Management
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

  // Staff Profile Management
  getStaffProfile: async (userId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/hospital/staff-profile/${userId}`);
    return response.json();
  },

  updateStaffProfile: async (userId: number, data: { fullName?: string; email?: string; phone?: string; position?: string }): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/hospital/staff-profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Dashboard Stats
  getDashboardStats: async (hospitalId: number): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/hospital/dashboard/stats?hospitalId=${hospitalId}`);
    return response.json();
  },

  // Approval Requests
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
