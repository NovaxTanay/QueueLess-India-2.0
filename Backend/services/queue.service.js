// ============================================
// QueueLess India 2.0 — Queue Service
// ============================================
// Real-time queue management with Firestore transactions
// for race-condition-safe token generation.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
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

const QUEUE_COLLECTION = 'queue';

// Valid status transitions
const VALID_STATUSES = ['WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED', 'EMERGENCY', 'CANCELLED'];

/**
 * Get start of today as Firestore Timestamp (for daily token reset)
 */
const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(now);
};

/**
 * Join queue with TRANSACTION-SAFE token generation.
 * Prevents race conditions when multiple users join simultaneously.
 * Also prevents duplicate check-in (one active token per user per service).
 *
 * @param {string} serviceId
 * @param {string} userId
 * @returns {object} queue entry with token number
 */
export const joinQueue = async (serviceId, userId) => {
  if (!serviceId || !userId) {
    throw new Error('Service ID and User ID are required.');
  }

  try {
    // Step 1: Check for duplicate (user already has active token)
    const existingToken = await getUserActiveToken(serviceId, userId);
    if (existingToken) {
      throw new Error(
        `You already have an active token (#${existingToken.tokenNumber}) for this service.`
      );
    }

    // Step 2: Use transaction for atomic token generation
    const queueRef = collection(db, QUEUE_COLLECTION);
    const startOfToday = getStartOfToday();

    // Get the highest token number for today for this service
    const tokenQuery = query(
      queueRef,
      where('serviceId', '==', serviceId),
      where('createdAt', '>=', startOfToday),
      orderBy('createdAt', 'desc'),
      orderBy('tokenNumber', 'desc'),
      limit(1)
    );

    // Use runTransaction to prevent race conditions
    const result = await runTransaction(db, async (transaction) => {
      const tokenSnap = await getDocs(tokenQuery);
      const nextToken = tokenSnap.empty ? 1 : tokenSnap.docs[0].data().tokenNumber + 1;

      const newEntry = {
        serviceId,
        userId,
        tokenNumber: nextToken,
        status: 'WAITING',
        createdAt: serverTimestamp(),
      };

      const docRef = doc(queueRef);
      transaction.set(docRef, newEntry);

      return {
        id: docRef.id,
        ...newEntry,
        createdAt: new Date().toISOString(),
      };
    });

    return result;
  } catch (error) {
    if (error.message.includes('already have an active token')) {
      throw error; // re-throw duplicate check error as-is
    }
    console.error('Join queue error:', error);
    throw new Error('Failed to join queue. Please try again.');
  }
};

/**
 * Check if user already has an active token for a service.
 * Active = WAITING or CALLED or SERVING (not COMPLETED/SKIPPED)
 *
 * @param {string} serviceId
 * @param {string} userId
 * @returns {object|null} active queue entry or null
 */
export const getUserActiveToken = async (serviceId, userId) => {
  try {
    const q = query(
      collection(db, QUEUE_COLLECTION),
      where('serviceId', '==', serviceId),
      where('userId', '==', userId),
      where('status', 'in', ['WAITING', 'CALLED', 'SERVING']),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Check active token error:', error);
    return null; // fail open — let them try to join
  }
};

/**
 * Subscribe to real-time queue updates for a service.
 * Returns unsubscribe function.
 *
 * @param {string} serviceId
 * @param {function} callback - called with array of queue entries
 * @returns {function} unsubscribe
 */
export const subscribeToQueue = (serviceId, callback) => {
  const startOfToday = getStartOfToday();

  const q = query(
    collection(db, QUEUE_COLLECTION),
    where('serviceId', '==', serviceId),
    where('createdAt', '>=', startOfToday),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }));
      callback(entries, null);
    },
    (error) => {
      console.error('Queue subscription error:', error);
      callback([], error);
    }
  );
};

/**
 * Admin: Call next token — finds first WAITING, sets to SERVING.
 * Also sets any currently SERVING token to COMPLETED first.
 *
 * @param {string} serviceId
 * @returns {object|null} the called token entry
 */
