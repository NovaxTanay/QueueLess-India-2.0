// ============================================
// QueueLess India 2.0 — useServices Hook (Real-Time)
// ============================================

import { useState, useEffect } from 'react';
import { subscribeToServices, getServices } from '../services/service.service';

/**
 * useServices — real-time service list from Firestore.
 *
 * @param {object} filters - { category, location, search }
 * @param {boolean} realtime - if true, use onSnapshot; false = one-time fetch
 * @returns {object} { services, loading, error }
 */
const useServices = (filters = {}, realtime = true) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    if (realtime) {
      // Real-time subscription
      const unsubscribe = subscribeToServices(
        (data, err) => {
          if (err) {
            setError('Failed to load services.');
            console.error(err);
          } else {
            // Apply client-side filters (location, search)
            let filtered = data;
            if (filters.location) {
              filtered = filtered.filter((s) =>
                s.location?.toLowerCase().includes(filters.location.toLowerCase())
              );
            }
            if (filters.search) {
              const q = filters.search.toLowerCase();
              filtered = filtered.filter(
                (s) =>
                  s.name?.toLowerCase().includes(q) ||
                  s.location?.toLowerCase().includes(q) ||
                  s.category?.toLowerCase().includes(q)
              );
            }
            setServices(filtered);
            setError(null);
          }
          setLoading(false);
        },
        { category: filters.category }
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      const fetchData = async () => {
        try {
          const data = await getServices(filters);
          setServices(data);
          setError(null);
        } catch (err) {
          setError(err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [filters.category, filters.location, filters.search, realtime]);

  return { services, loading, error };
};

export default useServices;
