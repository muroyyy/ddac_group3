import React, { useState, useEffect } from 'react';
import { Users, Droplet, Activity, FileText, RefreshCw } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface UsersByRole {
  role: string;
  count: number;
}

interface BloodTypeData {
  bloodType: string;
  count: number;
  [key: string]: string | number;
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

  const ROLE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#6b7280'];
  const BLOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];
  const STATUS_COLORS: Record<string, string> = {
    Pending: '#eab308',
    Approved: '#3b82f6',
    Rejected: '#ef4444',
    Fulfilled: '#22c55e'
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
          <p className="text-sm text-gray-500">Real-time system analytics from database</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={`${API_BASE_URL}/analytics/export/csv`} download className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FileText className="w-4 h-4" />
            Export CSV
          </a>
          <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
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
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usersByRole}>
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Users">
                  {usersByRole.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Blood Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Type Distribution</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : bloodTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bloodTypes}
                  dataKey="count"
                  nameKey="bloodType"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {bloodTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BLOOD_COLORS[index % BLOOD_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No donor data available</p>
          )}
        </div>

        {/* Request Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Breakdown</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : requestStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestStatus} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Requests">
                  {requestStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No request data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;