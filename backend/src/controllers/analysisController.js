// REMOVED: Legacy API services - Use FootyStats API only
// const allSportsApiService = require('../services/allSportsApiService');
// const enhancedMatchAnalysis = require('../services/enhanced-match-analysis');
const logger = require('../utils/logger');

const analysisController = {
  // Get comprehensive match analysis - DEPRECATED: Use FootyStats API endpoints instead
  getMatchAnalysis: async (req, res) => {
    try {
      const matchId = req.params.id;
      logger.warn(`Legacy analysis endpoint called for match ${matchId} - redirecting to FootyStats API`, { controller: 'analysis' });

      return res.status(410).json({
        success: false,
        error: 'Legacy endpoint deprecated',
        message: 'This endpoint has been deprecated. Use FootyStats API endpoints instead.',
        alternatives: {
          match_details: `/api/footystats/match/${matchId}`,
          team_stats: `/api/footystats/team/{teamId}?include_stats=true`,
          h2h_data: 'Available in FootyStats match endpoint'
        }
      });
    } catch (error) {
      logger.error('Error in deprecated analysis endpoint', { error: error.message, controller: 'analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to process request',
        message: error.message
      });
    }
  },

  // Get head-to-head analysis - DEPRECATED: Use FootyStats API endpoints instead
  getHeadToHead: async (req, res) => {
    try {
      const matchId = req.params.matchId;
      logger.warn(`Legacy H2H endpoint called for match ${matchId} - redirecting to FootyStats API`, { controller: 'analysis' });

      return res.status(410).json({
        success: false,
        error: 'Legacy endpoint deprecated',
        message: 'This endpoint has been deprecated. Use FootyStats API endpoints instead.',
        alternatives: {
          match_details: `/api/footystats/match/${matchId}`,
          team_lastx: `/api/footystats/team/{teamId}/lastx?gameCount=10`
        }
      });
    } catch (error) {
      logger.error('Error in deprecated H2H endpoint', { error: error.message, controller: 'analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to process request',
        message: error.message
      });
    }
  },

  // Get team form analysis - DEPRECATED: Use FootyStats API endpoints instead
  getTeamForm: async (req, res) => {
    try {
      const teamId = req.params.teamId;
      logger.warn(`Legacy team form endpoint called for team ${teamId} - redirecting to FootyStats API`, { controller: 'analysis' });

      return res.status(410).json({
        success: false,
        error: 'Legacy endpoint deprecated',
        message: 'This endpoint has been deprecated. Use FootyStats API endpoints instead.',
        alternatives: {
          team_stats: `/api/footystats/team/${teamId}?include_stats=true`,
          team_lastx: `/api/footystats/team/${teamId}/lastx?gameCount=10`
        }
      });
    } catch (error) {
      logger.error('Error in deprecated team form endpoint', { error: error.message, controller: 'analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to process request',
        message: error.message
      });
    }
  },



  // Get card analysis - DEPRECATED: Use FootyStats API endpoints instead
  getCardAnalysis: async (req, res) => {
    try {
      const matchId = req.params.matchId;
      logger.warn(`Legacy card analysis endpoint called for match ${matchId} - redirecting to FootyStats API`, { controller: 'analysis' });

      return res.status(410).json({
        success: false,
        error: 'Legacy endpoint deprecated',
        message: 'This endpoint has been deprecated. Use FootyStats API endpoints instead.',
        alternatives: {
          team_card_stats: `/api/footystats/team/{teamId}/cards?gameCount=10`,
          match_details: `/api/footystats/match/${matchId}`
        }
      });
    } catch (error) {
      logger.error('Error in deprecated card analysis endpoint', { error: error.message, controller: 'analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to process request',
        message: error.message
      });
    }
  },

  // Get corner analysis - DEPRECATED: Use FootyStats API endpoints instead
  getCornerAnalysis: async (req, res) => {
    try {
      const matchId = req.params.matchId;
      logger.warn(`Legacy corner analysis endpoint called for match ${matchId} - redirecting to FootyStats API`, { controller: 'analysis' });

      return res.status(410).json({
        success: false,
        error: 'Legacy endpoint deprecated',
        message: 'This endpoint has been deprecated. Use FootyStats API endpoints instead.',
        alternatives: {
          team_corner_stats: `/api/footystats/team/{teamId}/corners?gameCount=10`,
          match_details: `/api/footystats/match/${matchId}`
        }
      });
    } catch (error) {
      logger.error('Error in deprecated corner analysis endpoint', { error: error.message, controller: 'analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to process request',
        message: error.message
      });
    }
  }
};

module.exports = analysisController;
