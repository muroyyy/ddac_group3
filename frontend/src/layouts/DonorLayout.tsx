import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Droplet, History, User, LogOut, Calendar, FileText, Clock } from 'lucide-react';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
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
      <div className="w-64 bg-white shadow-lg flex flex-col">
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
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