export const callNextToken = async (serviceId) => {
  try {
    const startOfToday = getStartOfToday();

    return await runTransaction(db, async (transaction) => {
      // Find currently SERVING token and complete it
      const servingQuery = query(
        collection(db, QUEUE_COLLECTION),
        where('serviceId', '==', serviceId),
        where('status', '==', 'SERVING'),
        limit(1)
      );
      const servingSnap = await getDocs(servingQuery);
      if (!servingSnap.empty) {
        const servingDoc = servingSnap.docs[0];
        transaction.update(doc(db, QUEUE_COLLECTION, servingDoc.id), {
          status: 'COMPLETED',
        });
      }

      // Priority 1: Check for EMERGENCY tokens first
      const emergencyQuery = query(
        collection(db, QUEUE_COLLECTION),
        where('serviceId', '==', serviceId),
        where('status', '==', 'EMERGENCY'),
        where('createdAt', '>=', startOfToday),
        orderBy('createdAt', 'asc'),
        limit(1)
      );
      const emergencySnap = await getDocs(emergencyQuery);

      let nextDoc;
      if (!emergencySnap.empty) {
        nextDoc = emergencySnap.docs[0];
      } else {
        // Priority 2: Fall back to first WAITING token
        const waitingQuery = query(
          collection(db, QUEUE_COLLECTION),
          where('serviceId', '==', serviceId),
          where('status', '==', 'WAITING'),
          where('createdAt', '>=', startOfToday),
          orderBy('createdAt', 'asc'),
          limit(1)
        );
        const waitingSnap = await getDocs(waitingQuery);
        if (waitingSnap.empty) {
          return null; // no one waiting
        }
        nextDoc = waitingSnap.docs[0];
      }

      transaction.update(doc(db, QUEUE_COLLECTION, nextDoc.id), {
        status: 'SERVING',
      });

      return { id: nextDoc.id, ...nextDoc.data(), status: 'SERVING' };
    });
  } catch (error) {
    console.error('Call next token error:', error);
    throw new Error('Failed to call next token. Please try again.');
  }
};

/**
 * Admin: Update token status
 *
 * @param {string} queueId - document ID
 * @param {string} newStatus - CALLED, SERVING, COMPLETED, SKIPPED
 */
export const updateTokenStatus = async (queueId, newStatus) => {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  try {
    await updateDoc(doc(db, QUEUE_COLLECTION, queueId), {
      status: newStatus,
    });
  } catch (error) {
    console.error('Update token status error:', error);
    throw new Error('Failed to update token. Please try again.');
  }
};

/**
 * Admin: Skip a token
 */
export const skipToken = async (queueId) => {
  return updateTokenStatus(queueId, 'SKIPPED');
};

/**
 * Admin: Complete a token
 */
export const completeToken = async (queueId) => {
  return updateTokenStatus(queueId, 'COMPLETED');
};

/**
 * Get queue statistics for a service (snapshot, not real-time)
 *
 * @param {string} serviceId
 * @returns {object} { waiting, serving, completed, skipped, total, currentServing }
 */
export const getQueueStats = async (serviceId) => {
  try {
    const startOfToday = getStartOfToday();
    const q = query(
      collection(db, QUEUE_COLLECTION),
      where('serviceId', '==', serviceId),
      where('createdAt', '>=', startOfToday)
    );

    const snap = await getDocs(q);
    const entries = snap.docs.map((d) => d.data());

    const waiting = entries.filter((e) => e.status === 'WAITING').length;
    const serving = entries.find((e) => e.status === 'SERVING');
    const completed = entries.filter((e) => e.status === 'COMPLETED').length;
    const skipped = entries.filter((e) => e.status === 'SKIPPED').length;

    return {
      waiting,
      serving: serving ? serving.tokenNumber : null,
      completed,
      skipped,
      total: entries.length,
      currentServing: serving?.tokenNumber || 0,
    };
  } catch (error) {
    console.error('Get queue stats error:', error);
    return { waiting: 0, serving: null, completed: 0, skipped: 0, total: 0, currentServing: 0 };
  }
};

/**
 * Add an emergency token to the queue (hospital only).
 * Emergency tokens get priority 999 and appear at the top of the queue.
 *
 * @param {string} serviceId
 * @param {string} patientName
 * @returns {object} emergency queue entry
 */
export const addEmergencyToken = async (serviceId, patientName = 'Emergency') => {
  if (!serviceId) {
    throw new Error('Service ID is required.');
  }

  try {
    const queueRef = collection(db, QUEUE_COLLECTION);

    const newEntry = {
      serviceId,
      tokenNumber: 0,
      status: 'EMERGENCY',
      isEmergency: true,
      patientName: patientName || 'Emergency',
      priority: 999,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(queueRef, newEntry);

    return {
      id: docRef.id,
      ...newEntry,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Add emergency token error:', error);
    throw new Error('Failed to add emergency token. Please try again.');
  }
};

/**
 * User: Cancel a queue token (leave queue).
 * Only allowed when status is WAITING.
 *
 * @param {string} queueId - document ID
 * @returns {void}
 */
export const cancelToken = async (queueId) => {
  if (!queueId) {
    throw new Error('Queue ID is required.');
  }

  try {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, QUEUE_COLLECTION, queueId);
      const snap = await transaction.get(docRef);

      if (!snap.exists()) {
        throw new Error('Token not found.');
      }

      const currentStatus = snap.data().status;
      if (currentStatus !== 'WAITING') {
        throw new Error('Cannot cancel a token that is already being served.');
      }

      transaction.update(docRef, { status: 'CANCELLED' });
    });
  } catch (error) {
    if (error.message.includes('Cannot cancel') || error.message.includes('not found')) {
      throw error;
    }
    console.error('Cancel token error:', error);
    throw new Error('Failed to cancel token. Please try again.');
  }
};
