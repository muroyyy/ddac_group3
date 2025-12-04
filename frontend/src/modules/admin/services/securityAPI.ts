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

export interface SecurityMetrics {
  failedLogins24h: number;
  activeSessions: number;
  sslCertificate: {
    status: string;
    expiryDate: string;
    daysUntilExpiry: number;
  };
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    passwordPolicyCompliance: number;
    twoFactorAdoption: number;
    dataEncryptionStatus: string;
  };
}

export const securityAPI = {
  getSecurityMetrics: async (): Promise<SecurityMetrics> => {
    const response = await fetch(`${API_BASE_URL}/admin/security/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch security metrics');
    }
    return response.json();
  },
};