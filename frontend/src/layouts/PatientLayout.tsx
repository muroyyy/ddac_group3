import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  HeartPulse,
  Calendar,
  Bell,
  User,
  LogOut,
  ListChecks,
  BarChart3
} from "lucide-react";

export default function PatientLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/patient/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { path: "/patient/request-blood", label: "Request Blood", Icon: HeartPulse },
    { path: "/patient/view-requests", label: "My Requests", Icon: ListChecks },
    { path: "/patient/appointments", label: "Appointments", Icon: Calendar },
    { path: "/patient/notifications", label: "Notifications", Icon: Bell },
    { path: "/patient/insights", label: "Insights", Icon: BarChart3 },
    { path: "/patient/profile", label: "Profile", Icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col fixed h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">🩺</span>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">BloodLine</h1>
              <p className="text-sm text-gray-500">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
