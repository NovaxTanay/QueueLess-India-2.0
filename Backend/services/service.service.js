// ============================================
// QueueLess India 2.0 — Service Management Service
// ============================================
// CRUD for services collection + real-time listeners

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const SERVICE_COLLECTION = 'services';

/**
 * Create a new service (admin onboarding)
 *
 * @param {object} data - { name, category, location, capacityPerHour, avgServiceTime }
 * @param {string} adminUid - UID of the admin creating the service
 * @returns {object} created service with ID
 */
export const createService = async (data, adminUid) => {
  const { name, category, location, capacityPerHour, avgServiceTime } = data;

  if (!name || !category || !location) {
    throw new Error('Name, category, and location are required.');
  }

  try {
    const serviceData = {
      name,
      category,
      location,
      capacityPerHour: capacityPerHour || 20,
      avgServiceTime: avgServiceTime || 5, // minutes per person
      adminUid,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, SERVICE_COLLECTION), serviceData);

    return {
      id: docRef.id,
      ...serviceData,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Create service error:', error);
    throw new Error('Failed to create service. Please try again.');
  }
};

/**
 * Get a single service by ID
 *
 * @param {string} serviceId
 * @returns {object|null} service data
 */
export const getServiceById = async (serviceId) => {
  try {
    const docSnap = await getDoc(doc(db, SERVICE_COLLECTION, serviceId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Get service error:', error);
    throw new Error('Failed to load service.');
  }
};

/**
 * Get services with optional filters (one-time fetch)
 *
 * @param {object} filters - { category, location, search }
 * @returns {Array} services
 */
export const getServices = async (filters = {}) => {
  try {
    let q;

    if (filters.category) {
      q = query(
        collection(db, SERVICE_COLLECTION),
        where('category', '==', filters.category),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, SERVICE_COLLECTION),
        orderBy('createdAt', 'desc')
      );
    }

    const snap = await getDocs(q);
    let results = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    // Client-side filtering for location and search (Firestore doesn't support text search)
    if (filters.location) {
      results = results.filter((s) =>
        s.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (error) {
    console.error('Get services error:', error);
    throw new Error('Failed to load services.');
  }
};

/**
 * Subscribe to real-time service list updates
 *
 * @param {function} callback - called with (services[], error)
 * @param {object} filters - optional { category }
 * @returns {function} unsubscribe
 */
export const subscribeToServices = (callback, filters = {}) => {
  let q;

  if (filters.category) {
    q = query(
      collection(db, SERVICE_COLLECTION),
      where('category', '==', filters.category),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, SERVICE_COLLECTION),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }));
      callback(services, null);
    },
    (error) => {
      console.error('Services subscription error:', error);
      callback([], error);
    }
  );
};

/**
 * Update a service (admin)
 *
 * @param {string} serviceId
 * @param {object} data - fields to update
 */
export const updateService = async (serviceId, data) => {
  try {
    await updateDoc(doc(db, SERVICE_COLLECTION, serviceId), data);
  } catch (error) {
    console.error('Update service error:', error);
    throw new Error('Failed to update service.');
  }
};

/**
 * Get ALL services by admin UID
 *
 * @param {string} adminUid
 * @returns {Array} services (empty array if none)
 */
export const getServicesByAdmin = async (adminUid) => {
  try {
    const q = query(
      collection(db, SERVICE_COLLECTION),
      where('adminUid', '==', adminUid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Get admin services error:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates for all services by admin UID
 *
 * @param {string} adminUid
 * @param {function} callback - called with (services[])
 * @returns {function} unsubscribe
 */
export const subscribeToAdminServices = (adminUid, callback) => {
  const q = query(
    collection(db, SERVICE_COLLECTION),
    where('adminUid', '==', adminUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const services = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || null,
      }));
      callback(services);
    },
    (error) => {
      console.error('Admin services subscription error:', error);
      callback([]);
    }
  );
};

/**
 * Delete a service by ID
 *
 * @param {string} serviceId
 */
export const deleteService = async (serviceId) => {
  try {
    await deleteDoc(doc(db, SERVICE_COLLECTION, serviceId));
  } catch (error) {
    console.error('Delete service error:', error);
    throw new Error('Failed to delete service.');
  }
};
