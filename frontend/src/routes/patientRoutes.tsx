import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// Layout
import PatientLayout from '../layouts/PatientLayout';

// Patient Pages
import PatientDashboard from '../modules/patient/pages/Dashboard';
import RequestBlood from '../modules/patient/pages/RequestBlood';
import ViewRequests from '../modules/patient/pages/ViewRequests';
import Appointments from '../modules/patient/pages/Appointments';
import PatientProfile from '../modules/patient/pages/Profile';
import EditProfile from '../modules/patient/pages/EditProfile';
import Notifications from '../modules/patient/pages/Notifications';
import Insights from '../modules/patient/pages/Insights';
import Logout from '../modules/patient/pages/Logout';

export const getPatientRoutes = (): RouteObject => ({
  path: '/patient',
  element: <PatientLayout />,
  children: [
    { index: true, element: <Navigate to="/patient/dashboard" replace /> },
    { path: 'dashboard', element: <PatientDashboard /> },
    { path: 'request-blood', element: <RequestBlood /> },
    { path: 'view-requests', element: <ViewRequests /> },
    { path: 'appointments', element: <Appointments /> },
    { path: 'profile', element: <PatientProfile /> },
    { path: 'edit-profile', element: <EditProfile /> },
    { path: 'notifications', element: <Notifications /> },
    { path: 'insights', element: <Insights /> },
    { path: 'logout', element: <Logout /> }
  ]
});
