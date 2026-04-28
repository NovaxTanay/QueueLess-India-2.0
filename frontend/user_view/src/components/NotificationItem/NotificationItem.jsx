import { timeAgo } from '../../utils/helpers';
import './NotificationItem.css';

const NotificationItem = ({ notification, onRead }) => {
  const handleClick = () => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`notification-item ${notification.read ? '' : 'unread'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="notification-icon">
        {notification.icon}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">{timeAgo(notification.timestamp)}</div>
      </div>
    </div>
  );
};

export default NotificationItem;
