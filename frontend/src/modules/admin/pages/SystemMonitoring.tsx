import React from 'react';
import { Server, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

const SystemMonitoring: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
        <p className="text-sm text-gray-500">Real-time system performance and health monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">23%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">CPU Usage</h3>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">67%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Memory Usage</h3>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">45%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Disk Usage</h3>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Wifi className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">12ms</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Response Time</h3>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Monitoring Dashboard</h3>
          <p className="text-gray-500 mb-4">Advanced monitoring features and real-time metrics coming soon.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Configure Monitoring
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;