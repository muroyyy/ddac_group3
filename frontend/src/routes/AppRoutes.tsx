import { Routes, Route } from "react-router-dom";

// Public pages
import Landing from "../layouts/Landing";
import Login from "../layouts/Login";
import Register from "../layouts/Register";
import ForgotPassword from "../layouts/ForgotPassword";
import ResetPassword from "../layouts/ResetPassword";


// Patient Dashboard (restored for patient role)
import PatientDashboard from "../modules/patient/pages/Dashboard";
import Profile from "../modules/patient/pages/Profile";
import EditProfile from "../modules/patient/pages/EditProfile";
import Notifications from "../modules/patient/pages/Notifications";
import RequestBlood from "../modules/patient/pages/RequestBlood";
import ViewRequests from "../modules/patient/pages/ViewRequests";
import Appointments from "../modules/patient/pages/Appointments";
import Insights from "../modules/patient/pages/Insights";
import LogoutConfirm from "../modules/patient/pages/LogoutConfirm";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login onLogin={() => {}} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/profile" element={<Profile />} />
      <Route path="/patient/edit-profile" element={<EditProfile />} />
      <Route path="/patient/notifications" element={<Notifications />} />
      <Route path="/patient/request-blood" element={<RequestBlood />} />
      <Route path="/patient/requests" element={<ViewRequests />} />
      <Route path="/patient/appointments" element={<Appointments />} />
      <Route path="/patient/insights" element={<Insights />} />
      <Route path="/patient/logout" element={<LogoutConfirm />} />
    </Routes>
  );
}
