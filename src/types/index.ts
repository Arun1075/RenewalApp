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
  service_name: string;
  service_type: 'domain' | 'antivirus' | 'hosting' | 'software' | 'other';
  provider: string;
  start_date: string;
  end_date: string;
  cost: number;
  status: 'active' | 'expiring-soon' | 'expired';
  notes?: string;
  reminder_type: 'email' | 'notification' | 'both' | 'none';
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
  service_type?: Renewal['service_type'];
  status?: Renewal['status'];
  provider?: string;
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}