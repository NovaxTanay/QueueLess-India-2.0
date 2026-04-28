import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from '../../components/NotificationItem/NotificationItem';
import Button from '../../components/Button/Button';
import './Notifications.css';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [tab, setTab] = useState('all');

  const filtered = tab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="notif-page">
      <div className="container">
        <div className="notif-page-header">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="notif-tabs">
          <button
            className={`notif-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-tab ${tab === 'unread' ? 'active' : ''}`}
            onClick={() => setTab('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="notif-list stagger-children">
            {filtered.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onRead={markAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>{tab === 'unread' ? 'All caught up! No unread notifications.' : 'You don\'t have any notifications yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
