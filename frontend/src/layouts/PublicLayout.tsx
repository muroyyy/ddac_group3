import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users accessing the landing page
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && location.pathname === '/') {
      const dashboardPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        donor: '/donor/dashboard',
        patient: '/patient/dashboard',
        hospital: '/hospital/dashboard'
      };

      const redirectPath = dashboardPaths[user.role.toLowerCase()];
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, location.pathname, navigate]);

  // Show loading spinner while checking authentication on landing page
  if (isLoading && location.pathname === '/') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;