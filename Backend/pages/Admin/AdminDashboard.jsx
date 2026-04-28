// ============================================
// Admin Dashboard — Live service overview
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServicesByAdmin } from '../../services/service.service';
import useQueue from '../../hooks/useQueue';
import QRGenerator from '../../components/QRGenerator/QRGenerator';
import Button from '../../components/Button/Button';
import './Admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admin's service
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        const services = await getServicesByAdmin(user.uid);
        setService(services?.[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Real-time queue data for admin's service
  const {
    waitingCount,
    currentServing,
    completedCount,
    totalInQueue,
    queueEntries,
  } = useQueue(service?.id || null);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="home-loading"><div className="home-loading-spinner" /></div>
        </div>
      </div>
    );
  }

  // No service registered yet
  if (!service) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-no-service">
            <div className="admin-no-service-icon">🏢</div>
            <h2>No Service Registered</h2>
            <p>Register your service to start managing queues.</p>
            <Button onClick={() => navigate('/admin/register')}>
              Register Service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const skippedCount = queueEntries.filter(e => e.status === 'SKIPPED').length;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <span className="admin-header-badge">Admin</span>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-row" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--status-warning)' }}>{waitingCount}</div>
            <div className="admin-stat-label">Waiting</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--primary-400)' }}>{currentServing || '—'}</div>
            <div className="admin-stat-label">Now Serving</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--status-success)' }}>{completedCount}</div>
            <div className="admin-stat-label">Completed</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value" style={{ color: 'var(--text-secondary)' }}>{totalInQueue}</div>
            <div className="admin-stat-label">Total Today</div>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          {/* Service Info */}
          <div className="admin-service-card">
            <h2>{service.name}</h2>
            <div className="admin-service-info">
              <div className="admin-service-row">
                <span className="admin-service-row-label">Category</span>
                <span className="admin-service-row-value">{service.category}</span>
              </div>
              <div className="admin-service-row">
                <span className="admin-service-row-label">Location</span>
                <span className="admin-service-row-value">{service.location}</span>
              </div>
              <div className="admin-service-row">
                <span className="admin-service-row-label">Capacity/Hour</span>
                <span className="admin-service-row-value">{service.capacityPerHour}</span>
              </div>
              <div className="admin-service-row">
                <span className="admin-service-row-label">Avg Service Time</span>
                <span className="admin-service-row-value">{service.avgServiceTime} min</span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
              <Button onClick={() => navigate('/admin/queue')}>
                Manage Queue
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/register')}>
                Edit Service
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <QRGenerator serviceId={service.id} serviceName={service.name} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
