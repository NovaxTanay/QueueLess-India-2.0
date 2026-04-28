import categoriesData from '../data/categories';
import servicesData from '../data/services';
import bookingsData from '../data/bookings';
import notificationsData from '../data/notifications';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Categories ───
export const getCategories = async () => {
  await delay(200);
  return [...categoriesData];
};

export const getCategoryById = async (categoryId) => {
  await delay(100);
  return categoriesData.find(c => c.id === categoryId) || null;
};

// ─── Services ───
export const getServices = async (filters = {}) => {
  await delay(400);
  let results = [...servicesData];

  if (filters.category) {
    results = results.filter(s => s.category === filters.category);
  }
  if (filters.location) {
    results = results.filter(s =>
      s.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  if (filters.crowdLevel) {
    results = results.filter(s => s.crowdLevel === filters.crowdLevel);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  return results;
};

export const getServiceById = async (serviceId) => {
  await delay(300);
  return servicesData.find(s => s.id === serviceId) || null;
};

export const getPopularServices = async () => {
  await delay(300);
  return [...servicesData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
};

export const getNearbyServices = async (location = 'Delhi') => {
  await delay(300);
  return servicesData
    .filter(s => s.location.toLowerCase() === location.toLowerCase())
    .slice(0, 6);
};

// ─── Bookings ───
let localBookings = [...bookingsData];

export const getBookings = async (userId = 'user-001') => {
  await delay(300);
  return localBookings.filter(b => b.userId === userId);
};

export const createBooking = async (bookingData) => {
  await delay(500);
  const service = servicesData.find(s => s.id === bookingData.serviceId);
  const newBooking = {
    id: `bk-${Date.now()}`,
    serviceId: bookingData.serviceId,
    serviceName: service?.name || 'Unknown Service',
    category: service?.category || 'unknown',
    userId: 'user-001',
    tokenNumber: `${service?.category?.[0]?.toUpperCase() || 'X'}-${String(Math.floor(Math.random() * 900) + 100)}`,
    timeSlot: bookingData.timeSlot,
    date: bookingData.date,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  localBookings = [newBooking, ...localBookings];
  return newBooking;
};

// ─── Queue ───
export const getQueueStatus = async (serviceId) => {
  await delay(200);
  const service = servicesData.find(s => s.id === serviceId);
  if (!service) return null;
  return {
    serviceId: service.id,
    serviceName: service.name,
    currentServing: service.currentServing,
    totalInQueue: service.totalInQueue,
    estimatedWait: service.waitTime,
    lastUpdated: new Date().toISOString(),
  };
};

// ─── Notifications ───
export const getNotifications = async (userId = 'user-001') => {
  await delay(200);
  return [...notificationsData];
};

export const markNotificationRead = async (notifId) => {
  await delay(100);
  return { success: true };
};

// ─── Auth (Mock) ───
export const loginUser = async (email, password) => {
  await delay(600);
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  return {
    id: 'user-001',
    name: 'Tanay Sharma',
    email: email,
    phone: '+91 98765 43210',
    avatar: null,
    joinedDate: '2026-01-15',
  };
};

export const signupUser = async (name, email, password) => {
  await delay(800);
  if (!name || !email || !password) {
    throw new Error('All fields are required');
  }
  return {
    id: 'user-001',
    name: name,
    email: email,
    phone: '',
    avatar: null,
    joinedDate: new Date().toISOString().split('T')[0],
  };
};
