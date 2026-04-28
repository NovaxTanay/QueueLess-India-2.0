// ============================================
// Admin Queue — Live queue management table
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getServicesByAdmin } from '../../services/service.service';
import { callNextToken, updateTokenStatus, skipToken, completeToken } from '../../services/queue.service';
import useQueue from '../../hooks/useQueue';
import Button from '../../components/Button/Button';
import './Admin.css';

const AdminQueue = () => {
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        const svc = await getServiceByAdmin(user.uid);
        setService(svc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const {
    queueEntries,
    waitingCount,
    currentServing,
    servingEntry,
    loading: queueLoading,
    error: queueError,
  } = useQueue(service?.id || null);

  const handleCallNext = async () => {
    if (!service?.id) return;
    setActionLoading(true);
    try {
      const result = await callNextToken(service.id);
      if (!result) {
        alert('No one is waiting in the queue.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (queueId) => {
    try {
      await skipToken(queueId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (queueId) => {
    try {
      await completeToken(queueId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleServe = async (queueId) => {
    try {
      await updateTokenStatus(queueId, 'SERVING');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="home-loading"><div className="home-loading-spinner" /></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="admin-page">
        <div className="container">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--space-3xl)' }}>
            No service found. Please register a service first.
          </p>
        </div>
      </div>
    );
  }

  // Separate queue entries by status for display order
  const servingEntries = queueEntries.filter(e => e.status === 'SERVING' || e.status === 'CALLED');
  const waitingEntries = queueEntries.filter(e => e.status === 'WAITING');
  const doneEntries = queueEntries.filter(e => e.status === 'COMPLETED' || e.status === 'SKIPPED');
  const orderedEntries = [...servingEntries, ...waitingEntries, ...doneEntries];

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Queue Management — {service.name}</h1>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className="admin-header-badge">
              {waitingCount} waiting
            </span>
            <Button
              onClick={handleCallNext}
              loading={actionLoading}
              disabled={waitingCount === 0}
            >
              📢 Call Next
            </Button>
          </div>
        </div>

        {queueError && (
          <div className="checkin-error" style={{ marginBottom: 'var(--space-md)' }}>
            {queueError}
          </div>
        )}

        {/* Currently Serving */}
        {servingEntry && (
          <div className="admin-stat-card" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--primary-500)' }}>
            <div className="admin-stat-label" style={{ marginBottom: 'var(--space-sm)' }}>Now Serving</div>
            <div className="admin-stat-value" style={{ color: 'var(--primary-400)', fontSize: '48px' }}>
              #{servingEntry.tokenNumber}
            </div>
          </div>
        )}

        {/* Queue Table */}
        <div className="admin-service-card">
          <h2>Live Queue ({queueEntries.length} tokens today)</h2>

          {orderedEntries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No tokens in the queue yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-queue-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Status</th>
                    <th>Joined At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                        #{entry.tokenNumber}
                      </td>
                      <td>
                        <span className={`admin-status-badge ${entry.status}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '—'}
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          {entry.status === 'WAITING' && (
                            <>
                              <button className="admin-action-btn serve" onClick={() => handleServe(entry.id)}>
                                Serve
                              </button>
                              <button className="admin-action-btn skip" onClick={() => handleSkip(entry.id)}>
                                Skip
                              </button>
                            </>
                          )}
                          {(entry.status === 'SERVING' || entry.status === 'CALLED') && (
                            <button className="admin-action-btn complete" onClick={() => handleComplete(entry.id)}>
                              Complete
                            </button>
                          )}
                          {(entry.status === 'COMPLETED' || entry.status === 'SKIPPED') && (
                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;
