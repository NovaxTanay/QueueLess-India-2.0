// ============================================
// QueueLess India 2.0 — useBooking Hook (Firestore)
// ============================================

import { useState, useCallback } from 'react';
import { createBooking } from '../services/booking.service';

/**
 * Generate date options for the next N days
 */
const getNextDays = (count = 7) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      value: date.toISOString().split('T')[0],
      label:
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
      dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
    });
  }
  return days;
};

/**
 * useBooking — manages the booking flow using Firestore.
 *
 * @param {object} service - the service being booked
 * @param {string} userId - current user's UID
 */
const useBooking = (service, userId) => {
  const dates = getNextDays(7);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.value || '');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select'); // select | confirming | confirmed

  const selectDate = useCallback((date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const selectSlot = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  const confirmBooking = useCallback(async () => {
    if (!selectedSlot || !selectedDate || !service || !userId) {
      setError('Please select a date and time slot.');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('confirming');

    try {
      const result = await createBooking(
        userId,
        service.id,
        selectedSlot.time || selectedSlot,
        selectedDate
      );
      setBooking(result);
      setStep('confirmed');
      return result;
    } catch (err) {
      setError(err.message);
      setStep('select');
    } finally {
      setLoading(false);
    }
  }, [selectedSlot, selectedDate, service, userId]);

  const reset = useCallback(() => {
    setSelectedDate(dates[0]?.value || '');
    setSelectedSlot(null);
    setBooking(null);
    setError(null);
    setStep('select');
  }, [dates]);

  return {
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
    reset,
  };
};

export default useBooking;
