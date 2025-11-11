import React, { useState, useEffect } from 'react';
import { Users, Droplet, Activity, FileText, RefreshCw } from 'lucide-react';

interface UsersByRole {
  role: string;
  count: number;
}

interface BloodTypeData {
  bloodType: string;
  count: number;
}

interface RequestStatus {
  status: string;
  count: number;
}

interface AnalyticsSummary {
  totalDonors: number;
  totalPatients: number;
  totalRequests: number;
  pendingRequests: number;
}

const Analytics: React.FC = () => {
  const [usersByRole, setUsersByRole] = useState<UsersByRole[]>([]);
  const [bloodTypes, setBloodTypes] = useState<BloodTypeData[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.PROD 
    ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api` 
    : 'http://localhost:5000/api';

  const fetchAnalytics = async () => {
    try {
      const [rolesRes, bloodRes, statusRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/users-by-role`),
        fetch(`${API_BASE_URL}/analytics/blood-type-distribution`),
        fetch(`${API_BASE_URL}/analytics/request-status`),
        fetch(`${API_BASE_URL}/analytics/summary`)
      ]);

      if (rolesRes.ok) setUsersByRole(await rolesRes.json());
      if (bloodRes.ok) setBloodTypes(await bloodRes.json());
      if (statusRes.ok) setRequestStatus(await statusRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const roleColors: Record<string, string> = {
    Donor: 'bg-green-500',
    Patient: 'bg-blue-500',
    Hospital: 'bg-purple-500',
    Admin: 'bg-gray-500'
  };

  const bloodTypeColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-500',
    Approved: 'bg-blue-500',
    Rejected: 'bg-red-500',
    Fulfilled: 'bg-green-500'
  };

  const maxRoleCount = Math.max(...usersByRole.map(r => r.count), 1);
  const maxBloodCount = Math.max(...bloodTypes.map(b => b.count), 1);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
          <p className="text-sm text-gray-500">Real-time system analytics from database</p>
        </div>
        <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Donors</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalDonors || 0}</p>
            </div>
            <Droplet className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalPatients || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalRequests || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.pendingRequests || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>)}
            </div>
          ) : usersByRole.length > 0 ? (
            <div className="space-y-4">
              {usersByRole.map((role) => (
                <div key={role.role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{role.role}</span>
                    <span className="text-sm font-bold text-gray-900">{role.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`${roleColors[role.role] || 'bg-gray-500'} h-3 rounded-full`} style={{ width: `${(role.count / maxRoleCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Blood Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Type Distribution</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>)}
            </div>
          ) : bloodTypes.length > 0 ? (
            <div className="space-y-4">
              {bloodTypes.map((blood, index) => (
                <div key={blood.bloodType}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{blood.bloodType}</span>
                    <span className="text-sm font-bold text-gray-900">{blood.count} donors</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`${bloodTypeColors[index % bloodTypeColors.length]} h-3 rounded-full`} style={{ width: `${(blood.count / maxBloodCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No donor data available</p>
          )}
        </div>

        {/* Request Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Breakdown</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>)}
            </div>
          ) : requestStatus.length > 0 ? (
            <div className="space-y-3">
              {requestStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${statusColors[status.status] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{status.status}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No request data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;