import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ServiceList from './pages/ServiceList/ServiceList';
import ServiceDetail from './pages/ServiceDetail/ServiceDetail';
import BookSlot from './pages/BookSlot/BookSlot';
import LiveQueue from './pages/LiveQueue/LiveQueue';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import CheckIn from '@backend/pages/CheckIn/CheckIn';
import AdminDashboard from '@backend/pages/Admin/AdminDashboard';
import AdminQueue from '@backend/pages/Admin/AdminQueue';
import RegisterService from '@backend/pages/Admin/RegisterService';

// Admin route guard
const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, initialLoading } = useAuth();
  if (initialLoading) return <div className="home-loading"><div className="home-loading-spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
};

// Auth loading wrapper
const AppContent = () => {
  const { user, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="home-loading-spinner" />
      </div>
    );
  }

  return (
    <NotificationProvider userId={user?.uid || null}>
      <Router>
        <Routes>
          {/* Auth pages — no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* QR check-in — with layout */}
          <Route element={<MainLayout />}>
            <Route path="/checkin" element={<CheckIn />} />
          </Route>

          {/* Admin pages */}
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/queue" element={<AdminRoute><AdminQueue /></AdminRoute>} />
            <Route path="/admin/register" element={<AdminRoute><RegisterService /></AdminRoute>} />
          </Route>

          {/* User pages — with Navbar layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services/:category" element={<ServiceList />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/book/:id" element={<BookSlot />} />
            <Route path="/queue/:serviceId" element={<LiveQueue />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
