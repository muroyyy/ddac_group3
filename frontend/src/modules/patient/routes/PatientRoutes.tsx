import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import RequestBlood from '../pages/RequestBlood';
import ViewRequests from '../pages/ViewRequests';
import Appointments from '../pages/Appointments';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';
import Insights from '../pages/Insights';
import Logout from '../pages/Logout';
import NotFound from '../pages/NotFound';

export default function PatientRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/request-blood" element={<RequestBlood />} />
        <Route path="/view-requests" element={<ViewRequests />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}