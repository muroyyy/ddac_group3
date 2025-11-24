import { Routes, Route } from 'react-router-dom';
import { PatientRoutes } from '../modules/patient/routes';
import Landing from '../layouts/Landing';
import Login from '../layouts/Login';
import Register from '../layouts/Register';
import ForgotPassword from '../layouts/ForgotPassword';
import ResetPassword from '../layouts/ResetPassword';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/patient/*" element={<PatientRoutes />} />
    </Routes>
  );
}