import React from 'react';
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

// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext';

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

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

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
              <LoginPage onLogin={login} />
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
              <AdminLayout user={user!} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;