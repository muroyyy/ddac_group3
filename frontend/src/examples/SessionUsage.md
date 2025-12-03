# Session Management Usage Examples

## 1. Using ProtectedRoute Component

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

// Protect any route - requires authentication
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Protect route for specific roles
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Multiple roles allowed
<Route path="/medical" element={
  <ProtectedRoute allowedRoles={['admin', 'hospital', 'doctor']}>
    <MedicalPanel />
  </ProtectedRoute>
} />
```

## 2. Using useAuth Hook

```tsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, logout, isExpiringSoon } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Role: {user?.role}</p>
      
      {isExpiringSoon && (
        <div className="alert">Your session expires soon!</div>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## 3. Manual Session Management

```tsx
import { sessionManager } from '../utils/sessionManager';

// Check if user is authenticated
if (sessionManager.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = sessionManager.getUser();

// Get token for API calls
const token = sessionManager.getToken();

// Clear session (logout)
sessionManager.clearSession();
```

## 4. API Calls with Authentication

```tsx
import { verificationAPI, sessionAPI } from '../utils/apiClient';

// All API calls automatically include authentication headers
const pendingUsers = await verificationAPI.getPendingVerifications();

// Validate current session
const validation = await sessionAPI.validateToken();

// Refresh token
const refreshResult = await sessionAPI.refreshToken();
```

## Features Included:

✅ **Automatic token inclusion** in API requests
✅ **Session persistence** across page refreshes  
✅ **Token expiration handling** with auto-logout
✅ **Role-based route protection**
✅ **Cross-tab logout synchronization**
✅ **Session validation** with backend
✅ **Token refresh** capability
✅ **Loading states** during authentication checks