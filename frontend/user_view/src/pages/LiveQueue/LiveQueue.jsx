// ============================================
// LiveQueue — Showstopper real-time queue tracker
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServiceById } from '@backend/services/service.service';
import useQueue from '../../hooks/useQueue';
import { formatWaitTime } from '../../utils/helpers';
import Button from '../../components/Button/Button';
import './LiveQueue.css';

const LiveQueue = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [turnCountdown, setTurnCountdown] = useState(10);

  const {
    currentServing,
    estimatedWait,
    isUserTurn,
    peopleAhead,
    userTokenNumber,
    userStatus,
    progress,
    waitingCount,
    emergencyCount,
    cancelQueue,
    loading,
    error,
  } = useQueue(serviceId, user?.uid, service?.avgServiceTime || 5);

  useEffect(() => {
    const load = async () => {
      try {
        const svc = await getServiceById(serviceId);
        setService(svc);
      } catch (err) {
        console.error(err);
      }
    };
    if (serviceId) load();
  }, [serviceId]);

  // Auto-dismiss turn alert after 10s
  useEffect(() => {
    if (!isUserTurn) {
      setTurnCountdown(10);
      return;
    }
    const interval = setInterval(() => {
      setTurnCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isUserTurn]);

  const handleLeaveQueue = async () => {
    try {
      await cancelQueue();
      setCancelled(true);
      setShowLeaveModal(false);
      setTimeout(() => navigate(`/service/${serviceId}`), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = () => {
    const map = {
      WAITING: { label: 'WAITING', cls: 'waiting' },
      SERVING: { label: 'SERVING', cls: 'serving' },
      CALLED: { label: 'CALLED', cls: 'serving' },
      COMPLETED: { label: 'COMPLETED', cls: 'completed' },
      SKIPPED: { label: 'SKIPPED', cls: 'skipped' },
      CANCELLED: { label: 'CANCELLED', cls: 'cancelled' },
    };
    return map[userStatus] || { label: userStatus, cls: 'waiting' };
  };

  if (loading) {
    return (
      <div className="lq-page">
        <div className="lq-container">
          <div className="lq-loading">
            <div className="lq-loading-spinner" />
            <p>Connecting to live queue...</p>
          </div>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge();

  return (
    <div className="lq-page">
      <div className="lq-container">
        {/* Header */}
        <div className="lq-header fade-in-up">
          <h1>Live Queue Tracker</h1>
          {service && <p className="lq-service-name">{service.name}</p>}
        </div>

        {error && (
          <div className="lq-error fade-in-up">{error}</div>
        )}

        {/* Emergency Banner */}
        {emergencyCount > 0 && (
          <div className="lq-emergency-banner fade-in-up">
            <span className="lq-emergency-icon">🚨</span>
            <span>
              {emergencyCount} emergency case{emergencyCount > 1 ? 's' : ''} being
              prioritised — your wait may be slightly longer
            </span>
          </div>
        )}

        {/* Cancelled Message */}
        {cancelled && (
          <div className="lq-cancelled-msg fade-in-up">
            ✅ You have left the queue. Redirecting...
          </div>
        )}

        {/* Your Turn Overlay */}
        {isUserTurn && turnCountdown > 0 && (
          <div className="lq-turn-overlay">
            <div className="lq-turn-card">
              <div className="lq-turn-emoji">🎉</div>
              <h2>It&apos;s Your Turn!</h2>
              <p>Please proceed to the counter immediately</p>
              <div className="lq-turn-token">#{userTokenNumber}</div>
              <div className="lq-turn-countdown">
                Auto-dismiss in {turnCountdown}s
              </div>
              <Button onClick={() => setTurnCountdown(0)}>
                Got it
              </Button>
            </div>
          </div>
        )}

        {/* Token Card — Hero Element */}
        <div className="lq-token-card fade-in-up">
          <div className="lq-token-label">YOUR TOKEN NUMBER</div>
          <div className="lq-token-number">
            {userTokenNumber ? `#${userTokenNumber}` : '—'}
          </div>
          {userStatus && (
            <span className={`lq-status-badge lq-status-${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="lq-stats-row fade-in-up">
          <div className="lq-stat-card">
            <div className="lq-stat-value lq-stat-serving">
              {currentServing || '—'}
            </div>
            <div className="lq-stat-label">Now Serving</div>
          </div>
          <div className="lq-stat-card">
            <div className={`lq-stat-value ${peopleAhead > 3 ? 'lq-stat-amber' : 'lq-stat-green'}`}>
              {peopleAhead}
            </div>
            <div className="lq-stat-label">People Ahead</div>
          </div>
          <div className="lq-stat-card">
            <div className={`lq-stat-value ${estimatedWait === 0 ? 'lq-stat-green' : ''}`}>
              {estimatedWait === 0 ? 'No wait' : formatWaitTime(estimatedWait)}
            </div>
            <div className="lq-stat-label">Est. Wait</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="lq-progress fade-in-up">
          <div className="lq-progress-header">
            <span className="lq-progress-label">Queue Progress</span>
            <span className="lq-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="lq-progress-bar">
            <div
              className="lq-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="lq-actions fade-in-up">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          {userStatus === 'WAITING' && !cancelled && (
            <button
              className="lq-leave-btn"
              onClick={() => setShowLeaveModal(true)}
            >
              Leave Queue
            </button>
          )}
        </div>
      </div>

      {/* Leave Queue Modal */}
      {showLeaveModal && (
        <div className="lq-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="lq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lq-modal-icon">⚠️</div>
            <h3>Are you sure?</h3>
            <p className="lq-modal-warning">
              Your position will be lost and your token will be cancelled.
              You&apos;ll need to rejoin the queue from scratch.
            </p>
            <div className="lq-modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancel
              </Button>
              <button
                className="lq-modal-confirm"
                onClick={handleLeaveQueue}
              >
                Yes, Leave Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueue;
