import { Routes, Route } from "react-router-dom";

// Public pages
import Landing from "../layouts/Landing";
import Login from "../layouts/Login";
import Register from "../layouts/Register";
import ForgotPassword from "../layouts/ForgotPassword";
import ResetPassword from "../layouts/ResetPassword";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login onLogin={() => {}} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}
