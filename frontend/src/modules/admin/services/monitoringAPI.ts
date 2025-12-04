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
    networkOut: number;
    memoryUsage: number;
    diskIOPS: number;
  };
  rds: {
    cpuUtilization: number;
    connections: number;
    maxConnections: number;
    freeStorageGB: number;
    readIOPS: number;
  };
  s3: {
    frontendBucket: {
      sizeGB: number;
      objects: number;
      getRequests: number;
      putRequests: number;
    };
    assetsBucket: {
      sizeGB: number;
      objects: number;
      getRequests: number;
      putRequests: number;
    };
    totalDataTransferGB: number;
  };
  cloudfront: {
    cacheHitRate: number;
    requests: number;
    originLatencyMs: number;
    errorRate: number;
    dataTransferGB: number;
    sslCertificateStatus: string;
  };
  route53: {
    queryCount24h: number;
    responseTimeMs: number;
    healthCheckStatus: string;
    hostedZoneStatus: string;
    recordTypes: string[];
    averageTTL: number;
  };
}

export const monitoringAPI = {
  getMetrics: async (): Promise<SystemMetrics> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/metrics`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  }
};