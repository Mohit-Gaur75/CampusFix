export const STATUS_COLORS = {
  REPORTED: 'bg-slate-100 text-slate-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-rose-100 text-rose-700'
};

export const PRIORITY_COLORS = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-sky-100 text-sky-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700'
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) {
    const hours = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60));
    if (hours === 0) return 'Just now';
    return rtf.format(hours, 'hour');
  }
  
  return rtf.format(daysDifference, 'day');
};

export const ALLOWED_TRANSITIONS = {
  REPORTED: ['ASSIGNED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  REJECTED: []
};
