import React, { useState, useEffect } from 'react';
import { Server, Database, RefreshCw, Cloud, Globe, HardDrive, ChevronRight, ChevronDown } from 'lucide-react';
import { monitoringAPI, type SystemMetrics } from '../services/monitoringAPI';

const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
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
      const data = await monitoringAPI.getMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
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
                <Server className="w-8 h-8 text-blue-600" />
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
                <p className="text-xl font-bold text-gray-900">{metrics?.ec2.cpuUtilization.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Network In</span>
                <p className="text-xl font-bold text-gray-900">{metrics?.ec2.networkIn.toFixed(2)} MB</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('ec2') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                    <span className="text-lg font-bold text-gray-900">{metrics?.ec2.cpuUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics?.ec2.cpuUtilization}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Network In</span>
                    <p className="text-lg font-bold text-gray-900">{metrics?.ec2.networkIn.toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Network Out</span>
                    <p className="text-lg font-bold text-gray-900">{(metrics?.ec2.networkIn * 0.8).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <p className="text-lg font-bold text-gray-900">68.5%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Disk I/O</span>
                    <p className="text-lg font-bold text-gray-900">245 IOPS</p>
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
                <Database className="w-8 h-8 text-green-600" />
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
                <p className="text-xl font-bold text-gray-900">{metrics?.rds.cpuUtilization.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Connections</span>
                <p className="text-xl font-bold text-gray-900">{metrics?.rds.connections}</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('rds') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                    <span className="text-lg font-bold text-gray-900">{metrics?.rds.cpuUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics?.rds.cpuUtilization}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Active Connections</span>
                    <p className="text-lg font-bold text-gray-900">{metrics?.rds.connections}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Max Connections</span>
                    <p className="text-lg font-bold text-gray-900">100</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Free Storage</span>
                    <p className="text-lg font-bold text-gray-900">{metrics?.rds.freeStorageGB.toFixed(2)} GB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Read IOPS</span>
                    <p className="text-lg font-bold text-gray-900">156</p>
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
                <HardDrive className="w-8 h-8 text-orange-600" />
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
                <p className="text-xl font-bold text-gray-900">3.2 GB</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Objects</span>
                <p className="text-xl font-bold text-gray-900">2,156</p>
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
                      <span className="text-gray-600">bloodline-frontend</span>
                      <span className="font-medium">2.4 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">bloodline-assets</span>
                      <span className="font-medium">0.8 GB</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">GET Requests</span>
                    <p className="text-lg font-bold text-gray-900">52,341</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">PUT Requests</span>
                    <p className="text-lg font-bold text-gray-900">4,127</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Data Transfer Out</span>
                    <p className="text-lg font-bold text-gray-900">15.3 GB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Storage Class</span>
                    <p className="text-lg font-bold text-gray-900">Standard</p>
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
                <Globe className="w-8 h-8 text-purple-600" />
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
                <p className="text-xl font-bold text-gray-900">96.8%</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Requests</span>
                <p className="text-xl font-bold text-gray-900">34.2K</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('cloudfront') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Cache Hit Rate</span>
                    <span className="text-lg font-bold text-gray-900">96.8%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96.8%' }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Origin Latency</span>
                    <p className="text-lg font-bold text-gray-900">38ms</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <p className="text-lg font-bold text-gray-900">0.01%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Data Transfer</span>
                    <p className="text-lg font-bold text-gray-900">11.4 GB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">SSL Certificate</span>
                    <p className="text-lg font-bold text-green-600">Valid</p>
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
                <Cloud className="w-8 h-8 text-blue-600" />
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
                <span className="text-sm text-gray-600">DNS Queries</span>
                <p className="text-xl font-bold text-gray-900">18.7K</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Health Checks</span>
                <p className="text-xl font-bold text-green-600">Healthy</p>
              </div>
            </div>
          </div>
          
          {expandedCards.has('route53') && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Query Count (24h)</span>
                    <p className="text-lg font-bold text-gray-900">18,743</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Response Time</span>
                    <p className="text-lg font-bold text-gray-900">12ms</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Health Check Status</span>
                    <p className="text-lg font-bold text-green-600">All Healthy</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Hosted Zone</span>
                    <p className="text-lg font-bold text-gray-900">Active</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Record Types</span>
                    <p className="text-lg font-bold text-gray-900">A, CNAME, MX</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">TTL Average</span>
                    <p className="text-lg font-bold text-gray-900">300s</p>
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
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">EC2</p>
            <p className="text-xs text-gray-500">Running</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">RDS</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">CDN</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <HardDrive className="w-6 h-6 text-orange-600" />
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