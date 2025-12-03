// API Configuration with custom domain support
const getApiBaseUrl = () => {
  // Check if we're accessing via custom domain
  if (window.location.hostname === 'bloodline.dev' || window.location.hostname === 'www.bloodline.dev') {
    return 'https://bloodline.dev/api';
  }
  // Check if we're in production and have EC2 IP
  if (import.meta.env.VITE_EC2_PUBLIC_IP && import.meta.env.PROD) {
    return `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api`;
  }
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface AuditLog {
  logId: number;
  actionType: string;
  performedBy: number | null;
  userName: string;
  userEmail: string | null;
  userRole: string | null;
  timestamp: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
}

export interface AuditFilters {
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const auditLogsAPI = {
  getLogs: async (filters: AuditFilters = {}): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      pageSize: (filters.pageSize || 50).toString()
    });
    
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.startDate) params.append('startDate', new Date(filters.startDate).toISOString());
    if (filters.endDate) params.append('endDate', new Date(filters.endDate).toISOString());

    const response = await fetch(`${API_BASE_URL}/audit/logs?${params}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  getActionTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/audit/action-types`);
    if (!response.ok) throw new Error('Failed to fetch action types');
    return response.json();
  },

  exportLogs: async (filters: Omit<AuditFilters, 'page' | 'pageSize'> = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.startDate) params.append('startDate', new Date(filters.startDate).toISOString());
    if (filters.endDate) params.append('endDate', new Date(filters.endDate).toISOString());

    const response = await fetch(`${API_BASE_URL}/audit/export?${params}`);
    if (!response.ok) throw new Error('Failed to export audit logs');
    return response.blob();
  }
};