const footyStatsApiService = require('./footyStatsApiService');
const logger = require('../utils/logger');

/**
 * MappingNew Service - Provides league data and mapping functionality
 * This service interfaces with FootyStats API to provide league information
 */
class MappingNew {
  
  /**
   * Initialize the mapping service
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      logger.info('Initializing MappingNew service with FootyStats API...');
      
      // Test FootyStats API connectivity
      await footyStatsApiService.makeApiRequest('/test-call', {}, 0);
      
      logger.info('MappingNew service initialized successfully');
    } catch (error) {
      logger.warn('MappingNew service initialization failed, continuing with fallback data', {
        error: error.message
      });
    }
  }
  
  /**
   * Get all available leagues from FootyStats API
   * @returns {Promise<Array>} Array of league objects
   */
  static async getLeagues() {
    try {
      logger.info('Fetching leagues from FootyStats API...');
        // Use FootyStats API to get leagues
      const leagues = await footyStatsApiService.getLeagueList();
      
      if (!leagues || !Array.isArray(leagues)) {
        logger.warn('No leagues data received from FootyStats API');
        return [];
      }
      
      // Transform FootyStats league data to our format
      const transformedLeagues = leagues.map(league => ({
        id: league.id,
        name: league.name,
        country: league.country,
        season: league.season,
        logo: league.logo || null,
        type: league.type || 'domestic',
        active: league.active !== false
      }));
      
      logger.info(`Successfully fetched ${transformedLeagues.length} leagues`);
      return transformedLeagues;
      
    } catch (error) {
      logger.error('Error fetching leagues from MappingNew service:', error.message);
      
      // Return default leagues if API fails
      return this.getDefaultLeagues();
    }
  }
  
  /**
   * Get default leagues as fallback
   * @returns {Array} Array of default league objects
   */
  static getDefaultLeagues() {
    return [
      {
        id: 39,
        name: 'Premier League',
        country: 'England',
        season: 2024,
        logo: null,
        type: 'domestic',
        active: true
      },
      {
        id: 140,
        name: 'La Liga',
        country: 'Spain',
        season: 2024,
        logo: null,
        type: 'domestic',
        active: true
      },
      {
        id: 78,
        name: 'Bundesliga',
        country: 'Germany',
        season: 2024,
        logo: null,
        type: 'domestic',
        active: true
      },
      {
        id: 135,
        name: 'Serie A',
        country: 'Italy',
        season: 2024,
        logo: null,
        type: 'domestic',
        active: true
      },
      {
        id: 61,
        name: 'Ligue 1',
        country: 'France',
        season: 2024,
        logo: null,
        type: 'domestic',
        active: true
      }
    ];
  }
  
  /**
   * Get league by ID
   * @param {number|string} leagueId - The league ID
   * @returns {Promise<Object|null>} League object or null if not found
   */
  static async getLeagueById(leagueId) {
    try {
      const leagues = await this.getLeagues();
      return leagues.find(league => league.id == leagueId) || null;
    } catch (error) {
      logger.error(`Error fetching league ${leagueId}:`, error.message);
      return null;
    }
  }
}

module.exports = MappingNew;
