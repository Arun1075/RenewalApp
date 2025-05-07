// Mock renewal data for the renewal management system
export interface Renewal {
  id: string;
  userId: string;
  serviceName: string;
  serviceType: 'domain' | 'antivirus' | 'hosting' | 'software' | 'other';
  provider: string;
  startDate: string;
  endDate: string;
  cost: number;
  status: 'active' | 'expiring-soon' | 'expired';
  notes?: string;
  reminderType: 'email' | 'notification' | 'both' | 'none';
}

// Use let instead of const so we can update the array
export let mockRenewals: Renewal[] = [
  {
    id: '1',
    userId: '2', // Regular User
    serviceName: 'example.com',
    serviceType: 'domain',
    provider: 'GoDaddy',
    startDate: '2024-05-10',
    endDate: '2025-05-10',
    cost: 12.99,
    status: 'active',
    reminderType: 'email',
    notes: 'Primary website domain'
  },
  {
    id: '2',
    userId: '2', // Regular User
    serviceName: 'Norton 360',
    serviceType: 'antivirus',
    provider: 'Norton',
    startDate: '2024-02-15',
    endDate: '2025-02-15',
    cost: 89.99,
    status: 'active',
    reminderType: 'both',
  },
  {
    id: '3',
    userId: '2', // Regular User
    serviceName: 'MyApp Hosting',
    serviceType: 'hosting',
    provider: 'AWS',
    startDate: '2024-03-01',
    endDate: '2025-05-20',
    cost: 29.99,
    status: 'expiring-soon',
    reminderType: 'notification',
    notes: 'Company website hosting'
  },
  {
    id: '4',
    userId: '1', // Admin User
    serviceName: 'Office 365',
    serviceType: 'software',
    provider: 'Microsoft',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    cost: 99.99,
    status: 'active',
    reminderType: 'email',
  },
  {
    id: '5',
    userId: '1', // Admin User
    serviceName: 'company.org',
    serviceType: 'domain',
    provider: 'Namecheap',
    startDate: '2023-11-15',
    endDate: '2024-11-15',
    cost: 15.99,
    status: 'active',
    reminderType: 'both',
  },
  {
    id: '6',
    userId: '2', // Regular User
    serviceName: 'Adobe Creative Cloud',
    serviceType: 'software',
    provider: 'Adobe',
    startDate: '2024-06-01',
    endDate: '2024-04-30',
    cost: 52.99,
    status: 'expired',
    reminderType: 'notification',
    notes: 'Need to renew ASAP'
  }
];

// Helper function to get renewals by user ID
export const getRenewalsByUserId = (userId: string): Renewal[] => {
  return mockRenewals.filter(renewal => renewal.userId === userId);
};

// Helper function to get all renewals (for admin)
export const getAllRenewals = (): Renewal[] => {
  return mockRenewals;
};

// Helper function to calculate statistics
export const getRenewalStats = (renewals: Renewal[]) => {
  const active = renewals.filter(r => r.status === 'active').length;
  const expiringSoon = renewals.filter(r => r.status === 'expiring-soon').length;
  const expired = renewals.filter(r => r.status === 'expired').length;
  const totalCost = renewals.reduce((sum, r) => sum + r.cost, 0);
  
  return {
    active,
    expiringSoon,
    expired,
    total: renewals.length,
    totalCost
  };
};

// New functions for managing renewals

// Add a new renewal
export const addRenewal = (renewal: Omit<Renewal, 'id' | 'status'>): Renewal => {
  // Generate a new ID (in a real app, this would be done by the backend)
  const id = (mockRenewals.length + 1).toString();
  
  // Calculate status based on end date
  const endDate = new Date(renewal.endDate);
  const today = new Date();
  const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: Renewal['status'] = 'active';
  if (daysUntilExpiration <= 0) {
    status = 'expired';
  } else if (daysUntilExpiration <= 30) {
    status = 'expiring-soon';
  }
  
  const newRenewal: Renewal = {
    id,
    ...renewal,
    status
  };
  
  mockRenewals = [...mockRenewals, newRenewal];
  return newRenewal;
};

// Update an existing renewal
export const updateRenewal = (id: string, updates: Partial<Renewal>): Renewal | null => {
  const index = mockRenewals.findIndex(renewal => renewal.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedRenewal = {
    ...mockRenewals[index],
    ...updates
  };
  
  mockRenewals = [
    ...mockRenewals.slice(0, index),
    updatedRenewal,
    ...mockRenewals.slice(index + 1)
  ];
  
  return updatedRenewal;
};

// Delete a renewal
export const deleteRenewal = (id: string): boolean => {
  const initialLength = mockRenewals.length;
  mockRenewals = mockRenewals.filter(renewal => renewal.id !== id);
  return mockRenewals.length !== initialLength;
};

// Filter renewals with various criteria
export interface RenewalFilters {
  serviceType?: Renewal['serviceType'];
  status?: Renewal['status'];
  provider?: string;
  search?: string; // For searching service name or provider
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export const filterRenewals = (renewals: Renewal[], filters: RenewalFilters): Renewal[] => {
  return renewals.filter(renewal => {
    // Filter by service type
    if (filters.serviceType && renewal.serviceType !== filters.serviceType) {
      return false;
    }
    
    // Filter by status
    if (filters.status && renewal.status !== filters.status) {
      return false;
    }
    
    // Filter by provider
    if (filters.provider && !renewal.provider.toLowerCase().includes(filters.provider.toLowerCase())) {
      return false;
    }
    
    // Filter by search term (service name or provider)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !renewal.serviceName.toLowerCase().includes(searchTerm) &&
        !renewal.provider.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const renewalEndDate = new Date(renewal.endDate);
      
      if (filters.dateRange.start && renewalEndDate < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange.end && renewalEndDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
};