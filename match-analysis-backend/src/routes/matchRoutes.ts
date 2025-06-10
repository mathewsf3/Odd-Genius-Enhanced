import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import matchController from '../controllers/matchController';

const router = Router();

// Rate limiting middleware
const analysisRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many analysis requests, please try again later.',
      type: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      type: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
router.use(generalRateLimit);

/**
 * @route   GET /api/matches/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', matchController.healthCheck);

/**
 * @route   POST /api/matches/analyze
 * @desc    Get comprehensive match analysis
 * @access  Public
 * @body    { homeTeamId: number, awayTeamId: number, leagueId?: number, matchDate?: string, includePlayerStats?: boolean, includeExpectedStats?: boolean, cacheResults?: boolean }
 */
router.post('/analyze', analysisRateLimit, matchController.analyzeMatch);

/**
 * @route   GET /api/matches/team/:teamId/form
 * @desc    Get team form analysis
 * @access  Public
 * @params  teamId: number
 * @query   matchType?: 'home' | 'away' | 'all', limit?: number, leagueId?: number
 */
router.get('/team/:teamId/form', matchController.getTeamForm);

/**
 * @route   GET /api/matches/head-to-head
 * @desc    Get head-to-head analysis between two teams
 * @access  Public
 * @query   homeTeamId: number, awayTeamId: number, limit?: number
 */
router.get('/head-to-head', matchController.getHeadToHead);

/**
 * @route   POST /api/matches/predictions
 * @desc    Get match predictions and expected statistics
 * @access  Public
 * @body    { homeTeamId: number, awayTeamId: number, leagueId?: number, matchDate?: string }
 */
router.post('/predictions', analysisRateLimit, matchController.getPredictions);

/**
 * @route   GET /api/matches/overview
 * @desc    Get quick match overview
 * @access  Public
 * @query   homeTeamId: number, awayTeamId: number
 */
router.get('/overview', matchController.getMatchOverview);

export default router;
