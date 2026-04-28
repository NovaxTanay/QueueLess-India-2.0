// ============================================
// Dashboard — All services overview + detail
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@backend/context/AuthContext';
import { subscribeToQueue } from '@backend/services/queue.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import StatCard from '../../components/StatCard/StatCard';
import TokenBadge from '../../components/TokenBadge/TokenBadge';
import { formatTime, getWaitDuration } from '../../utils/helpers';
import './Dashboard.css';

const CATEGORY_ICONS = {
  hospital: '🏥',
  bank: '🏦',
  government: '🏛️',
  temple: '🛕',
  'service-center': '🔧',
  education: '🎓',
};

// ── Per-service detail view ──────────────────
const ServiceDetail = ({ service, onBack, showBack }) => {
  const navigate = useNavigate();
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToQueue(service.id, (entries, err) => {
      if (!err) setQueueEntries(entries);
      setLoading(false);
    });
    return () => unsub();
  }, [service.id]);

  const waitingCount = queueEntries.filter((e) => e.status === 'WAITING').length;
  const servingEntry = queueEntries.find((e) => e.status === 'SERVING');
  const completedCount = queueEntries.filter((e) => e.status === 'COMPLETED').length;
  const skippedCount = queueEntries.filter((e) => e.status === 'SKIPPED').length;
  const totalToday = queueEntries.length;

  const completedEntries = queueEntries.filter((e) => e.status === 'COMPLETED' && e.createdAt);
  const avgWait = completedEntries.length > 0
    ? Math.round(
      completedEntries.reduce((sum, e) => {
        return sum + (Date.now() - new Date(e.createdAt).getTime()) / 60000;
      }, 0) / completedEntries.length
    )
    : 0;

  const recentEntries = [...queueEntries].reverse().slice(0, 5);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span className="loading-text">Loading...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Back + header */}
      <div className="dashboard-welcome">
        {showBack && (
          <button className="btn btn-secondary btn-sm db-back-btn" onClick={onBack}>
            ← All Services
          </button>
        )}
        <h1>
          {CATEGORY_ICONS[service.category] || '📋'} {service.name}
        </h1>
        <p>{service.location} · {service.category}</p>
      </div>

      {/* Service info card */}
      <div className="card db-service-info fade-in">
        <div className="db-service-info-grid">
          <div className="db-service-info-row">
            <span className="db-service-info-label">Category</span>
            <span className="db-service-info-value">{service.category}</span>
          </div>
          <div className="db-service-info-row">
            <span className="db-service-info-label">Location</span>
            <span className="db-service-info-value">{service.location || '—'}</span>
          </div>
          <div className="db-service-info-row">
            <span className="db-service-info-label">Capacity/Hour</span>
            <span className="db-service-info-value">{service.capacityPerHour || 20}</span>
          </div>
          <div className="db-service-info-row">
            <span className="db-service-info-label">Avg Service Time</span>
            <span className="db-service-info-value">{service.avgServiceTime || 5} min</span>
          </div>
          {service.operatingHours && (
            <div className="db-service-info-row">
              <span className="db-service-info-label">Hours</span>
              <span className="db-service-info-value">
                {service.operatingHours.open} — {service.operatingHours.close}
              </span>
            </div>
          )}
        </div>
        <div className="db-service-info-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/queue')}
          >
            Manage Queue
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/my-services')}
          >
            Edit Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats fade-in">
        <StatCard label="Total Tokens Today" value={totalToday} icon="🎟️" color="#3b82f6" />
        <StatCard label="Currently Serving" value={servingEntry ? `#${servingEntry.tokenNumber}` : '—'} icon="▶️" color="#10b981" />
        <StatCard label="People Waiting" value={waitingCount} icon="⏳" color="#f59e0b" />
        <StatCard label="Completed Today" value={completedCount} icon="✅" color="#6366f1" />
        <StatCard label="Avg Wait Time" value={`${avgWait} min`} icon="⏱️" color="#8b5cf6" />
        <StatCard label="Skipped Today" value={skippedCount} icon="⏭️" color="#ef4444" />
      </div>

      {/* Recent Queue */}
      <div className="dashboard-recent card fade-in">
        <div className="dashboard-recent-header">
          <h2>Recent Queue Activity</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/queue')}>
            View All
          </button>
        </div>
        {recentEntries.length === 0 ? (
          <div className="dashboard-recent-empty">
            <span className="dashboard-recent-empty-icon">🎟️</span>
            <p>No queue activity today</p>
          </div>
        ) : (
          <div className="dashboard-recent-list">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="dashboard-recent-item">
                <div className="dashboard-recent-token">#{entry.tokenNumber}</div>
                <TokenBadge status={entry.status} />
                <span className="dashboard-recent-time">{formatTime(entry.createdAt)}</span>
                <span className="dashboard-recent-wait">{getWaitDuration(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Services grid (home view) ────────────────
const ServicesGrid = ({ services, onSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <div className="dashboard-welcome">
        <h1>Admin Dashboard</h1>
        <p>Select a service to view its live queue</p>
      </div>
      <div className="db-services-grid">
        {services.map((svc) => (
          <button
            key={svc.id}
            className="card db-service-card"
            onClick={() => onSelect(svc)}
          >
            <span className="db-service-card-icon">
              {CATEGORY_ICONS[svc.category] || '📋'}
            </span>
            <h3 className="db-service-card-name">{svc.name}</h3>
            <p className="db-service-card-location">{svc.location || '—'}</p>
            <span className="db-service-card-category">{svc.category}</span>
          </button>
        ))}

        {/* Add new service card */}
        <button
          className="card db-service-card db-service-card--add"
          onClick={() => navigate('/onboarding')}
        >
          <span className="db-service-card-icon">➕</span>
          <h3 className="db-service-card-name">Add New Service</h3>
        </button>
      </div>
    </div>
  );
};

// ── Main Dashboard ───────────────────────────
const Dashboard = () => {
  const { adminServices, initialLoading } = useAuth();
  const [selectedService, setSelectedService] = useState(null);

  // Auto-select if only one service; keep selectedService in sync with onSnapshot
  useEffect(() => {
    if (adminServices.length === 1 && !selectedService) {
      setSelectedService(adminServices[0]);
    }
    if (selectedService) {
      const updated = adminServices.find((s) => s.id === selectedService.id);
      if (updated) {
        setSelectedService(updated);
      } else if (adminServices.length > 0) {
        // Selected service was deleted — go back to grid
        setSelectedService(null);
      }
    }
  }, [adminServices]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasMultiple = adminServices.length > 1;

  if (initialLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <Topbar />
        <main className="page-content">
          <div className="loading-container fade-in">
            <div className="spinner" />
            <span className="loading-text">Loading services...</span>
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
        {selectedService ? (
          <ServiceDetail
            service={selectedService}
            onBack={() => setSelectedService(null)}
            showBack={hasMultiple}
          />
        ) : (
          <ServicesGrid
            services={adminServices}
            onSelect={setSelectedService}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;