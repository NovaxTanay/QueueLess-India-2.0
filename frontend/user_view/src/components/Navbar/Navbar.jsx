import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBell, FaUser, FaBars, FaThLarge, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">Q</div>
        <span className="navbar-title">
          Queue<span className="navbar-title-accent">Less</span>
        </span>
      </Link>

      <div className="navbar-nav">
        <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
          <FaHome size={14} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/services/hospital" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          <FaThLarge size={14} />
          <span>Services</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <FaCog size={14} />
            <span>Admin</span>
          </NavLink>
        )}
      </div>

      <div className="navbar-actions">
        <button
          className="navbar-notif-btn"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          id="navbar-notifications"
        >
          <FaBell size={16} />
          {unreadCount > 0 && (
            <span className="navbar-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {isAuthenticated ? (
          <Link to="/profile" className="navbar-avatar" id="navbar-profile">
            {getInitials(user?.name)}
          </Link>
        ) : (
          <Link to="/login" className="navbar-link" style={{ color: 'var(--primary-400)' }}>
            <FaUser size={14} />
            <span>Login</span>
          </Link>
        )}

        <button className="navbar-menu-toggle" aria-label="Menu">
          <FaBars />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
