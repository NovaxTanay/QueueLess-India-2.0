// ============================================
// Analytics — Queue performance metrics
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '@backend/context/AuthContext';
import { subscribeToQueue } from '@backend/services/queue.service';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import StatCard from '../../components/StatCard/StatCard';
import './Analytics.css';

const Analytics = () => {
  const { user, activeServiceId } = useAuth();
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription using activeServiceId
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

  // Stats
  const totalServed = queueEntries.filter((e) => e.status === 'COMPLETED').length;
  const totalWaiting = queueEntries.filter((e) => e.status === 'WAITING').length;
  const totalSkipped = queueEntries.filter((e) => e.status === 'SKIPPED').length;
  const totalServing = queueEntries.filter((e) => e.status === 'SERVING').length;

  // Average wait
  const completedEntries = queueEntries.filter((e) => e.status === 'COMPLETED' && e.createdAt);
  const avgWait = completedEntries.length > 0
    ? Math.round(
        completedEntries.reduce((sum, e) => {
          return sum + (Date.now() - new Date(e.createdAt).getTime()) / 60000;
        }, 0) / completedEntries.length
      )
    : 0;

  // Peak hour
  const hourCounts = {};
  queueEntries.forEach((e) => {
    if (e.createdAt) {
      const hour = new Date(e.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const peakHourStr = peakHour ? `${peakHour[0]}:00` : '—';

  // Status breakdown
  const statusBreakdown = [
    { label: 'Waiting', count: totalWaiting, color: 'var(--waiting)', bg: 'var(--waiting-bg)' },
    { label: 'Serving', count: totalServing, color: 'var(--serving)', bg: 'var(--serving-bg)' },
    { label: 'Completed', count: totalServed, color: 'var(--completed)', bg: 'var(--completed-bg)' },
    { label: 'Skipped', count: totalSkipped, color: 'var(--skipped)', bg: 'var(--skipped-bg)' },
  ];

  // Hourly breakdown table
  const hours = Object.entries(hourCounts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([hour, count]) => {
      const hourEntries = queueEntries.filter(
        (e) => e.createdAt && new Date(e.createdAt).getHours() === Number(hour)
      );
      const completed = hourEntries.filter((e) => e.status === 'COMPLETED').length;
      return {
        hour: `${hour.padStart(2, '0')}:00`,
        tokens: count,
        completed,
      };
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
        <div className="analytics-page fade-in">
          <h1>Analytics</h1>
          <p className="analytics-subtitle">Today&apos;s queue performance</p>

          {/* Top stat cards */}
          <div className="analytics-stats">
            <StatCard
              label="Total Served"
              value={totalServed}
              icon="✅"
              color="#10b981"
            />
            <StatCard
              label="Avg Wait Time"
              value={`${avgWait} min`}
              icon="⏱️"
              color="#8b5cf6"
            />
            <StatCard
              label="Peak Hour"
              value={peakHourStr}
              icon="📈"
              color="#f59e0b"
            />
            <StatCard
              label="Total Tokens"
              value={queueEntries.length}
              icon="🎟️"
              color="#3b82f6"
            />
          </div>

          {/* Status Breakdown */}
          <div className="analytics-breakdown card">
            <h2>Status Breakdown</h2>
            <div className="analytics-breakdown-grid">
              {statusBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="analytics-breakdown-card"
                  style={{ background: item.bg, borderColor: item.color }}
                >
                  <div className="analytics-breakdown-count" style={{ color: item.color }}>
                    {item.count}
                  </div>
                  <div className="analytics-breakdown-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Breakdown Table */}
          <div className="analytics-table card">
            <h2>Hourly Breakdown</h2>
            {hours.length === 0 ? (
              <p className="analytics-empty">No data available yet</p>
            ) : (
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Hour</th>
                    <th>Tokens</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {hours.map((row) => (
                    <tr key={row.hour} className="queue-table-row">
                      <td className="queue-table-token">{row.hour}</td>
                      <td>{row.tokens}</td>
                      <td>{row.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
