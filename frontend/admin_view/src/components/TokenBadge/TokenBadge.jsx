// ============================================
// TokenBadge — Color-coded status badge
// ============================================

import { getStatusColor } from '../../utils/helpers';
import './TokenBadge.css';

const STATUS_LABELS = {
  EMERGENCY: '🚨 EMERGENCY',
};

const TokenBadge = ({ status }) => {
  const colorClass = getStatusColor(status);
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`token-badge token-badge-${colorClass}`}>
      {label}
    </span>
  );
};

export default TokenBadge;
