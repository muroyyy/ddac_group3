import React from 'react';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Security & Compliance</h2>
        <p className="text-sm text-gray-500">System security settings and compliance monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold">Security Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SSL Certificate</span>
              <span className="text-sm text-green-600 font-medium">Valid</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Firewall Status</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Security Scan</span>
              <span className="text-sm text-gray-600">2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Access Control</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-Factor Auth</span>
              <span className="text-sm text-green-600 font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Password Policy</span>
              <span className="text-sm text-green-600 font-medium">Strong</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Session Timeout</span>
              <span className="text-sm text-gray-600">30 minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Management</h3>
          <p className="text-gray-500 mb-4">Advanced security features and compliance tools coming soon.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Configure Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security;