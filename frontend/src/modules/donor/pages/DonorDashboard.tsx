import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { donorAPI, DashboardStats } from '../services/donorAPI';

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await donorAPI.getDashboardStats(user!.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Donations</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{stats?.totalDonations || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pending Requests</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendingRequests || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Blood Type</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats?.bloodType || 'N/A'}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Last Donation</div>
          <div className="text-xl font-bold text-gray-700 mt-2">
            {stats?.lastDonation || 'Never'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/donor/donate')}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              Request to Donate Blood
            </button>
            <button
              onClick={() => navigate('/donor/history')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Donation History
            </button>
            <button
              onClick={() => navigate('/donor/profile')}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Update Profile
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Availability Status</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Currently Available:</span>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              stats?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats?.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Update your availability status in your profile settings.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> You can donate blood every 3 months. Please ensure you meet the eligibility criteria before requesting to donate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
