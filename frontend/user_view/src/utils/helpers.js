/**
 * Format minutes into human-readable wait time
 */
export const formatWaitTime = (minutes) => {
  if (minutes == null || isNaN(minutes) || minutes < 0) return 'N/A';
  if (minutes < 1) return 'No wait';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get crowd level color
 */
export const getCrowdColor = (level) => {
  const colors = {
    low: 'var(--crowd-low)',
    medium: 'var(--crowd-medium)',
    high: 'var(--crowd-high)',
  };
  return colors[level] || 'var(--text-muted)';
};

/**
 * Get crowd level label
 */
export const getCrowdLabel = (level) => {
  const labels = {
    low: 'Low Crowd',
    medium: 'Moderate',
    high: 'Crowded',
  };
  return labels[level] || 'Unknown';
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const timeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    confirmed: 'var(--status-success)',
    completed: 'var(--status-info)',
    cancelled: 'var(--status-error)',
    pending: 'var(--status-warning)',
  };
  return colors[status] || 'var(--text-muted)';
};

/**
 * Get category display name
 */
export const getCategoryDisplayName = (categoryId) => {
  const names = {
    hospital: 'Hospital',
    bank: 'Bank',
    government: 'Government',
    temple: 'Temple',
    'service-center': 'Service Center',
    education: 'Education',
  };
  return names[categoryId] || categoryId;
};

/**
 * Generate date options for the next N days
 */
export const getNextDays = (count = 7) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
    });
  }
  return days;
};
