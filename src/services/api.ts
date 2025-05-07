import axios from 'axios';

// Create a base Axios instance with the Laravel API URL
// Removing "/api" from the baseURL since we're including it in each endpoint
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 15000
});

// Add request interceptor to automatically add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding auth token to request:', config.url);
    } else {
      console.log('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        console.warn('Authentication token expired or invalid');
        localStorage.removeItem('token');
        // You can also redirect to login page here if needed
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', {
        request: error.request,
        url: error.config?.url
      });
      // This is likely a network issue or backend not running
      console.warn('Network error - is the backend server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const authService = {
  /**
   * Login user and store token
   * @param email User email
   * @param password User password
   * @returns Promise with user data
   */
  loginUser: async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/login', { email, password });
      console.log('Login response:', response.data);
      
      // Check for different response structures from Laravel
      let token, user;
      
      if (response.data.token && response.data.user) {
        // Standard response format
        token = response.data.token;
        user = response.data.user;
      } else if (response.data.access_token && response.data.user) {
        // Alternate Laravel response format
        token = response.data.access_token;
        user = response.data.user;
      } else if (response.data.data && response.data.data.token) {
        // Nested response format
        token = response.data.data.token;
        user = response.data.data.user;
      } else {
        console.error('Unexpected login response format:', response.data);
        throw new Error('Invalid response format from login API');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Login successful, token stored');
      return { user, token };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * Logout user and clear token
   */
  logoutUser: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Attempting logout');
        // Call logout endpoint if your API has one
        // Only make the API call if your backend has a logout endpoint
        try {
          await api.post('/logout');
          console.log('Logout API call successful');
        } catch (logoutError) {
          console.log('Logout endpoint not available or not configured - continuing with local logout');
          // This is not a critical error, as we'll still clear the local token
        }
      } catch (error) {
        console.error('Logout process error:', error);
      }
    }
    
    // Always clear local state even if API call fails
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token cleared from localStorage and API headers');
  },
  
  /**
   * Check if user is authenticated
   * @returns boolean indicating if user has valid token
   */
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem('token');
    console.log('Authentication check:', hasToken ? 'Token found' : 'No token found');
    return hasToken;
  },

  /**
   * Validate the current token
   * @returns Promise resolving to boolean indicating if token is valid
   */
  validateToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    try {
      // Set the auth header with current token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Make a request to validate the token
      // This could be a dedicated endpoint or just any authenticated endpoint
      const response = await api.get('/user/profile');
      return response.status === 200;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn('Token validation failed: Unauthorized');
        return false;
      }
      
      // For network errors or other issues, log but don't invalidate the token
      // This prevents logout on temporary network issues
      console.error('Token validation error:', error);
      // Return true to keep the user logged in if it's just a network issue
      return !error.response;
    }
  },
};

export default api;