import { Request, Response } from 'express';
import { matchAnalysisService } from '../services/matchAnalysisService';
import { logger } from '../utils/logger';

export class MatchController {
  /**
   * Get comprehensive analysis for a match
   */
  async getMatchAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const matchId = parseInt(req.params.matchId);
      
      if (isNaN(matchId)) {
        res.status(400).json({ error: 'Invalid match ID. Must be a number.' });
        return;
      }
      
      const analysis = await matchAnalysisService.getComprehensiveMatchAnalysis(matchId);
      res.json(analysis);
    } catch (error) {
      logger.error('Error in getMatchAnalysis controller', error);
      res.status(500).json({ error: 'Failed to get match analysis' });
    }
  }
  
  /**
   * Get upcoming matches with basic details
   */
  async getUpcomingMatches(req: Request, res: Response): Promise<void> {
    try {
      const leagueId = req.query.leagueId ? parseInt(req.query.leagueId as string) : undefined;
      
      // Call FootyStats API through the service
      const matches = await matchAnalysisService.getUpcomingMatches(leagueId);
      res.json(matches);
    } catch (error) {
      logger.error('Error in getUpcomingMatches controller', error);
      res.status(500).json({ error: 'Failed to get upcoming matches' });
    }
  }
}

export const matchController = new MatchController();