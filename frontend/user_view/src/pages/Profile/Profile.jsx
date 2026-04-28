import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings } from '@backend/services/booking.service';
import { formatDate, getCategoryDisplayName } from '../../utils/helpers';
import categoriesData from '../../data/categories';
import Button from '../../components/Button/Button';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      navigate('/login');
      return;
    }

    const loadBookings = async () => {
      try {
        const data = await getUserBookings(user.uid);
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [user, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryColor = (catId) => {
    const cat = categoriesData.find(c => c.id === catId);
    return cat?.color || '#10b981';
  };

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* User Card */}
          <div className="profile-user-card">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-value">{bookings.length}</div>
                <div className="profile-stat-label">Bookings</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">{completedCount}</div>
                <div className="profile-stat-label">Completed</div>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <FaEnvelope size={14} />
                <span>{user.email}</span>
              </div>
              <div className="profile-info-item">
                <FaCalendarAlt size={14} />
                <span>Role: {user.role || 'user'}</span>
              </div>
            </div>

            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
              id="logout-btn"
            >
              Logout
            </Button>
          </div>

          {/* Booking History */}
          <div className="profile-bookings">
            <h2>Booking History</h2>

            {loading ? (
              <div className="home-loading">
                <div className="home-loading-spinner" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="profile-booking-list stagger-children">
                {bookings.map((booking) => (
                  <div key={booking.id} className="profile-booking-item">
                    <div
                      className="profile-booking-icon"
                      style={{
                        background: `${getCategoryColor(booking.category)}18`,
                        color: getCategoryColor(booking.category),
                      }}
                    >
                      📋
                    </div>
                    <div className="profile-booking-info">
                      <div className="profile-booking-name">
                        Token #{booking.tokenNumber}
                      </div>
                      <div className="profile-booking-meta">
                        <span>{formatDate(booking.slotDate)}</span>
                        <span>{booking.slotTime}</span>
                      </div>
                    </div>
                    <span className={`profile-booking-status ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="notif-empty">
                <div className="notif-empty-icon">📋</div>
                <h3>No bookings yet</h3>
                <p>Your booking history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
