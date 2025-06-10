/**
 * Application constants - FootyStats API Only
 */
require('dotenv').config();

module.exports = {
  // FootyStats API configuration - The ONLY external API we use
  FOOTYSTATS_API_KEY: process.env.FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756',
  FOOTYSTATS_BASE_URL: 'https://api.football-data-api.com',
  
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
    // Cache configuration
  CACHE_DURATION: {
    SHORT: 60 * 15, // 15 minutes (for frequently changing data, increased for better performance)
    MEDIUM: 60 * 120, // 2 hours (for semi-static data, increased for better performance)
    LONG: 60 * 60 * 48, // 48 hours (for static data like countries, increased for better performance)
  },
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Endpoints
  ENDPOINTS: {
    COUNTRIES: 'Countries',
    LEAGUES: 'Leagues',
    FIXTURES: 'Fixtures',
    LIVESCORE: 'Livescore',
    H2H: 'H2H',
    STANDINGS: 'Standings',
    ODDS: 'Odds',
    PROBABILITIES: 'Probabilities',
  },
};