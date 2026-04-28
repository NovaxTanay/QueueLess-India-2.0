import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { getServiceById } from '@backend/services/service.service';
import { getCategoryDisplayName, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import useBooking from '../../hooks/useBooking';
import SlotSelector from '../../components/SlotSelector/SlotSelector';
import Button from '../../components/Button/Button';
import './BookSlot.css';

const BookSlot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/book/${id}`)}`);
      return;
    }
    const load = async () => {
      try {
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, navigate]);

  const {
    dates,
    selectedDate,
    selectedSlot,
    booking,
    loading,
    error,
    step,
    selectDate,
    selectSlot,
    confirmBooking,
  } = useBooking(service, user?.uid);

  // Generate time slots (since services don't have hardcoded slots anymore)
  const generateSlots = () => {
    const slots = [];
    for (let h = 9; h <= 17; h++) {
      slots.push({
        id: `slot-${h}-00`,
        time: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
        available: true,
      });
      if (h < 17) {
        slots.push({
          id: `slot-${h}-30`,
          time: `${h > 12 ? h - 12 : h}:30 ${h >= 12 ? 'PM' : 'AM'}`,
          available: true,
        });
      }
    }
    return slots;
  };

  if (pageLoading) {
    return (
      <div className="service-detail-loading">
        <div className="home-loading-spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="book-slot-page">
        <div className="container">
          <div className="service-list-empty">
            <div className="service-list-empty-icon">😕</div>
            <h3>Service not found</h3>
          </div>
        </div>
      </div>
    );
  }

  // Confirmed state
  if (step === 'confirmed' && booking) {
    return (
      <div className="book-slot-page">
        <div className="container">
          <div className="book-slot-main">
            <div className="book-confirmed">
              <div className="book-confirmed-icon">✅</div>
              <h2>Booking Confirmed!</h2>
              <p>Your slot at <strong>{service.name}</strong> has been booked.</p>
              <p>{formatDate(booking.slotDate)} at {booking.slotTime}</p>

              <div className="book-confirmed-token">
                <div className="book-confirmed-token-label">Your Token</div>
                <div className="book-confirmed-token-value">#{booking.tokenNumber}</div>
              </div>

              <div className="book-confirmed-actions">
                <Button onClick={() => navigate(`/queue/${service.id}`)}>
                  Track Live Queue
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = generateSlots();

  return (
    <div className="book-slot-page">
      <div className="container">
        <div className="book-slot-breadcrumb">
          <Link to="/">Home</Link>
          <FaChevronRight size={10} />
          <Link to={`/service/${service.id}`}>{service.name}</Link>
          <FaChevronRight size={10} />
          <span>Book Slot</span>
        </div>

        <div className="book-slot-layout">
          <div className="book-slot-main">
            <h1>Book a Slot</h1>
            <p>Select a date and time slot to book your visit at {service.name}.</p>

            {error && <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

            <SlotSelector
              dates={dates}
              selectedDate={selectedDate}
              onDateSelect={selectDate}
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={selectSlot}
            />

            <div className="book-slot-actions">
              <Button
                onClick={confirmBooking}
                loading={loading}
                disabled={!selectedSlot}
                size="lg"
                id="confirm-booking-btn"
              >
                Confirm Booking
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="book-slot-summary">
            <h3>Booking Summary</h3>
            <div className="book-slot-summary-row">
              <span className="book-slot-summary-label">Service</span>
              <span className="book-slot-summary-value">{service.name}</span>
            </div>
            <div className="book-slot-summary-row">
              <span className="book-slot-summary-label">Category</span>
              <span className="book-slot-summary-value">{getCategoryDisplayName(service.category)}</span>
            </div>
            <div className="book-slot-summary-row">
              <span className="book-slot-summary-label">Date</span>
              <span className="book-slot-summary-value highlight">
                {selectedDate ? formatDate(selectedDate) : '—'}
              </span>
            </div>
            <div className="book-slot-summary-row">
              <span className="book-slot-summary-label">Time Slot</span>
              <span className="book-slot-summary-value highlight">
                {selectedSlot ? (selectedSlot.time || selectedSlot) : '— Select a slot —'}
              </span>
            </div>
            <div className="book-slot-summary-row">
              <span className="book-slot-summary-label">Location</span>
              <span className="book-slot-summary-value">{service.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
