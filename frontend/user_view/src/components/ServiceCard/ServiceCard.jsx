import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import CrowdBadge from '../CrowdBadge/CrowdBadge';
import { formatWaitTime, getCategoryDisplayName } from '../../utils/helpers';
import categories from '../../data/categories';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const category = categories.find(c => c.id === service.category);
  const catColor = category?.color || '#10b981';

  // Derive queue size from available fields
  const queueSize = service.currentQueueSize ?? service.queueSize ?? 0;
  const avgServiceTime = service.avgServiceTime ?? 0;
  const capacityPerHour = service.capacityPerHour ?? 1;

  // Calculate estimated wait time in minutes
  const calculatedWaitTime = capacityPerHour > 0
    ? Math.round((queueSize * avgServiceTime) / capacityPerHour)
    : 0;

  // Derive crowd level from live queue size
  const getDerivedCrowdLevel = () => {
    if (queueSize <= 5) return 'low';
    if (queueSize <= 15) return 'medium';
    return 'high';
  };

  const handleClick = () => {
    navigate(`/service/${service.id}`);
  };

  return (
    <div
      className="service-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="service-card-image">
        <span className="service-card-image-placeholder">
          {category?.icon && <category.icon />}
        </span>
        <span
          className="service-card-category-badge"
          style={{ background: `${catColor}cc` }}
        >
          {getCategoryDisplayName(service.category)}
        </span>
      </div>

      <div className="service-card-body">
        <h3 className="service-card-name">{service.name}</h3>
        <div className="service-card-location">
          <FaMapMarkerAlt size={12} />
          <span>{service.location}</span>
        </div>
        <div className="service-card-meta">
          <CrowdBadge level={getDerivedCrowdLevel()} />
          <div className="service-card-wait">
            <FaClock size={12} />
            <span>Wait: </span>
            <span className="service-card-wait-value">{formatWaitTime(calculatedWaitTime)}</span>
          </div>
          <div className="service-card-rating">
            <FaStar size={12} />
            <span>{service.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
