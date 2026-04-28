// ============================================
// QueueLess India 2.0 — Booking Service
// ============================================
// Slot-based booking with Firestore

import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const BOOKING_COLLECTION = 'bookings';
const QUEUE_COLLECTION = 'queue';

/**
 * Get start of today as Firestore Timestamp
 */
const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(now);
};

/**
 * Create a booking with auto-increment token (transaction-safe).
 *
 * @param {string} userId
 * @param {string} serviceId
 * @param {string} slotTime - e.g. "10:30 AM"
 * @param {string} slotDate - e.g. "2026-04-28"
 * @returns {object} booking data with token
 */
export const createBooking = async (userId, serviceId, slotTime, slotDate) => {
  if (!userId || !serviceId || !slotTime || !slotDate) {
    throw new Error('All booking fields are required.');
  }

  try {
    // Check for duplicate booking (same user, same service, same date, same slot)
    const dupQuery = query(
      collection(db, BOOKING_COLLECTION),
      where('userId', '==', userId),
      where('serviceId', '==', serviceId),
      where('slotDate', '==', slotDate),
      where('slotTime', '==', slotTime),
      where('status', '==', 'confirmed')
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      throw new Error('You already have a booking for this slot.');
    }

    // Generate token number using transaction
    const startOfToday = getStartOfToday();
    const tokenQuery = query(
      collection(db, QUEUE_COLLECTION),
      where('serviceId', '==', serviceId),
      where('createdAt', '>=', startOfToday),
      orderBy('createdAt', 'desc'),
      orderBy('tokenNumber', 'desc'),
      limit(1)
    );

    const result = await runTransaction(db, async (transaction) => {
      // Get last token for today
      const tokenSnap = await getDocs(tokenQuery);
      const nextToken = tokenSnap.empty ? 1 : tokenSnap.docs[0].data().tokenNumber + 1;

      // Create booking document
      const bookingData = {
        userId,
        serviceId,
        slotTime,
        slotDate,
        tokenNumber: nextToken,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      };

      const bookingRef = doc(collection(db, BOOKING_COLLECTION));
      transaction.set(bookingRef, bookingData);

      // Also create a queue entry so booking shows in the queue
      const queueData = {
        serviceId,
        userId,
        tokenNumber: nextToken,
        status: 'WAITING',
        bookingId: bookingRef.id,
        createdAt: serverTimestamp(),
      };

      const queueRef = doc(collection(db, QUEUE_COLLECTION));
      transaction.set(queueRef, queueData);

      return {
        id: bookingRef.id,
        ...bookingData,
        createdAt: new Date().toISOString(),
      };
    });

    return result;
  } catch (error) {
    if (error.message.includes('already have a booking')) {
      throw error;
    }
    console.error('Create booking error:', error);
    throw new Error('Failed to create booking. Please try again.');
  }
};

/**
 * Get all bookings for a user (one-time fetch)
 *
 * @param {string} userId
 * @returns {Array} bookings
 */
export const getUserBookings = async (userId) => {
  try {
    const q = query(
      collection(db, BOOKING_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Get bookings error:', error);
    throw new Error('Failed to load bookings.');
  }
};

/**
 * Subscribe to real-time booking updates for a user
 *
 * @param {string} userId
 * @param {function} callback - called with (bookings[], error)
 * @returns {function} unsubscribe
 */
export const subscribeToUserBookings = (userId, callback) => {
  const q = query(
    collection(db, BOOKING_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }));
      callback(bookings, null);
    },
    (error) => {
      console.error('Booking subscription error:', error);
      callback([], error);
    }
  );
};
