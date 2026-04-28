// ============================================
// CheckIn Page — QR code scan target
// ============================================
// Route: /checkin?serviceId=XYZ
// Reads serviceId from URL, joins queue, shows token.

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { joinQueue, getUserActiveToken } from '../../services/queue.service';
import { getServiceById } from '../../services/service.service';
import Button from '../../components/Button/Button';
import './CheckIn.css';

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();
  const { user, isAuthenticated, initialLoading } = useAuth();

  const [service, setService] = useState(null);
  const [queueEntry, setQueueEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('loading'); // loading | login | joining | success | error | duplicate

  useEffect(() => {
    if (initialLoading) return;

    if (!serviceId) {
      setError('Invalid QR code. No service ID found.');
      setStep('error');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setStep('login');
      setLoading(false);
      return;
    }

    // Auto-join queue
    const handleCheckin = async () => {
      try {
        setStep('joining');

        // Load service info
        const svc = await getServiceById(serviceId);
        if (!svc) {
          setError('Service not found.');
          setStep('error');
          return;
        }
        setService(svc);

        // Check for existing active token
        const existing = await getUserActiveToken(serviceId, user.uid);
        if (existing) {
          setQueueEntry(existing);
          setStep('duplicate');
          return;
        }

        // Join queue
        const entry = await joinQueue(serviceId, user.uid);
        setQueueEntry(entry);
        setStep('success');
      } catch (err) {
        setError(err.message);
        setStep('error');
      } finally {
        setLoading(false);
      }
    };

    handleCheckin();
  }, [serviceId, isAuthenticated, initialLoading, user]);

  // Login redirect
  if (step === 'login') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon joining">🔐</div>
          <h1 className="checkin-title">Login Required</h1>
          <p className="checkin-subtitle">
            Please login to join the queue.
          </p>
          <Button
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
          >
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Loading / Joining
  if (step === 'loading' || step === 'joining') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon joining">
            <div className="home-loading-spinner" />
          </div>
          <h1 className="checkin-title">Joining Queue...</h1>
          <p className="checkin-subtitle">
            Please wait while we assign your token.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon error">❌</div>
          <h1 className="checkin-title">Check-in Failed</h1>
          <div className="checkin-error">{error}</div>
          <div className="checkin-actions">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Duplicate (already in queue)
  if (step === 'duplicate') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon success">📋</div>
          <h1 className="checkin-title">Already in Queue</h1>
          <p className="checkin-subtitle">
            You already have an active token for {service?.name || 'this service'}.
          </p>
          <div className="checkin-token">
            <div className="checkin-token-label">Your Token</div>
            <div className="checkin-token-value">#{queueEntry?.tokenNumber}</div>
          </div>
          <div className="checkin-actions">
            <Button onClick={() => navigate(`/queue/${serviceId}`)}>
              Track Live Queue
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="checkin-page">
      <div className="checkin-card">
        <div className="checkin-icon success">✅</div>
        <h1 className="checkin-title">Check-in Successful!</h1>
        <p className="checkin-subtitle">
          You've joined the queue at {service?.name || 'the service'}.
        </p>
        <div className="checkin-token">
          <div className="checkin-token-label">Your Token</div>
          <div className="checkin-token-value">#{queueEntry?.tokenNumber}</div>
        </div>
        <div className="checkin-actions">
          <Button onClick={() => navigate(`/queue/${serviceId}`)}>
            Track Live Queue
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
