import { format } from 'date-fns';

/**
 * Check if a date string is valid
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Format a date string to a display format
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Use parseISO for consistent parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format a date for API submission (YYYY-MM-DD)
 */
export const formatDateForAPI = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
};

/**
 * Get the number of days remaining until a date
 */
export const getDaysRemaining = (endDate: string | null | undefined): number => {
  if (!endDate) return 0;
  
  try {
    const today = new Date();
    const expiryDate = new Date(endDate);
    
    if (isNaN(expiryDate.getTime())) {
      return 0;
    }
    
    // Reset times to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return 0;
  }
};

/**
 * Convert a snake_case renewal object to camelCase for React components
 * @param renewal Renewal object from API
 * @returns Renewal with camelCase properties
 */
export const snakeToCamelRenewal = (renewal: any) => {
  return {
    id: renewal.id,
    userId: renewal.user_id,
    serviceName: renewal.service_name || renewal.item_name,
    serviceType: renewal.service_type || renewal.category,
    provider: renewal.provider || renewal.vendor,
    itemName: renewal.item_name || renewal.service_name,
    category: renewal.category || renewal.service_type,
    vendor: renewal.vendor || renewal.provider,
    startDate: renewal.start_date,
    endDate: renewal.end_date,
    cost: renewal.cost,
    status: renewal.status,
    notes: renewal.notes,
    reminderDaysBefore: renewal.reminder_days_before || 7
  };
};

/**
 * Convert a camelCase renewal object to snake_case for API
 * @param renewal Renewal object from form
 * @returns Renewal with snake_case properties
 */
export const camelToSnakeRenewal = (renewal: any) => {
  return {
    id: renewal.id,
    user_id: renewal.userId || renewal.user_id || null,
    item_name: renewal.itemName || renewal.item_name || '',
    category: renewal.category || renewal.category || 'other',
    vendor: renewal.vendor || renewal.provider || '',
    start_date: formatDateForAPI(renewal.startDate || renewal.start_date),
    end_date: formatDateForAPI(renewal.endDate || renewal.end_date),
    cost: typeof renewal.cost === 'string' ? parseFloat(renewal.cost) || 0 : renewal.cost || 0,
    status: renewal.status || 'active',
    notes: renewal.notes || '',
    reminder_days_before: renewal.reminderDaysBefore || renewal.reminder_days_before || 7
  };
};