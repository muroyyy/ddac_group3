import type { RouteObject } from 'react-router-dom';

// Layout
import AdminLayout from '../layouts/AdminLayout';

export const getAdminRoutes = (): RouteObject => ({
  path: '/admin/dashboard',
  element: <AdminLayout />
});
