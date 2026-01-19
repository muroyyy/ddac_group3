import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { monitoringAPI, type SystemMetrics } from '../services/monitoringAPI';
import ec2Icon from '../../../assets/aws-icons/ec2.svg';
import rdsIcon from '../../../assets/aws-icons/rds.svg';
import s3Icon from '../../../assets/aws-icons/s3.svg';
import cloudfrontIcon from '../../../assets/aws-icons/cloudfront.svg';
import route53Icon from '../../../assets/aws-icons/route53.svg';

const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const fetchMetrics = async () => {
    try {
      setError(null);
      const data = await monitoringAPI.getMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to load system metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <img src={ec2Icon} alt="EC2" className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Metrics</h3>
          <p className="text-red-600 mb-4">{error || 'Invalid data structure received'}</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
          <p className="text-sm text-gray-500">Real-time AWS CloudWatch metrics</p>
        </div>
        <div className="text-right">
          <button onClick={fetchMetrics} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* EC2 Instance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('ec2')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={ec2Icon} alt="EC2" className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">EC2 Instance</h3>
                  <p className="text-xs text-gray-500">i-04b9defc7f7f5c03c</p>
                </div>
              </div>
              {expandedCards.has('ec2') ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">CPU</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.ec2.cpuUtilization || 0).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Network In</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.ec2.networkIn || 0).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('ec2') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                    <span className="text-lg font-bold text-gray-900">{(metrics.ec2.cpuUtilization || 0).toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.ec2.cpuUtilization || 0}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Network In</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.ec2.networkIn || 0).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Network Out</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.ec2.networkOut || 0).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Disk IOPS</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.ec2.diskIOPS || 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RDS Instance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('rds')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={rdsIcon} alt="RDS" className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">RDS Instance</h3>
                  <p className="text-xs text-gray-500">dev-bloodline-rds</p>
                </div>
              </div>
              {expandedCards.has('rds') ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">CPU</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.rds.cpuUtilization || 0).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Connections</span>
                <p className="text-xl font-bold text-gray-900">{metrics.rds.connections || 0}</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('rds') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                    <span className="text-lg font-bold text-gray-900">{(metrics.rds.cpuUtilization || 0).toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics.rds.cpuUtilization || 0}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Active Connections</span>
                    <p className="text-lg font-bold text-gray-900">{metrics.rds.connections || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Free Storage</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.rds.freeStorageGB || 0).toFixed(2)} GB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Read IOPS</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.rds.readIOPS || 0).toFixed(0)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Write IOPS</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.rds.writeIOPS || 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* S3 Storage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('s3')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={s3Icon} alt="S3" className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">S3 Storage</h3>
                  <p className="text-xs text-gray-500">Frontend + Assets Buckets</p>
                </div>
              </div>
              {expandedCards.has('s3') ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Storage</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.s3.totalSizeGB || 0).toFixed(2)} GB</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Objects</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.s3.totalObjects || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('s3') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bucket Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">dev-bloodline-frontend</span>
                      <span className="font-medium">{(metrics.s3.frontendBucket.sizeGB || 0).toFixed(2)} GB ({(metrics.s3.frontendBucket.objects || 0).toLocaleString()} objects)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">dev-bloodline-assets</span>
                      <span className="font-medium">{(metrics.s3.assetsBucket.sizeGB || 0).toFixed(2)} GB ({(metrics.s3.assetsBucket.objects || 0).toLocaleString()} objects)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Size</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.s3.totalSizeGB || 0).toFixed(2)} GB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Objects</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.s3.totalObjects || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CloudFront CDN */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('cloudfront')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={cloudfrontIcon} alt="CloudFront" className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CloudFront CDN</h3>
                  <p className="text-xs text-gray-500">bloodline.dev distribution</p>
                </div>
              </div>
              {expandedCards.has('cloudfront') ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.cloudfront.cacheHitRate || 0).toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Requests (24h)</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.cloudfront.requests || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('cloudfront') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Cache Hit Rate</span>
                    <span className="text-lg font-bold text-gray-900">{(metrics.cloudfront.cacheHitRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${metrics.cloudfront.cacheHitRate || 0}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Requests (24h)</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.cloudfront.requests || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.cloudfront.errorRate || 0).toFixed(2)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Data Transfer (24h)</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.cloudfront.dataTransferGB || 0).toFixed(2)} GB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Distribution</span>
                    <p className="text-lg font-bold text-gray-900">E2YXSQ0ID9N5E0</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route53 DNS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard('route53')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={route53Icon} alt="Route53" className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Route53 DNS</h3>
                  <p className="text-xs text-gray-500">bloodline.dev zone</p>
                </div>
              </div>
              {expandedCards.has('route53') ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">DNS Queries (24h)</span>
                <p className="text-xl font-bold text-gray-900">{(metrics.route53.queryCount24h || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Health Checks</span>
                <p className="text-xl font-bold text-green-600">{metrics.route53.healthCheckStatus || 'Unknown'}</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('route53') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Query Count (24h)</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics.route53.queryCount24h || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Health Check Status</span>
                    <p className="text-lg font-bold text-green-600">{metrics.route53.healthCheckStatus || 'Unknown'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Hosted Zone</span>
                    <p className="text-lg font-bold text-gray-900">bloodline.dev</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Zone ID</span>
                    <p className="text-sm font-bold text-gray-900">Z00220291FD80DV180XVJ</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure Health Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-gray-900">All Systems</p>
            <p className="text-xs text-gray-500">Operational</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <img src={ec2Icon} alt="EC2" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">EC2</p>
            <p className="text-xs text-gray-500">Running</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <img src={rdsIcon} alt="RDS" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">RDS</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <img src={cloudfrontIcon} alt="CloudFront" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">CDN</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <img src={s3Icon} alt="S3" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">S3</p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;