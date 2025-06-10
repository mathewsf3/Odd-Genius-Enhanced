const logger = require('../utils/logger');

// Simple leagues controller with basic data
const leaguesController = {
  // Get all leagues
  getAllLeagues: async (req, res) => {
    try {
      logger.info('Handling request for all leagues', { controller: 'leagues' });

      // Return some basic leagues data for now
      const leagues = [
        {
          id: 1,
          name: 'Premier League',
          country: 'England',
          logo: null,
          season: 2024,
          api: 'basic'
        },
        {
          id: 2,
          name: 'La Liga',
          country: 'Spain',
          logo: null,
          season: 2024,
          api: 'basic'
        },
        {
          id: 3,
          name: 'Serie A',
          country: 'Italy',
          logo: null,
          season: 2024,
          api: 'basic'
        },
        {
          id: 4,
          name: 'Bundesliga',
          country: 'Germany',
          logo: null,
          season: 2024,
          api: 'basic'
        },
        {
          id: 5,
          name: 'Ligue 1',
          country: 'France',
          logo: null,
          season: 2024,
          api: 'basic'
        }
      ];

      logger.info(`Returning ${leagues.length} leagues`, { controller: 'leagues' });

      return res.json({
        success: true,
        result: leagues
      });

    } catch (error) {
      logger.error(`Error getting all leagues: ${error.message}`, { controller: 'leagues' });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch leagues',
        message: error.message
      });
    }
  }
};

module.exports = leaguesController;
