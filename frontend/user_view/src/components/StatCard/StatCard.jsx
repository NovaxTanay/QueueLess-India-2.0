import './StatCard.css';

const StatCard = ({ icon, value, label, color = 'var(--primary-500)' }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-card-icon"
        style={{ background: `${color}18`, color: color }}
      >
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

export default StatCard;
