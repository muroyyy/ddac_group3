import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PatientService } from '../patient.service';

/**
 * Patient Dashboard
 * =====================================================
 * Main dashboard for patients to view:
 * - Summary statistics (pending requests, appointments, completed transfusions)
 * - Quick action buttons for common workflows
 * - Health/education news cards
 * - Current status and alerts
 *
 * API Integration:
 * - Uses PatientService.getDashboard(patientId) to fetch stats
 *
 * Navigation:
 * - Quick action buttons link to patient pages (/patient/request-blood, etc.)
 */

interface DashboardStats {
  totalRequests?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  fulfilled?: number;
  upcomingAppointments?: number;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load dashboard statistics on mount
   * Fetches patient-specific data from backend API
   */
  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await PatientService.getDashboard(user!.id);
      if (data) {
        setStats(data);
        setError(null);
      } else {
        setError('No dashboard data available');
      }
    } catch (err) {
      console.error('Error loading patient dashboard stats:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadStats}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          WELCOME SECTION
          Display patient name and brief intro
      ===================================================== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your blood transfusion journey
        </p>
      </div>

      {/* =====================================================
          STATISTICS CARDS (3-COLUMN GRID)
          Displays key metrics: Pending Requests, Appointments, Completed
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Blood Requests Card */}
        <div
          onClick={() => navigate('/patient/my-requests')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition"
        >
          <div className="text-sm text-gray-600">Pending Blood Requests</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {stats?.pending || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Click to view requests</p>
        </div>

        {/* Upcoming Appointments Card */}
        <div
          onClick={() => navigate('/patient/appointments')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition"
        >
          <div className="text-sm text-gray-600">Upcoming Appointments</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {stats?.upcomingAppointments || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Click to view schedule</p>
        </div>

        {/* Completed Transfusions Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Completed Transfusions</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {stats?.fulfilled || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total procedures completed</p>
        </div>
      </div>

      {/* =====================================================
          QUICK ACTIONS & STATUS SECTION
          Two-column layout: Quick Actions | Current Status
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/patient/request-blood')}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Request Blood
            </button>
            <button
              onClick={() => navigate('/patient/my-requests')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View My Requests
            </button>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-medium"
            >
              View Appointments
            </button>
            <button
              onClick={() => navigate('/patient/profile')}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Account Status:</span>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Profile Complete:</span>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {user?.name ? '100%' : 'Incomplete'}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/patient/notifications')}
                className="text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                View Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          IMPORTANT ALERT
          Display critical health/procedural information
      ===================================================== */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Please ensure all your contact information is
              up-to-date so we can reach you for transfusion appointments. Update your
              profile if your phone number or address has changed.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          HEALTH NEWS & EDUCATION SECTION
          2x2 grid of static health articles
      ===================================================== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📰 Health & Wellness</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthNewsCard
            title="Post-Transfusion Care Guide"
            date="December 1, 2025"
            description="Learn essential post-transfusion care tips to ensure a smooth recovery and optimal health outcomes..."
          />
          <HealthNewsCard
            title="Understanding Your Blood Type"
            date="November 28, 2025"
            description="A comprehensive guide to blood types, compatibility, and why your blood type matters for transfusions..."
          />
          <HealthNewsCard
            title="Nutrition After Transfusion"
            date="November 25, 2025"
            description="Discover the best foods and nutrients to support your body's recovery after a blood transfusion..."
          />
          <HealthNewsCard
            title="When to Seek Medical Help"
            date="November 22, 2025"
            description="Know the warning signs and symptoms that require immediate medical attention after transfusion..."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Health News Card Component
 * =====================================================
 * Reusable card component for displaying health articles
 * with title, date, and brief description
 */
interface HealthNewsCardProps {
  title: string;
  date: string;
  description: string;
}

function HealthNewsCard({ title, date, description }: HealthNewsCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-100 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
      <p className="text-gray-400 text-xs mt-4 font-medium">{date}</p>
    </div>
  );
}
