import { Routes, Route } from 'react-router-dom';
import Landing from '../layouts/Landing';
import Login from '../layouts/Login';
import Register from '../layouts/Register';
import ForgotPassword from '../layouts/ForgotPassword';
import ResetPassword from '../layouts/ResetPassword';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login onLogin={() => {}} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Patient routes removed */}
    </Routes>
  );
}