import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// Layout
import DonorLayout from '../layouts/DonorLayout';

// Donor Pages
import DonorDashboard from '../modules/donor/pages/DonorDashboard';
import DonateBloodForm from '../modules/donor/pages/DonateBloodForm';
import DonationHistory from '../modules/donor/pages/DonationHistory';
import DonorProfile from '../modules/donor/pages/DonorProfile';
import PendingRequests from '../modules/donor/pages/PendingRequests';
import AppointmentsTable from '../modules/donor/pages/AppointmentsTable';
import CompletedDonations from '../modules/donor/pages/CompletedDonations';

export const getDonorRoutes = (): RouteObject => ({
  path: '/donor',
  element: <DonorLayout />,
  children: [
    { index: true, element: <Navigate to="/donor/dashboard" replace /> },
    { path: 'dashboard', element: <DonorDashboard /> },
    { path: 'donate', element: <DonateBloodForm /> },
    { path: 'history', element: <DonationHistory /> },
    { path: 'profile', element: <DonorProfile /> },
    { path: 'pending-requests', element: <PendingRequests /> },
    { path: 'appointments', element: <AppointmentsTable /> },
    { path: 'completed-donations', element: <CompletedDonations /> }
  ]
});
