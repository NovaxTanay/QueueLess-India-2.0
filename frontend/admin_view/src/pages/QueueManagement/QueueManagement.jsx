// ============================================
// Queue Management — Live token control
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '@backend/context/AuthContext';
import {
  subscribeToQueue,
  callNextToken,
  completeToken,
  skipToken,
  addEmergencyToken,
} from '@backend/services/queue.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import QueueTable from '../../components/QueueTable/QueueTable';
import './QueueManagement.css';

const FILTERS = ['All', 'WAITING', 'SERVING', 'COMPLETED', 'SKIPPED', 'EMERGENCY', 'CANCELLED'];

const QueueManagement = () => {
  const { user, activeService, activeServiceId } = useAuth();
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callLoading, setCallLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Emergency modal state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const isHospital = activeService?.category === 'hospital';

  // Real-time queue subscription using activeServiceId
  useEffect(() => {
    if (!activeServiceId) {
      setQueueEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToQueue(activeServiceId, (entries, err) => {
      if (!err) setQueueEntries(entries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeServiceId]);

  const handleCallNext = async () => {
    if (!activeServiceId) return;
    setCallLoading(true);
    try {
      const result = await callNextToken(activeServiceId);
      if (!result) {
        alert('No one is waiting in the queue.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCallLoading(false);
    }
  };

  const handleComplete = async (queueId) => {
    try {
      await completeToken(queueId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSkip = async (queueId) => {
    try {
      await skipToken(queueId);
    } catch (err) {
      alert(err.message);
    }
  };

  // Emergency handlers
  const handleEmergencyOpen = () => {
    setEmergencyName('');
    setShowEmergencyModal(true);
  };

  const handleEmergencyClose = () => {
    setShowEmergencyModal(false);
    setEmergencyName('');
  };

  const handleEmergencyConfirm = async () => {
    if (!activeServiceId) return;
    setEmergencyLoading(true);
    try {
      await addEmergencyToken(activeServiceId, emergencyName || 'Emergency');
      setShowEmergencyModal(false);
      setEmergencyName('');
    } catch (err) {
      alert(err.message);
    } finally {
      setEmergencyLoading(false);
    }
  };

  // Computed
  const servingEntry = queueEntries.find((e) => e.status === 'SERVING');
  const waitingCount = queueEntries.filter((e) => e.status === 'WAITING').length;
  const emergencyCount = queueEntries.filter((e) => e.status === 'EMERGENCY').length;
  const callableCount = waitingCount + emergencyCount;

  // Filter entries
  const filteredEntries =
    activeFilter === 'All'
      ? queueEntries
      : activeFilter === 'EMERGENCY'
        ? queueEntries.filter((e) => e.isEmergency === true)
        : queueEntries.filter((e) => e.status === activeFilter);

  // Sort: emergency first, then serving, then waiting, then rest
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    // Emergency always first
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;

    const order = { EMERGENCY: 0, SERVING: 1, CALLED: 2, WAITING: 3, COMPLETED: 4, SKIPPED: 5 };
    return (order[a.status] ?? 6) - (order[b.status] ?? 6);
  });

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <Topbar />
        <main className="page-content">
          <div className="loading-container">
            <div className="spinner" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Topbar />

      <main className="page-content">
        <div className="qm-header fade-in">
          <div className="qm-header-left">
            <h1>Queue Management</h1>
            <p>{queueEntries.length} tokens today</p>
          </div>
          <div className="qm-header-actions">
            {isHospital && (
              <button
                className="btn qm-emergency-btn"
                onClick={handleEmergencyOpen}
                type="button"
              >
                🚨 Add Emergency
              </button>
            )}
            <button
              className={`btn btn-primary btn-lg qm-call-btn ${callLoading ? 'btn-loading' : ''}`}
              onClick={handleCallNext}
              disabled={callLoading || callableCount === 0}
            >
              {callLoading && <span className="btn-spinner" />}
              📢 Call Next
            </button>
          </div>
        </div>

        {/* Currently Serving */}
        {servingEntry && (
          <div className="qm-serving card fade-in">
            <div className="qm-serving-label">Now Serving</div>
            <div className="qm-serving-token">#{servingEntry.tokenNumber}</div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="qm-filters fade-in">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`qm-filter-btn ${activeFilter === f ? 'qm-filter-active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== 'All' && (
                <span className="qm-filter-count">
                  {f === 'EMERGENCY'
                    ? queueEntries.filter((e) => e.isEmergency === true).length
                    : queueEntries.filter((e) => e.status === f).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue Table */}
        <div className="card fade-in">
          <QueueTable
            entries={sortedEntries}
            onComplete={handleComplete}
            onSkip={handleSkip}
            loading={false}
          />
        </div>

        {/* Emergency Modal */}
        {showEmergencyModal && (
          <div className="qm-modal-overlay" onClick={handleEmergencyClose}>
            <div className="qm-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="qm-modal-title">🚨 Add Emergency Patient</h2>
              <div className="auth-field">
                <label htmlFor="emergency-name">Patient Name (optional)</label>
                <input
                  id="emergency-name"
                  type="text"
                  placeholder="Enter patient name (optional)"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="qm-modal-warning">
                This will add the patient to the <strong>TOP</strong> of the queue
                with highest priority.
              </p>
              <div className="qm-modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleEmergencyClose}
                  disabled={emergencyLoading}
                >
                  Cancel
                </button>
                <button
                  className={`btn qm-modal-confirm ${emergencyLoading ? 'btn-loading' : ''}`}
                  onClick={handleEmergencyConfirm}
                  disabled={emergencyLoading}
                >
                  {emergencyLoading && <span className="btn-spinner" />}
                  🚨 Confirm Emergency
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QueueManagement;
