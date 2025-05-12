// Define main application types

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// Renewal interface
export interface Renewal {
  id: string;
  user_id: string;
  item_name: string;
  category: 'domain' | 'antivirus' | 'hosting' | 'software' | 'other';
  vendor: string;
  start_date: string;
  end_date: string;
  cost: number;
  status: 'active' | 'expiring-soon' | 'expired';
  notes?: string;
  reminder_days_before: number;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Renewal statistics
export interface RenewalStats {
  active: number;
  expiringSoon: number;
  expired: number;
  total: number;
  totalCost: number;
}

// Renewal filters
export interface RenewalFilters {
  category?: Renewal['category'];
  status?: Renewal['status'];
  vendor?: string;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

// Renewal Log interface
export interface RenewalLog {
  id: string;
  renewal_id: string;
  service_name?: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'renewed';
  performed_by: string;
  user_email?: string;
  timestamp: string;
  changes?: {
    field: string;
    old_value?: string | number;
    new_value?: string | number;
  }[];
  notes?: string;
}