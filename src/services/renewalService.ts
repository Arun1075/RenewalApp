import api from './api';
import type { Renewal, ApiResponse, RenewalStats } from '../types';
import { camelToSnakeRenewal } from '../utils/dateUtils';

// Helper function to normalize API responses from different Laravel response formats
const normalizeResponse = <T>(response: any): ApiResponse<T> => {
  // Case 1: Our expected format - { data: any, success: boolean, message?: string }
  if (typeof response.success === 'boolean') {
    return response as ApiResponse<T>;
  }
  
  // Case 2: Laravel API Resource - { data: any }
  if (response.data) {
    return {
      data: response.data,
      success: true
    };
  }
  
  // Case 3: Direct data response
  return {
    data: response as T,
    success: true
  };
};

// Renewals service with CRUD operations
const renewalService = {
  /**
   * Get all renewals
   * @returns Promise with array of renewals
   */
  getRenewals: async (): Promise<ApiResponse<Renewal[]>> => {
    try {
      console.log('Fetching all renewals');
      const response = await api.get('/renewals');
      console.log('Renewals fetch response:', response.data);
      return normalizeResponse<Renewal[]>(response.data);
    } catch (error) {
      console.error('Error fetching renewals:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to fetch renewals'
      };
    }
  },

  /**
   * Get renewals for the current user
   * @returns Promise with array of renewals
   */
  getUserRenewals: async (): Promise<ApiResponse<Renewal[]>> => {
    try {
      console.log('Fetching user renewals');
      const response = await api.get('/renewals/user');
      console.log('User renewals fetch response:', response.data);
      return normalizeResponse<Renewal[]>(response.data);
    } catch (error) {
      console.error('Error fetching user renewals:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to fetch your renewals'
      };
    }
  },

  /**
   * Get a single renewal by ID
   * @param id Renewal ID
   * @returns Promise with renewal data
   */
  getRenewal: async (id: string): Promise<ApiResponse<Renewal>> => {
    try {
      console.log(`Fetching renewal with ID: ${id}`);
      const response = await api.get(`/renewals/${id}`);
      console.log(`Renewal ${id} fetch response:`, response.data);
      return normalizeResponse<Renewal>(response.data);
    } catch (error) {
      console.error(`Error fetching renewal with ID ${id}:`, error);
      return {
        data: {} as Renewal,
        success: false,
        message: `Failed to fetch renewal with ID ${id}`
      };
    }
  },

  /**
   * Create a new renewal
   * @param data Renewal data in camelCase format
   * @returns Promise with created renewal
   */
  createRenewal: async (data: any): Promise<ApiResponse<Renewal>> => {
    try {
      console.log('Creating new renewal with data:', data);
      
      // Convert from camelCase to snake_case for API
      const apiData = camelToSnakeRenewal(data);
      console.log('Converted data for API:', apiData);
      
      const response = await api.post('/renewals', apiData);
      console.log('Renewal creation response:', response.data);
      return normalizeResponse<Renewal>(response.data);
    } catch (error) {
      console.error('Error creating renewal:', error);
      return {
        data: {} as Renewal,
        success: false,
        message: 'Failed to create renewal'
      };
    }
  },

  /**
   * Update an existing renewal
   * @param id Renewal ID
   * @param data Updated renewal data in camelCase or snake_case format
   * @returns Promise with updated renewal
   */
  updateRenewal: async (id: string, data: any): Promise<ApiResponse<Renewal>> => {
    try {
      console.log(`Updating renewal ${id} with data:`, data);
      
      // Convert from camelCase to snake_case for API
      const apiData = camelToSnakeRenewal(data);
      console.log('Converted data for API:', apiData);
      
      try {
        const response = await api.put(`/renewals/${id}`, apiData);
        console.log(`Renewal ${id} update response:`, response.data);
        return normalizeResponse<Renewal>(response.data);
      } catch (putError) {
        console.log('PUT failed, trying PATCH instead');
        const response = await api.patch(`/renewals/${id}`, apiData);
        console.log(`Renewal ${id} update response (PATCH):`, response.data);
        return normalizeResponse<Renewal>(response.data);
      }
    } catch (error) {
      console.error(`Error updating renewal with ID ${id}:`, error);
      return {
        data: {} as Renewal,
        success: false,
        message: `Failed to update renewal with ID ${id}`
      };
    }
  },

  /**
   * Delete a renewal
   * @param id Renewal ID
   * @returns Promise with success message
   */
  deleteRenewal: async (id: string): Promise<ApiResponse<null>> => {
    try {
      console.log(`Deleting renewal with ID: ${id}`);
      const response = await api.delete(`/renewals/${id}`);
      console.log(`Renewal ${id} deletion response:`, response.data);
      return normalizeResponse<null>(response.data);
    } catch (error) {
      console.error(`Error deleting renewal with ID ${id}:`, error);
      return {
        data: null,
        success: false,
        message: `Failed to delete renewal with ID ${id}`
      };
    }
  },

  /**
   * Get renewals by status
   * @param status Renewal status to filter by
   * @returns Promise with filtered renewals
   */
  getRenewalsByStatus: async (status: string): Promise<ApiResponse<Renewal[]>> => {
    try {
      console.log(`Fetching renewals with status: ${status}`);
      const response = await api.get(`/renewals/status/${status}`);
      console.log(`Renewals with status ${status} response:`, response.data);
      return normalizeResponse<Renewal[]>(response.data);
    } catch (error) {
      console.error(`Error fetching renewals with status ${status}:`, error);
      return {
        data: [],
        success: false,
        message: `Failed to fetch renewals with status ${status}`
      };
    }
  },

  /**
   * Get renewal statistics 
   * @returns Promise with renewal statistics
   */
  getRenewalStats: async (): Promise<ApiResponse<RenewalStats>> => {
    try {
      console.log('Fetching renewal statistics');
      const response = await api.get('/renewals/statistics');
      console.log('Renewal statistics response:', response.data);
      return normalizeResponse<RenewalStats>(response.data);
    } catch (error) {
      console.error('Error fetching renewal statistics:', error);
      return {
        data: {
          active: 0,
          expiringSoon: 0,
          expired: 0,
          total: 0,
          totalCost: 0
        },
        success: false,
        message: 'Failed to fetch renewal statistics'
      };
    }
  },

  /**
   * Calculate statistics from a list of renewals (local calculation)
   * @param renewals List of renewals to calculate stats from
   * @returns Renewal statistics object
   */
  calculateRenewalStats: (renewals: Renewal[]): RenewalStats => {
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
  }
};

export default renewalService;