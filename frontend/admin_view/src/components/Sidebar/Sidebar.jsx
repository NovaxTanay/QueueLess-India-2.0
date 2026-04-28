// ============================================
// Sidebar — Admin navigation
// ============================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/my-services', label: 'My Services', icon: '🏢' },
  { path: '/queue', label: 'Queue Management', icon: '🎟️' },
  { path: '/qr', label: 'QR Code', icon: '📱' },
  { path: '/slots', label: 'Slot Config', icon: '🕐' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">Q</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">QueueLess</span>
          <span className="sidebar-brand-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-link-icon">🚪</span>
          <span className="sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
