import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import LandingPage from './layouts/Landing';
import LoginPage from './layouts/Login';
import RegisterPage from './layouts/Register';
import ForgotPassword from './layouts/ForgotPassword';
import ResetPassword from './layouts/ResetPassword';
import MockEmail from './layouts/MockEmail';
import AdminLayout from './layouts/AdminLayout';

// Import layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Types
interface UserData {
  email: string;
  name: string;
  role: string;
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout Component for pages with Navbar and Footer
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('bloodline_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bloodline_user');
  };

  const isAuthenticated = user !== null;

  // Check for existing user session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('bloodline_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar & Footer */}
        <Route
          path="/"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage onLogin={handleLogin} />
            </Layout>
          }
        />
        
        <Route
          path="/register"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />
        
        <Route
          path="/forgot-password"
          element={
            <Layout>
              <ForgotPassword />
            </Layout>
          }
        />
        
        <Route
          path="/reset-password"
          element={
            <Layout>
              <ResetPassword />
            </Layout>
          }
        />
        
        <Route
          path="/mock-email"
          element={
            <Layout>
              <MockEmail />
            </Layout>
          }
        />

        {/* Protected Routes - Dashboard without Navbar & Footer */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;