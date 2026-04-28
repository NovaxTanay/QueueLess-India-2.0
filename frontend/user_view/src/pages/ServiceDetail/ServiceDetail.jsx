import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaStar, FaPhone, FaChevronRight } from 'react-icons/fa';
import { getServiceById } from '@backend/services/service.service';
import { formatWaitTime, getCategoryDisplayName } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import useQueue from '../../hooks/useQueue';
import categoriesData from '../../data/categories';
import CrowdBadge from '../../components/CrowdBadge/CrowdBadge';
import QueueStatusCard from '../../components/QueueStatusCard/QueueStatusCard';
import Button from '../../components/Button/Button';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time queue for this service
  const {
    currentServing,
    waitingCount,
    estimatedWait,
    emergencyCount,
    userEntry,
    joinQueue: handleJoinQueue,
  } = useQueue(id, user?.uid, service?.avgServiceTime || 5);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      try {
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        console.error('Failed to load service:', err);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/service/${id}`)}`);
      return;
    }
    try {
      await handleJoinQueue();
      navigate(`/queue/${id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-loading">
        <div className="home-loading-spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="service-list-empty">
            <div className="service-list-empty-icon">😕</div>
            <h3>Service not found</h3>
            <p>The service you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const category = categoriesData.find(c => c.id === service.category);
  const catColor = category?.color || '#10b981';

  return (
    <div className="service-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="service-detail-breadcrumb">
          <Link to="/">Home</Link>
          <FaChevronRight size={10} />
          <Link to={`/services/${service.category}`}>{category?.name || 'Services'}</Link>
          <FaChevronRight size={10} />
          <span>{service.name}</span>
        </div>

        <div className="service-detail-layout">
          {/* Main content */}
          <div>
            <div className="service-detail-hero">
              <div className="service-detail-banner" style={{ background: `${catColor}15` }}>
                <div className="service-detail-banner-bg" style={{ background: category?.gradient }} />
                <span className="service-detail-banner-icon" style={{ color: catColor }}>
                  {category?.icon && <category.icon />}
                </span>
                <span className="service-detail-banner-badge" style={{ background: catColor }}>
                  {getCategoryDisplayName(service.category)}
                </span>
              </div>

              <div className="service-detail-info">
                <h1 className="service-detail-name">{service.name}</h1>

                <div className="service-detail-meta">
                  <span className="service-detail-meta-item">
                    <FaMapMarkerAlt size={13} />
                    {service.location}
                  </span>
                  <span className="service-detail-meta-item">
                    <FaClock size={13} />
                    Wait: {formatWaitTime(estimatedWait)}
                  </span>
                </div>

                <div className="service-detail-info-grid">
                  <div className="service-detail-info-item">
                    <div className="service-detail-info-label">Category</div>
                    <div className="service-detail-info-value">
                      {getCategoryDisplayName(service.category)}
                    </div>
                  </div>
                  <div className="service-detail-info-item">
                    <div className="service-detail-info-label">Location</div>
                    <div className="service-detail-info-value">{service.location}</div>
                  </div>
                  <div className="service-detail-info-item">
                    <div className="service-detail-info-label">Capacity/Hour</div>
                    <div className="service-detail-info-value">{service.capacityPerHour || 'N/A'}</div>
                  </div>
                  <div className="service-detail-info-item">
                    <div className="service-detail-info-label">Queue Size</div>
                    <div className="service-detail-info-value" style={{ color: 'var(--primary-400)' }}>
                      {waitingCount} waiting
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="service-detail-sidebar">
            <div className="service-detail-cta">
              {userEntry ? (
                <>
                  <h3>You're in the Queue!</h3>
                  <p>Your token: <strong>#{userEntry.tokenNumber}</strong></p>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => navigate(`/queue/${id}`)}
                    id="track-queue-btn"
                  >
                    Track Live Queue
                  </Button>
                </>
              ) : (
                <>
                  <h3>Ready to skip the queue?</h3>
                  <p>Join the queue now or book a slot.</p>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleJoin}
                    id="join-queue-btn"
                    style={{ marginBottom: 'var(--space-sm)' }}
                  >
                    Join Queue Now
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => navigate(`/book/${service.id}`)}
                    id="book-slot-btn"
                  >
                    Book a Slot
                  </Button>
                </>
              )}
            </div>

            <QueueStatusCard
              currentServing={currentServing}
              totalInQueue={waitingCount}
              estimatedWait={estimatedWait}
            />

            {emergencyCount > 0 && (
              <p className="service-detail-emergency-notice">
                🚨 {emergencyCount} emergency case{emergencyCount > 1 ? 's' : ''} active — wait times may vary
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
