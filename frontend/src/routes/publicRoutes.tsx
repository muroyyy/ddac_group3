import type { RouteObject } from 'react-router-dom';

// Layout
import PublicLayout from '../layouts/PublicLayout';

// Public Pages
import LandingPage from '../layouts/Landing';
import MockEmail from '../layouts/MockEmail';
import Unauthorized from '../layouts/Unauthorized';

export const getPublicRoutes = (): RouteObject[] => [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/unauthorized', element: <Unauthorized /> }
    ]
  },
  // MockEmail without layout
  { path: '/mock-email', element: <MockEmail /> }
];
