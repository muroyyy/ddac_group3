import type { RouteObject } from 'react-router-dom';

// Layout
import AdminLayout from '../layouts/AdminLayout';

export const getAdminRoutes = (
  user: { id: number; email: string; name: string; role: string } | null,
  onLogout: () => void
): RouteObject => ({
  path: '/admin/dashboard',
  element: <AdminLayout user={user!} onLogout={onLogout} />
});
