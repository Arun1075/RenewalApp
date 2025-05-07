import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string, isAdminMode: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing token and validate it on initial load
  useEffect(() => {
    const validateAuth = async () => {
      setIsLoading(true);
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          // No token found, clear any stale user data
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          return;
        }
        
        // Validate token by making a request to user profile or validate endpoint
        const isValid = await authService.validateToken();
        if (isValid) {
          // Token is valid, load user from localStorage
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
        } else {
          // Token is invalid, clear auth data
          setCurrentUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error validating authentication:', error);
        // On error, assume token is invalid
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };
    
    validateAuth();
  }, []);

  const login = async (email: string, password: string, isAdminMode: boolean) => {
    try {
      setIsLoading(true);
      // Call the API login service
      const { user, token } = await authService.loginUser(email, password);
      
      // Verify user role if in admin mode
      if (isAdminMode && user.role !== 'admin') {
        // Clear any token that might have been set
        await authService.logoutUser();
        
        return { 
          success: false, 
          message: 'You do not have admin privileges' 
        };
      }

      // Store user in state and localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return { 
        success: true, 
        message: `Welcome, ${user.name}!` 
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Invalid email or password'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Call the API logout function
      await authService.logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state even if API call fails
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};