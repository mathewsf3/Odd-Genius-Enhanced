/**
 * FootyStats API Routes
 * Handles all FootyStats API endpoints
 */

const express = require('express');
const router = express.Router();
const footyStatsApiService = require('../services/footyStatsApiService');
const logger = require('../utils/logger');

/**
 * GET /api/footystats/match/:matchId
 * Get comprehensive match details from FootyStats API
 */
router.get('/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    
    logger.info(`Fetching FootyStats match details for ${matchId}`, { 
      route: 'footystats-match',
      matchId 
    });

    const matchData = await footyStatsApiService.getMatchDetails(matchId);
    
    if (!matchData) {
      return res.status(404).json({
        success: false,
        error: 'Match not found',
        message: `No match data found for ID: ${matchId}`
      });
    }

    res.json({
      success: true,
      data: matchData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats match ${req.params.matchId}:`, {
      route: 'footystats-match',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch match data from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/today
 * Get today's matches from FootyStats API
 */
router.get('/today', async (req, res) => {
  try {
    logger.info('Fetching today\'s matches from FootyStats', { 
      route: 'footystats-today' 
    });

    const matches = await footyStatsApiService.getTodayMatches();
    
    res.json({
      success: true,
      data: matches,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching FootyStats today matches:', {
      route: 'footystats-today',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch today\'s matches from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/btts-stats
 * Get BTTS statistics from FootyStats API
 */
router.get('/btts-stats', async (req, res) => {
  try {
    logger.info('Fetching BTTS stats from FootyStats', { 
      route: 'footystats-btts' 
    });

    const stats = await footyStatsApiService.getBTTSStats();
    
    res.json({
      success: true,
      data: stats,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching FootyStats BTTS stats:', {
      route: 'footystats-btts',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch BTTS stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/over25-stats
 * Get Over 2.5 statistics from FootyStats API
 */
router.get('/over25-stats', async (req, res) => {
  try {
    logger.info('Fetching Over 2.5 stats from FootyStats', { 
      route: 'footystats-over25' 
    });

    const stats = await footyStatsApiService.getOver25Stats();
    
    res.json({
      success: true,
      data: stats,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching FootyStats Over 2.5 stats:', {
      route: 'footystats-over25',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch Over 2.5 stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/leagues
 * Get league list from FootyStats API
 */
router.get('/leagues', async (req, res) => {
  try {
    logger.info('Fetching league list from FootyStats', {
      route: 'footystats-leagues'
    });

    const leagues = await footyStatsApiService.getLeagueList();

    res.json({
      success: true,
      data: leagues,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching FootyStats leagues:', {
      route: 'footystats-leagues',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch leagues from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/team/:teamId
 * Get comprehensive team statistics
 */
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { include_stats = 'true' } = req.query;

    logger.info(`Fetching FootyStats team stats for ${teamId}`, {
      route: 'footystats-team',
      teamId,
      include_stats
    });

    const teamData = await footyStatsApiService.getTeamStats(teamId, include_stats === 'true');

    res.json({
      success: true,
      data: teamData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats team ${req.params.teamId}:`, {
      route: 'footystats-team',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team data from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/team/:teamId/lastx
 * Get team's last X matches statistics
 */
router.get('/team/:teamId/lastx', async (req, res) => {
  try {
    const { teamId } = req.params;

    logger.info(`Fetching FootyStats team lastx stats for ${teamId}`, {
      route: 'footystats-team-lastx',
      teamId
    });

    const teamData = await footyStatsApiService.getTeamLastXStats(teamId);

    res.json({
      success: true,
      data: teamData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats team lastx ${req.params.teamId}:`, {
      route: 'footystats-team-lastx',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team lastx data from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/league/:seasonId/players
 * Get league players with statistics
 */
router.get('/league/:seasonId/players', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { page = 1 } = req.query;

    logger.info(`Fetching FootyStats league players for season ${seasonId}`, {
      route: 'footystats-league-players',
      seasonId,
      page
    });

    const playersData = await footyStatsApiService.getLeaguePlayers(seasonId, parseInt(page));

    res.json({
      success: true,
      data: playersData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats league players ${req.params.seasonId}:`, {
      route: 'footystats-league-players',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch league players from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/player/:playerId
 * Get individual player statistics
 */
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    logger.info(`Fetching FootyStats player stats for ${playerId}`, {
      route: 'footystats-player',
      playerId
    });

    const playerData = await footyStatsApiService.getPlayerStats(playerId);

    res.json({
      success: true,
      data: playerData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats player ${req.params.playerId}:`, {
      route: 'footystats-player',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch player data from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/health
 * Health check endpoint for FootyStats API
 */
router.get('/health', async (req, res) => {
  try {
    // Test API connectivity using the test-call endpoint
    const testResponse = await footyStatsApiService.makeApiRequest('/test-call', {}, 0);

    res.json({
      success: true,
      status: 'healthy',
      api: 'footystats',
      timestamp: new Date().toISOString(),
      test: testResponse ? 'passed' : 'failed',
      response: testResponse
    });

  } catch (error) {
    logger.error('FootyStats API health check failed:', {
      route: 'footystats-health',
      error: error.message
    });

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      api: 'footystats',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/footystats/league-seasons
 * Get league list with season IDs from FootyStats API
 */
router.get('/league-seasons', async (req, res) => {
  try {
    logger.info('Fetching FootyStats league seasons', {
      route: 'footystats-league-seasons'
    });

    const seasonsData = await footyStatsApiService.getLeagueSeasons();

    res.json({
      success: true,
      data: seasonsData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching FootyStats league seasons:', {
      route: 'footystats-league-seasons',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch league seasons from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/league/:seasonId/standings
 * Get league standings from FootyStats API using season ID
 */
router.get('/league/:seasonId/standings', async (req, res) => {
  try {
    const { seasonId } = req.params;

    logger.info(`Fetching FootyStats league standings for season ${seasonId}`, {
      route: 'footystats-league-standings',
      seasonId
    });

    const standingsData = await footyStatsApiService.getLeagueStandings(seasonId);

    res.json({
      success: true,
      data: standingsData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats league standings ${req.params.seasonId}:`, {
      route: 'footystats-league-standings',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch league standings from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/league/:seasonId/referees
 * Get league referees from FootyStats API
 */
router.get('/league/:seasonId/referees', async (req, res) => {
  try {
    const { seasonId } = req.params;

    logger.info(`Fetching FootyStats league referees for season ${seasonId}`, {
      route: 'footystats-league-referees',
      seasonId
    });

    const refereesData = await footyStatsApiService.getLeagueReferees(seasonId);

    res.json({
      success: true,
      data: refereesData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats league referees ${req.params.seasonId}:`, {
      route: 'footystats-league-referees',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch league referees from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/team/:teamId/corners
 * Get detailed team corner statistics
 */
router.get('/team/:teamId/corners', async (req, res) => {
  try {
    const { teamId } = req.params;

    logger.info(`Fetching FootyStats team corner stats for ${teamId}`, {
      route: 'footystats-team-corners',
      teamId
    });

    const cornerData = await footyStatsApiService.getTeamCornerStats(teamId);

    res.json({
      success: true,
      data: cornerData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats team corner stats ${req.params.teamId}:`, {
      route: 'footystats-team-corners',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team corner stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/team/:teamId/cards
 * Get detailed team card statistics
 */
router.get('/team/:teamId/cards', async (req, res) => {
  try {
    const { teamId } = req.params;

    logger.info(`Fetching FootyStats team card stats for ${teamId}`, {
      route: 'footystats-team-cards',
      teamId
    });

    const cardData = await footyStatsApiService.getTeamCardStats(teamId);

    res.json({
      success: true,
      data: cardData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats team card stats ${req.params.teamId}:`, {
      route: 'footystats-team-cards',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team card stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/team/:teamId/btts
 * Get detailed team BTTS statistics
 */
router.get('/team/:teamId/btts', async (req, res) => {
  try {
    const { teamId } = req.params;

    logger.info(`Fetching FootyStats team BTTS stats for ${teamId}`, {
      route: 'footystats-team-btts',
      teamId
    });

    const bttsData = await footyStatsApiService.getTeamBTTSStats(teamId);

    res.json({
      success: true,
      data: bttsData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats team BTTS stats ${req.params.teamId}:`, {
      route: 'footystats-team-btts',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team BTTS stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/referee/:refereeId
 * Get detailed referee statistics
 */
router.get('/referee/:refereeId', async (req, res) => {
  try {
    const { refereeId } = req.params;

    logger.info(`Fetching FootyStats referee stats for ${refereeId}`, {
      route: 'footystats-referee',
      refereeId
    });

    const refereeData = await footyStatsApiService.getRefereeStats(refereeId);

    res.json({
      success: true,
      data: refereeData,
      source: 'footystats',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching FootyStats referee stats ${req.params.refereeId}:`, {
      route: 'footystats-referee',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch referee stats from FootyStats API'
    });
  }
});

/**
 * GET /api/footystats/config
 * Get FootyStats API configuration (for debugging)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      baseUrl: footyStatsApiService.API_CONFIG.BASE_URL,
      hasApiKey: !!footyStatsApiService.API_CONFIG.API_KEY,
      rateLimit: footyStatsApiService.API_CONFIG.RATE_LIMIT,
      maxRetries: footyStatsApiService.API_CONFIG.MAX_RETRIES,
      timeout: footyStatsApiService.API_CONFIG.TIMEOUT
    },
    cacheKeys: footyStatsApiService.CACHE_KEYS,
    cacheTTL: footyStatsApiService.CACHE_TTL,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
