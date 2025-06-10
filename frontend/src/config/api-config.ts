/**
 * FootyStats API Configuration
 * 
 * This file contains configuration variables for the FootyStats API integration.
 * All legacy APIs (AllSports, API Football) have been removed.
 */

// FootyStats API Configuration - EXCLUSIVE API
export const FOOTYSTATS_API_KEY = process.env.REACT_APP_FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';

const API_CONFIG = {
  // FootyStats API key - The only API we use now
  FOOTYSTATS_API_KEY,
  
  // Base URL for FootyStats API
  BASE_URL: 'https://api.footystats.org/v2',
  
  // Backend API base URL (FootyStats endpoints)
  BACKEND_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Date format for API requests
  DATE_FORMAT: 'YYYY-MM-DD',
  
  // Last updated date (for tracking purposes)
  LAST_UPDATED: '2025-06-09',
};

// Export the configuration
export default API_CONFIG;
