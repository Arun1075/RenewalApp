// Runtime values that can be imported directly in components

// Default renewal stats object for initialization
export const defaultRenewalStats = {
  active: 0,
  expiringSoon: 0,
  expired: 0,
  total: 0,
  totalCost: 0
};

// Service type options
export const serviceTypeOptions = [
  { value: 'domain', label: 'Domain' },
  { value: 'antivirus', label: 'Antivirus' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'software', label: 'Software' },
  { value: 'other', label: 'Other' }
];

// Status options
export const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expiring-soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' }
];

// Reminder type options
export const reminderTypeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'notification', label: 'Notification' },
  { value: 'both', label: 'Email & Notification' },
  { value: 'none', label: 'None' }
];