import type { RouteObject } from 'react-router-dom';

// Auth Pages
import LoginPage from '../layouts/Login';
import RegisterPage from '../layouts/Register';
import ForgotPassword from '../layouts/ForgotPassword';
import ResetPassword from '../layouts/ResetPassword';

export const getAuthRoutes = (onLogin: (userData: { id: number; email: string; name: string; role: string }) => void): RouteObject[] => [
  { path: '/login', element: <LoginPage onLogin={onLogin} /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> }
];
