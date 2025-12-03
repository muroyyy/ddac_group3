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

export interface SystemMetrics {
  ec2: {
    cpuUtilization: number;
    networkIn: number;
  };
  rds: {
    cpuUtilization: number;
    connections: number;
    freeStorageGB: number;
  };
}

export const monitoringAPI = {
  getMetrics: async (): Promise<SystemMetrics> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/metrics`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  }
};