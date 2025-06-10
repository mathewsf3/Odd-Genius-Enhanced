const logger = require('../../utils/logger');
const { getMatchStats } = require('../../services/analysis/matchStats');
const { getHeadToHead } = require('../../services/analysis/headToHead');
const { getTeamForm } = require('../../services/analysis/teamForm');

const matchAnalysisController = {
  // Get match statistics and details
  getMatchStats: async (req, res) => {
    try {
      const { matchId } = req.params;
      logger.info(`Getting match stats for match ${matchId}`, { controller: 'match-analysis' });
      
      const matchStats = await getMatchStats(matchId);
      
      return res.json({
        success: true,
        result: matchStats
      });
    } catch (error) {
      logger.error(`Error getting match stats: ${error.message}`, { controller: 'match-analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch match statistics',
        message: error.message
      });
    }
  },

  // Get head-to-head analysis
  getHeadToHead: async (req, res) => {
    try {
      const { matchId } = req.params;
      logger.info(`Getting H2H analysis for match ${matchId}`, { controller: 'match-analysis' });
      
      // First get match details to get team IDs
      const matchDetails = await getMatchStats(matchId);
      if (!matchDetails) {
        return res.status(404).json({
          success: false,
          error: 'Match not found'
        });
      }

      // Get H2H data using team IDs
      const h2hData = await getHeadToHead(
        matchDetails.homeTeam.id,
        matchDetails.awayTeam.id
      );
      
      return res.json({
        success: true,
        result: h2hData
      });
    } catch (error) {
      logger.error(`Error getting H2H analysis: ${error.message}`, { controller: 'match-analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch head-to-head analysis',
        message: error.message
      });
    }
  },

  // Get team form analysis
  getTeamForm: async (req, res) => {
    try {
      const { matchId } = req.params;
      const { team } = req.query; // 'home' or 'away'
      logger.info(`Getting team form analysis for ${team} team in match ${matchId}`, { controller: 'match-analysis' });
      
      // First get match details to get team ID
      const matchDetails = await getMatchStats(matchId);
      if (!matchDetails) {
        return res.status(404).json({
          success: false,
          error: 'Match not found'
        });
      }

      // Get the appropriate team ID
      const teamId = team === 'away' ? matchDetails.awayTeam.id : matchDetails.homeTeam.id;

      // Get form analysis
      const formData = await getTeamForm(teamId, 15); // Get last 15 matches for better trend analysis
      
      return res.json({
        success: true,
        result: {
          team: team === 'away' ? matchDetails.awayTeam : matchDetails.homeTeam,
          form: formData
        }
      });
    } catch (error) {
      logger.error(`Error getting team form analysis: ${error.message}`, { controller: 'match-analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch team form analysis',
        message: error.message
      });
    }
  },

  // Get live match updates
  getLiveMatchUpdates: async (req, res) => {
    try {
      const { matchId } = req.params;
      logger.info(`Getting live match updates for match ${matchId}`, { controller: 'match-analysis' });
      
      const liveUpdates = await require('../../services/analysis/liveUpdates').getLiveMatchData(matchId);
      
      return res.json({
        success: true,
        result: liveUpdates
      });
    } catch (error) {
      logger.error(`Error getting live match updates: ${error.message}`, { controller: 'match-analysis' });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch live match updates',
        message: error.message
      });
    }
  }
};

module.exports = matchAnalysisController;
