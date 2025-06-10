const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController'); // Re-enabled - controller is now fixed
const leaguesController = require('../controllers/leaguesController');
const chatController = require('../controllers/chatController');
const analysisRoutes = require('./analysis');
const adminRoutes = require('./admin');
const footyStatsRoutes = require('./footystats');

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Odd Genius API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      matches: '/api/matches',
      leagues: '/api/leagues',
      footystats: '/api/footystats'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Analysis routes - mount to /api/analysis path
// router.use('/analysis', analysisRoutes); // Temporarily disabled

// Admin routes - mount to /api/admin path
// router.use('/admin', adminRoutes); // Temporarily disabled

// FootyStats API routes - mount to /api/footystats path
router.use('/footystats', footyStatsRoutes);

// Match endpoints - Re-enabled since controller is fixed

// Live matches
router.get('/matches/live', matchesController.getLiveMatches);

// Upcoming matches
router.get('/matches/upcoming', matchesController.getUpcomingMatches);

// Premium picks (high confidence, good odds)
router.get('/matches/premium-picks', matchesController.getPremiumPicks);

// Match details by ID
router.get('/matches/:id', matchesController.getMatchDetails);

// Match stats by ID
router.get('/matches/:id/stats', matchesController.getMatchStats);

// Match H2H data
router.get('/matches/:id/h2h', matchesController.getMatchHeadToHead);

// Match corner statistics
router.get('/matches/:id/corners', matchesController.getMatchCornerStats);

// Match card statistics
router.get('/matches/:id/cards', matchesController.getMatchCardStats);

// Match BTTS statistics
router.get('/matches/:id/btts', matchesController.getMatchBTTSStats);

// Match advanced odds
router.get('/matches/:id/odds', matchesController.getMatchOdds);

// Comprehensive match analysis
router.get('/matches/:id/analysis', matchesController.getMatchAnalysis);

// New comprehensive analysis with historical data
router.get('/matches/:id/comprehensive-analysis', matchesController.getComprehensiveAnalysis);

// Complete match details with all analytics
router.get('/matches/:id/complete', matchesController.getCompleteMatchDetails);

// Team form data
router.get('/teams/:teamId/form', matchesController.getTeamForm);

// Player statistics
router.get('/matches/:id/players', matchesController.getMatchPlayerStats);

// Test player stats fixture structure
router.get('/test-player-stats/:matchId', matchesController.testPlayerStatsFixture);

// League standings
router.get('/leagues/:leagueId/standings', matchesController.getLeagueStandings);

// All leagues endpoints - THIS IS THE WORKING ONE
router.get('/leagues', leaguesController.getAllLeagues);
router.get('/leagues/live', matchesController.getLiveLeagues);
router.get('/leagues/countries', matchesController.getCountries);

// Stats
router.get('/stats', matchesController.getStats);
router.get('/stats/performance', matchesController.getBettingPerformance);

// Cache management
router.post('/cache/clear', matchesController.clearCache);

module.exports = router;