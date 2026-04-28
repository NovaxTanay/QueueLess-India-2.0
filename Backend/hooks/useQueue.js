// ============================================
// QueueLess India 2.0 — useQueue Hook (Real-Time)
// ============================================
// Replaces the old setInterval-based simulation with
// Firestore onSnapshot for real-time queue tracking.

import { useState, useEffect, useCallback } from 'react';
import { subscribeToQueue, joinQueue, getUserActiveToken, cancelToken } from '../services/queue.service';

/**
 * useQueue — real-time queue listener powered by Firestore onSnapshot.
 *
 * @param {string} serviceId - service to track
 * @param {string} userId - current user (optional, for position tracking)
 * @param {number} avgServiceTime - avg minutes per person (default 5)
 * @returns {object} live queue state
 */
const useQueue = (serviceId, userId = null, avgServiceTime = 5) => {
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToQueue(serviceId, (entries, err) => {
      if (err) {
        setError('Failed to connect to queue. Retrying...');
        console.error('Queue subscription error:', err);
      } else {
        setError(null);
        setQueueEntries(entries);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [serviceId]);

  // Computed values from live queue data
  const waitingEntries = queueEntries.filter((e) => e.status === 'WAITING');
  const servingEntry = queueEntries.find((e) => e.status === 'SERVING');
  const completedEntries = queueEntries.filter((e) => e.status === 'COMPLETED');
  const skippedEntries = queueEntries.filter((e) => e.status === 'SKIPPED');
  const emergencyEntries = queueEntries.filter(
    (e) => e.isEmergency === true && e.status === 'EMERGENCY'
  );

  // User's own token position
  const userEntry = userId
    ? queueEntries.find(
        (e) => e.userId === userId && ['WAITING', 'CALLED', 'SERVING'].includes(e.status)
      )
    : null;

  const userTokenNumber = userEntry?.tokenNumber || null;
  const userStatus = userEntry?.status || null;
  const isUserTurn = userEntry?.status === 'SERVING' || userEntry?.status === 'CALLED';

  // People ahead of user
  const peopleAhead = userEntry
    ? waitingEntries.filter((e) => e.tokenNumber < userEntry.tokenNumber).length
    : waitingEntries.length;

  // Estimated wait
  const estimatedWait = peopleAhead * avgServiceTime;

  // Current serving token number
  const currentServing = servingEntry?.tokenNumber || 0;

  // Progress percentage (for user)
  const progress = userTokenNumber
    ? Math.min(100, currentServing > 0 ? (currentServing / userTokenNumber) * 100 : 0)
    : 0;

  // Join queue function
  const handleJoinQueue = useCallback(async () => {
    if (!serviceId || !userId) {
      throw new Error('Must be logged in to join queue.');
    }
    return await joinQueue(serviceId, userId);
  }, [serviceId, userId]);

  // Check for existing token
  const checkExistingToken = useCallback(async () => {
    if (!serviceId || !userId) return null;
    return await getUserActiveToken(serviceId, userId);
  }, [serviceId, userId]);

  // Cancel queue (leave queue)
  const handleCancelQueue = useCallback(async () => {
    if (!userEntry?.id) {
      throw new Error('No active token to cancel.');
    }
    return await cancelToken(userEntry.id);
  }, [userEntry]);

  return {
    // Raw data
    queueEntries,
    waitingEntries,
    completedEntries,
    skippedEntries,

    // Live computed values
    currentServing,
    servingEntry,
    totalInQueue: queueEntries.length,
    waitingCount: waitingEntries.length,
    completedCount: completedEntries.length,
    emergencyCount: emergencyEntries.length,

    // User-specific
    userEntry,
    userTokenNumber,
    userStatus,
    isUserTurn,
    peopleAhead,
    estimatedWait,
    progress,

    // Actions
    joinQueue: handleJoinQueue,
    cancelQueue: handleCancelQueue,
    checkExistingToken,

    // State
    loading,
    error,
  };
};

export default useQueue;
