import { Router } from 'express';
import { matchController } from '../controllers/matchController';

const router = Router();

// Get comprehensive match analysis
router.get('/analysis/:matchId', matchController.getMatchAnalysis);

// Get upcoming matches
router.get('/upcoming', matchController.getUpcomingMatches);

export default router;