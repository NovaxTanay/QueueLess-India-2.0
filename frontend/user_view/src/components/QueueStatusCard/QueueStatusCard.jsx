import { FaClock } from 'react-icons/fa';
import { formatWaitTime } from '../../utils/helpers';
import './QueueStatusCard.css';

const QueueStatusCard = ({ currentServing, totalInQueue, estimatedWait, compact = false }) => {
  const progress = totalInQueue > 0 ? (currentServing / totalInQueue) * 100 : 0;

  return (
    <div className="queue-status-card">
      <div className="queue-status-header">
        <span className="queue-status-title">Live Queue</span>
        <span className="queue-status-live">
          <span className="queue-status-live-dot" />
          Live
        </span>
      </div>

      <div className="queue-status-numbers">
        <div className="queue-stat">
          <div className="queue-stat-value serving">{currentServing}</div>
          <div className="queue-stat-label">Now Serving</div>
        </div>
        <div className="queue-stat">
          <div className="queue-stat-value total">{totalInQueue}</div>
          <div className="queue-stat-label">In Queue</div>
        </div>
      </div>

      <div className="queue-progress-bar">
        <div className="queue-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      <div className="queue-wait">
        <FaClock size={12} />
        <span>Est. Wait:</span>
        <span className="queue-wait-value">{formatWaitTime(estimatedWait)}</span>
      </div>
    </div>
  );
};

export default QueueStatusCard;
