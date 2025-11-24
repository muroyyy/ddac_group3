export const PATIENT_ROUTES = {
  ROOT: '/patient',
  DASHBOARD: '/patient/dashboard',
  REQUEST_BLOOD: '/patient/request-blood',
  VIEW_REQUESTS: '/patient/view-requests',
  APPOINTMENTS: '/patient/appointments',
  PROFILE: '/patient/profile',
  NOTIFICATIONS: '/patient/notifications',
  INSIGHTS: '/patient/insights',
  LOGOUT: '/patient/logout',
} as const;

export const PATIENT_NAVIGATION = [
  {
    title: 'Dashboard',
    path: PATIENT_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    title: 'Request Blood',
    path: PATIENT_ROUTES.REQUEST_BLOOD,
    icon: 'Droplet',
  },
  {
    title: 'View Requests',
    path: PATIENT_ROUTES.VIEW_REQUESTS,
    icon: 'FileText',
  },
  {
    title: 'Appointments',
    path: PATIENT_ROUTES.APPOINTMENTS,
    icon: 'Calendar',
  },
  {
    title: 'Profile',
    path: PATIENT_ROUTES.PROFILE,
    icon: 'User',
  },
  {
    title: 'Notifications',
    path: PATIENT_ROUTES.NOTIFICATIONS,
    icon: 'Bell',
  },
  {
    title: 'Insights',
    path: PATIENT_ROUTES.INSIGHTS,
    icon: 'BarChart3',
  },
] as const;