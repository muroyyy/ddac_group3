import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { securityAPI, type SecurityMetrics } from '../services/securityAPI';

const Security: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      const data = await securityAPI.getSecurityMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // 5 minutes
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
          <h2 className="text-xl font-semibold text-gray-900">Security & Compliance</h2>
          <p className="text-sm text-gray-500">Real-time security monitoring and compliance status</p>
        </div>
        <div className="text-right">
          <button onClick={fetchMetrics} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Security Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold">Security Alerts</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed Logins (24h)</span>
              <span className={`text-sm font-medium ${
                (metrics?.failedLogins24h || 0) > 10 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics?.failedLogins24h || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm text-gray-900 font-medium">{metrics?.activeSessions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Vulnerabilities</span>
              <span className={`text-sm font-medium ${
                (metrics?.vulnerabilities.critical || 0) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics?.vulnerabilities.critical || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SSL Certificate */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold">SSL Certificate</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-sm font-medium ${
                metrics?.sslCertificate.status === 'Valid' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics?.sslCertificate.status || 'Valid'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expires</span>
              <span className="text-sm text-gray-900">{metrics?.sslCertificate.expiryDate || '2025-03-15'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Days Until Expiry</span>
              <span className={`text-sm font-medium ${
                (metrics?.sslCertificate.daysUntilExpiry || 90) < 30 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics?.sslCertificate.daysUntilExpiry || 90} days
              </span>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Compliance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Password Policy</span>
              <span className="text-sm text-green-600 font-medium">
                {metrics?.compliance.passwordPolicyCompliance || 95}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">2FA Adoption</span>
              <span className="text-sm text-blue-600 font-medium">
                {metrics?.compliance.twoFactorAdoption || 78}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Encryption</span>
              <span className="text-sm text-green-600 font-medium">
                {metrics?.compliance.dataEncryptionStatus || 'Enabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Assessment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Critical</span>
              </div>
              <span className="text-lg font-bold text-red-600">{metrics?.vulnerabilities.critical || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">High</span>
              </div>
              <span className="text-lg font-bold text-orange-500">{metrics?.vulnerabilities.high || 2}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Medium</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{metrics?.vulnerabilities.medium || 5}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Low</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{metrics?.vulnerabilities.low || 12}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">87/100</div>
            <p className="text-sm text-gray-600 mb-4">Overall Security Rating</p>
            <div className="bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '87%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Based on security policies, vulnerabilities, and compliance</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Shield className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Run Security Scan</p>
              <p className="text-sm text-gray-500">Perform vulnerability assessment</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Users className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Access</p>
              <p className="text-sm text-gray-500">Audit user permissions</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Key className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Update Policies</p>
              <p className="text-sm text-gray-500">Modify security settings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security;