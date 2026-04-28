// ============================================
// QueueLess India Admin — Utility Helpers
// ============================================

/**
 * Format a date or timestamp to a readable time string
 * @param {string|Date|object} date
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a date to readable date string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get today's date formatted
 * @returns {string}
 */
export const getTodayFormatted = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate wait duration in minutes between two times
 * @param {string} startTime - ISO string
 * @returns {string}
 */
export const getWaitDuration = (startTime) => {
  if (!startTime) return '—';
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '<1 min';
  if (diffMin < 60) return `${diffMin} min`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Get status display color class
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  const map = {
    WAITING: 'waiting',
    CALLED: 'called',
    SERVING: 'serving',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
    EMERGENCY: 'emergency',
    CANCELLED: 'cancelled',
  };
  return map[status] || 'completed';
};

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate a greeting based on time of day
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters.' };
  return { valid: true, message: '' };
};
