import { getCrowdLabel } from '../../utils/helpers';
import './CrowdBadge.css';

const CrowdBadge = ({ level }) => {
  const safeLevel = level || 'low';
  return (
    <span className={`crowd-badge crowd-${safeLevel}`}>
      <span className="crowd-badge-dot" />
      {getCrowdLabel(safeLevel)}
    </span>
  );
};

export default CrowdBadge;
