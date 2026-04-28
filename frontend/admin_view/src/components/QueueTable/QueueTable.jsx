// ============================================
// QueueTable — Live queue entries table
// ============================================

import TokenBadge from '../TokenBadge/TokenBadge';
import { formatTime, getWaitDuration } from '../../utils/helpers';
import './QueueTable.css';

const QueueTable = ({ entries, onComplete, onSkip, loading }) => {
  if (loading) {
    return (
      <div className="queue-table-loading">
        <div className="spinner" />
        <span className="loading-text">Loading queue...</span>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="queue-table-empty">
        <span className="queue-table-empty-icon">🎟️</span>
        <p>No tokens in the queue yet</p>
      </div>
    );
  }

  return (
    <div className="queue-table-wrapper">
      <table className="queue-table">
        <thead>
          <tr>
            <th>Token #</th>
            <th>Status</th>
            <th>Time Joined</th>
            <th>Wait Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={`queue-table-row ${entry.isEmergency ? 'queue-table-row--emergency' : ''} ${entry.status === 'CANCELLED' ? 'queue-table-row--cancelled' : ''}`}
            >
              <td className="queue-table-token">
                {entry.isEmergency ? (
                  <span className="queue-table-emergency-label">
                    🚨 {entry.patientName || 'Emergency'}
                  </span>
                ) : (
                  `#${entry.tokenNumber}`
                )}
              </td>
              <td>
                <TokenBadge status={entry.status} />
              </td>
              <td className="queue-table-time">{formatTime(entry.createdAt)}</td>
              <td className="queue-table-time">{getWaitDuration(entry.createdAt)}</td>
              <td>
                <div className="queue-table-actions">
                  {(entry.status === 'SERVING' || entry.status === 'CALLED' || entry.status === 'EMERGENCY') && (
                    <button
                      className="queue-action-btn complete"
                      onClick={() => onComplete(entry.id)}
                    >
                      Complete
                    </button>
                  )}
                  {entry.status === 'WAITING' && (
                    <button
                      className="queue-action-btn skip"
                      onClick={() => onSkip(entry.id)}
                    >
                      Skip
                    </button>
                  )}
                  {(entry.status === 'COMPLETED' || entry.status === 'SKIPPED') && (
                    <span className="queue-action-done">Done</span>
                  )}
                  {entry.status === 'CANCELLED' && (
                    <span className="queue-action-done cancelled">Cancelled</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
