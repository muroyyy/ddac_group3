// Patient module exports
export { PatientRoutes } from './routes';
export { default as DashboardLayout } from './components/layout/DashboardLayout';
export { PATIENT_ROUTES, PATIENT_NAVIGATION } from './constants/routes';
export { ASSETS, getAssetPath, useBloodlineLogo } from './utils/assets';

// Page exports
export { default as Dashboard } from './pages/Dashboard';
export { default as RequestBlood } from './pages/RequestBlood';
export { default as ViewRequests } from './pages/ViewRequests';
export { default as Appointments } from './pages/Appointments';
export { default as Profile } from './pages/Profile';
export { default as Notifications } from './pages/Notifications';
export { default as Insights } from './pages/Insights';