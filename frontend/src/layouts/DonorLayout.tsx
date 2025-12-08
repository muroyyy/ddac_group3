import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Droplet, History, User, LogOut, Calendar, FileText, Clock } from 'lucide-react';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    const { sessionAPI } = await import('../utils/apiClient');
    await sessionAPI.logout();
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/donor/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/donor/donate', label: 'Donate Blood', Icon: Droplet },
    { path: '/donor/pending-requests', label: 'Pending Requests', Icon: Clock },
    { path: '/donor/appointments', label: 'Appointments', Icon: Calendar },
    { path: '/donor/completed-donations', label: 'Completed Donations', Icon: FileText },
    { path: '/donor/history', label: 'History', Icon: History },
    { path: '/donor/profile', label: 'Profile', Icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation Panel */}
      <div className="w-64 bg-white shadow-lg flex flex-col fixed h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">🩸</span>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">BloodLine</h1>
              <p className="text-sm text-gray-500">Donor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Donor'}</p>
              <p className="text-xs text-gray-500">Donor Account</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Confirm Logout</h2>
            <p className="text-gray-600 mb-8">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
