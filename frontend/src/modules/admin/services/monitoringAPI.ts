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
const USE_MOCK_METRICS = false;

export interface SystemMetrics {
  ec2: {
    cpuUtilization: number;
    networkIn: number;
    networkOut: number;
    diskIOPS: number;
  };
  rds: {
    cpuUtilization: number;
    connections: number;
    freeStorageGB: number;
    readIOPS: number;
    writeIOPS: number;
  };
  s3: {
    frontendBucket: {
      sizeGB: number;
      objects: number;
    };
    assetsBucket: {
      sizeGB: number;
      objects: number;
    };
    totalSizeGB: number;
    totalObjects: number;
  };
  cloudfront: {
    requests: number;
    dataTransferGB: number;
    cacheHitRate: number;
    errorRate: number;
  };
  route53: {
    queryCount24h: number;
    healthCheckStatus: string;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const jitter = (value: number, percent: number) => {
  const delta = value * percent * (Math.random() * 2 - 1);
  return value + delta;
};

const generateMockMetrics = (): SystemMetrics => {
  const ec2Cpu = clamp(jitter(22, 0.4), 5, 65);
  const ec2NetworkIn = clamp(jitter(58, 0.5), 5, 180);
  const ec2NetworkOut = clamp(jitter(42, 0.5), 5, 160);
  const ec2DiskIops = clamp(jitter(320, 0.6), 40, 1200);

  const rdsCpu = clamp(jitter(18, 0.4), 4, 55);
  const rdsConnections = Math.round(clamp(jitter(64, 0.6), 8, 220));
  const rdsFreeStorage = clamp(jitter(112, 0.08), 90, 140);
  const rdsReadIops = Math.round(clamp(jitter(140, 0.5), 30, 500));
  const rdsWriteIops = Math.round(clamp(jitter(110, 0.5), 20, 450));

  const s3FrontendSize = clamp(jitter(3.8, 0.03), 3.2, 5.2);
  const s3AssetsSize = clamp(jitter(1.4, 0.04), 0.9, 2.4);
  const s3FrontendObjects = Math.round(clamp(jitter(1280, 0.1), 800, 2600));
  const s3AssetsObjects = Math.round(clamp(jitter(860, 0.1), 500, 1800));

  const cfCacheHit = clamp(jitter(91, 0.02), 85, 98);
  const cfRequests = Math.round(clamp(jitter(142000, 0.15), 60000, 260000));
  const cfTransfer = clamp(jitter(84, 0.12), 30, 180);
  const cfErrorRate = clamp(jitter(0.6, 0.4), 0.1, 2.5);

  const r53Queries = Math.round(clamp(jitter(52000, 0.2), 12000, 120000));

  return {
    ec2: {
      cpuUtilization: ec2Cpu,
      networkIn: ec2NetworkIn,
      networkOut: ec2NetworkOut,
      diskIOPS: ec2DiskIops,
    },
    rds: {
      cpuUtilization: rdsCpu,
      connections: rdsConnections,
      freeStorageGB: rdsFreeStorage,
      readIOPS: rdsReadIops,
      writeIOPS: rdsWriteIops,
    },
    s3: {
      frontendBucket: {
        sizeGB: s3FrontendSize,
        objects: s3FrontendObjects,
      },
      assetsBucket: {
        sizeGB: s3AssetsSize,
        objects: s3AssetsObjects,
      },
      totalSizeGB: s3FrontendSize + s3AssetsSize,
      totalObjects: s3FrontendObjects + s3AssetsObjects,
    },
    cloudfront: {
      requests: cfRequests,
      dataTransferGB: cfTransfer,
      cacheHitRate: cfCacheHit,
      errorRate: cfErrorRate,
    },
    route53: {
      queryCount24h: r53Queries,
      healthCheckStatus: 'Healthy',
    },
  };
};

export const monitoringAPI = {
  getMetrics: async (): Promise<SystemMetrics> => {
    if (USE_MOCK_METRICS) {
      return Promise.resolve(generateMockMetrics());
    }
    const response = await fetch(`${API_BASE_URL}/monitoring/metrics`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  }
};
