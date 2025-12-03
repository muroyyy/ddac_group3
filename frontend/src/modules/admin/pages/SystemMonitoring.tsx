import React, { useState, useEffect } from 'react';
import { Server, Database, RefreshCw } from 'lucide-react';
import { monitoringAPI, type SystemMetrics } from '../services/monitoringAPI';

const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">EC2 Instance</h3>
              <p className="text-xs text-gray-500">i-04b9defc7f7f5c03c</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                <span className="text-lg font-bold text-gray-900">{metrics?.ec2.cpuUtilization.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics?.ec2.cpuUtilization}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Network In</span>
                <span className="text-lg font-bold text-gray-900">{metrics?.ec2.networkIn.toFixed(2)} MB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">RDS Instance</h3>
              <p className="text-xs text-gray-500">dev-bloodline-rds</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU Utilization</span>
                <span className="text-lg font-bold text-gray-900">{metrics?.rds.cpuUtilization.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics?.rds.cpuUtilization}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Connections</span>
                <span className="text-lg font-bold text-gray-900">{metrics?.rds.connections}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Free Storage</span>
                <span className="text-lg font-bold text-gray-900">{metrics?.rds.freeStorageGB.toFixed(2)} GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;