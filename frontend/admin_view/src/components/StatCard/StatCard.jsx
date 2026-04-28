// ============================================
// StatCard — Reusable metric card
// ============================================

import './StatCard.css';

const StatCard = ({ label, value, icon, color, subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
