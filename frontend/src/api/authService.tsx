// Authentication service for handling user auth

import axios from 'axios';

// Use hardcoded value instead of process.env to avoid errors
const API_BASE_URL = 'https://api.oddgenius.com';

// Setup axios instance for auth API calls
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor with TypeScript fix
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fix for TypeScript error - ensure headers exists before accessing
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      // For development, just return true
      console.log('Dev mode: Auto-login success for', email);
      localStorage.setItem('token', 'dev-token');
      localStorage.setItem('user', JSON.stringify({ email, name: 'Dev User' }));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      // For development, just return true
      console.log('Dev mode: Auto-register success for', email);
      localStorage.setItem('token', 'dev-token');
      localStorage.setItem('user', JSON.stringify({ email, name }));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is logged in
  checkAuthStatus: async () => {
    try {
      // For development, always return true
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      // If verification fails, consider the user as not authenticated
      return false;
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    try {
      // For development, just return the input
      console.log('Dev mode: Profile update success', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
};

export default authService;