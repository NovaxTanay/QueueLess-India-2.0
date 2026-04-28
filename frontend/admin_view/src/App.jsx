// ============================================
// App.jsx — Admin view routing & auth guards
// ============================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@backend/context/AuthContext';

// Pages
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Onboarding from './pages/Onboarding/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import MyServices from './pages/MyServices/MyServices';
import QueueManagement from './pages/QueueManagement/QueueManagement';
import QRCodePage from './pages/QRCode/QRCode';
import SlotConfig from './pages/SlotConfig/SlotConfig';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

// Auth guard: redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading, user, activeServiceId } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin has no active service, redirect to /onboarding from pages
  // that genuinely require one. Allow /onboarding, /my-services, /settings freely.
  const needsService = ['/queue', '/qr', '/slots', '/analytics'];
  if (
    user?.role === 'admin' &&
    !activeServiceId &&
    needsService.includes(location.pathname)
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Public route: redirects authenticated admins away from login/signup
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialLoading, user } = useAuth();

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-services"
        element={
          <ProtectedRoute>
            <MyServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute>
            <QueueManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr"
        element={
          <ProtectedRoute>
            <QRCodePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/slots"
        element={
          <ProtectedRoute>
            <SlotConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
