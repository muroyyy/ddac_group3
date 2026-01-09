import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// Layout & Protection
import HospitalLayout from '../layouts/HospitalLayout';
import RoleProtected from './ProtectedRoutes';

// Hospital Pages
import HospitalDashboard from '../modules/hospital/pages/HospitalDashboard';
import Inventory from '../modules/hospital/pages/Inventory';
import BloodRequests from '../modules/hospital/pages/BloodRequests';
import DonorRequests from '../modules/hospital/pages/DonorRequests';
import DonorAppointments from '../modules/hospital/pages/DonorAppointments';
import HospitalAppointments from '../modules/hospital/pages/Appointments';
import TestPage from '../modules/hospital/pages/TestPage';
import HospitalProfile from '../modules/hospital/pages/Profile';

export const getHospitalRoutes = (user: { id: number; email: string; name: string; role: string } | null): RouteObject => ({
  element: <RoleProtected requiredRole="hospital" />,
  children: [
    {
      path: '/hospital',
      element: <HospitalLayout />,
      children: [
        { index: true, element: <Navigate to="/hospital/dashboard" replace /> },
        { path: 'dashboard', element: <HospitalDashboard user={user!} /> },
        { path: 'test', element: <TestPage /> },
        { path: 'blood-requests', element: <BloodRequests /> },
        { path: 'donor-requests', element: <DonorRequests /> },
        { path: 'donor-appointments', element: <DonorAppointments /> },
        { path: 'appointments', element: <HospitalAppointments /> },
        { path: 'inventory', element: <Inventory /> },
        { path: 'profile', element: <HospitalProfile /> }
      ]
    }
  ]
});
