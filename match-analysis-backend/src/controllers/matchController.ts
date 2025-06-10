import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import matchAnalysisService from '../services/matchAnalysisService';
import { AnalysisRequest } from '../models/MatchAnalysis';
import logger from '../utils/logger';

// Validation schemas
const analysisRequestSchema = Joi.object({
  homeTeamId: Joi.number().integer().positive().required(),
  awayTeamId: Joi.number().integer().positive().required(),
  leagueId: Joi.number().integer().positive().optional(),
  matchDate: Joi.string().isoDate().optional(),
  includePlayerStats: Joi.boolean().optional().default(false),
  includeExpectedStats: Joi.boolean().optional().default(true),
  cacheResults: Joi.boolean().optional().default(true),
});

const teamStatsRequestSchema = Joi.object({
  teamId: Joi.number().integer().positive().required(),
  matchType: Joi.string().valid('home', 'away', 'all').optional().default('all'),
  limit: Joi.number().integer().min(1).max(20).optional().default(10),
  leagueId: Joi.number().integer().positive().optional(),
});

const h2hRequestSchema = Joi.object({
  homeTeamId: Joi.number().integer().positive().required(),
  awayTeamId: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().min(1).max(20).optional().default(10),
});

export class MatchController {
  /**
   * Get comprehensive match analysis
   * POST /api/matches/analyze
   */
  analyzeMatch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate request
    const { error, value } = analysisRequestSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const analysisRequest: AnalysisRequest = value;

    logger.info('Analyzing match:', {
      homeTeamId: analysisRequest.homeTeamId,
      awayTeamId: analysisRequest.awayTeamId,
      leagueId: analysisRequest.leagueId,
    });

    // Generate comprehensive analysis
    const analysis = await matchAnalysisService.generateComprehensiveAnalysis(analysisRequest);

    res.status(200).json({
      success: true,
      data: analysis,
      meta: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
        processingTime: res.get('X-Response-Time'),
      },
    });
  });

  /**
   * Get team form analysis
   * GET /api/matches/team/:teamId/form
   */
  getTeamForm = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teamId = parseInt(req.params.teamId);
    if (!teamId || teamId <= 0) {
      throw new CustomError('Invalid team ID', 400);
    }

    // Validate query parameters
    const { error, value } = teamStatsRequestSchema.validate({
      teamId,
      ...req.query,
    });
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const { matchType, limit, leagueId } = value;

    logger.info(`Fetching team form for team ${teamId}:`, { matchType, limit, leagueId });

    // This would typically call a specific service method for team form
    // For now, we'll simulate it with a partial analysis
    const analysis = await matchAnalysisService.generateComprehensiveAnalysis({
      homeTeamId: matchType === 'away' ? 1 : teamId, // Dummy logic
      awayTeamId: matchType === 'home' ? 1 : teamId, // Dummy logic
      leagueId,
      includeExpectedStats: false,
    });

    res.status(200).json({
      success: true,
      data: {
        teamId,
        matchType,
        form: matchType === 'home' ? analysis.homeTeamAnalysis : analysis.awayTeamAnalysis,
      },
      meta: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Get head-to-head analysis
   * GET /api/matches/head-to-head
   */
  getHeadToHead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate query parameters
    const { error, value } = h2hRequestSchema.validate(req.query);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const { homeTeamId, awayTeamId, limit } = value;

    logger.info(`Fetching H2H analysis:`, { homeTeamId, awayTeamId, limit });

    const analysis = await matchAnalysisService.generateComprehensiveAnalysis({
      homeTeamId,
      awayTeamId,
      includeExpectedStats: false,
    });

    res.status(200).json({
      success: true,
      data: {
        homeTeamId,
        awayTeamId,
        headToHead: analysis.headToHead,
      },
      meta: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Get match predictions/expected stats
   * POST /api/matches/predictions
   */
  getPredictions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Validate request
    const { error, value } = analysisRequestSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const analysisRequest: AnalysisRequest = {
      ...value,
      includeExpectedStats: true,
    };

    logger.info('Generating predictions:', {
      homeTeamId: analysisRequest.homeTeamId,
      awayTeamId: analysisRequest.awayTeamId,
    });

    const analysis = await matchAnalysisService.generateComprehensiveAnalysis(analysisRequest);

    // Extract prediction-focused data
    const predictions = {
      expectedStatistics: analysis.expectedStatistics,
      homeTeamProbabilities: this.calculateTeamProbabilities(analysis.homeTeamAnalysis),
      awayTeamProbabilities: this.calculateTeamProbabilities(analysis.awayTeamAnalysis),
      matchProbabilities: this.calculateMatchProbabilities(analysis),
      recommendations: this.generateRecommendations(analysis),
    };

    res.status(200).json({
      success: true,
      data: predictions,
      meta: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
        confidence: analysis.dataQuality,
      },
    });
  });

  /**
   * Get quick match overview
   * GET /api/matches/overview
   */
  getMatchOverview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { homeTeamId, awayTeamId } = req.query;

    if (!homeTeamId || !awayTeamId) {
      throw new CustomError('homeTeamId and awayTeamId are required', 400);
    }

    const analysis = await matchAnalysisService.generateComprehensiveAnalysis({
      homeTeamId: parseInt(homeTeamId as string),
      awayTeamId: parseInt(awayTeamId as string),
      includeExpectedStats: true,
      cacheResults: true,
    });

    // Create a simplified overview
    const overview = {
      teams: {
        home: analysis.targetMatch.homeTeam,
        away: analysis.targetMatch.awayTeam,
      },
      keyStats: {
        homeTeamForm: {
          last5Goals: analysis.homeTeamAnalysis.homeForm?.goals.last5Matches.averageGoals || 0,
          last5Cards: analysis.homeTeamAnalysis.homeForm?.cards.last5Matches.averageCards || 0,
          last5Corners: analysis.homeTeamAnalysis.homeForm?.corners.last5Matches.averageCorners || 0,
        },
        awayTeamForm: {
          last5Goals: analysis.awayTeamAnalysis.awayForm?.goals.last5Matches.averageGoals || 0,
          last5Cards: analysis.awayTeamAnalysis.awayForm?.cards.last5Matches.averageCards || 0,
          last5Corners: analysis.awayTeamAnalysis.awayForm?.corners.last5Matches.averageCorners || 0,
        },
      },
      headToHead: {
        totalMeetings: analysis.headToHead.last10Meetings.matches.length,
        homeWins: analysis.headToHead.last10Meetings.homeTeamWins,
        awayWins: analysis.headToHead.last10Meetings.awayTeamWins,
        draws: analysis.headToHead.last10Meetings.draws,
      },
      expectedStats: analysis.expectedStatistics,
      dataQuality: analysis.dataQuality,
    };

    res.status(200).json({
      success: true,
      data: overview,
      meta: {
        requestId: req.headers['x-request-id'],
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * Health check endpoint
   * GET /api/matches/health
   */
  healthCheck = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      success: true,
      message: 'Match Analysis API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Private helper methods
  private calculateTeamProbabilities(teamAnalysis: any): any {
    // Simplified probability calculations
    // In a real implementation, this would use more sophisticated models
    return {
      overGoalsThresholds: {
        over15: 65,
        over25: 45,
        over35: 25,
      },
      overCardsThresholds: {
        over15: 70,
        over25: 50,
        over35: 30,
      },
      overCornersThresholds: {
        over85: 60,
        over105: 40,
        over125: 25,
      },
    };
  }

  private calculateMatchProbabilities(analysis: any): any {
    return {
      matchResult: {
        homeWin: 40,
        draw: 30,
        awayWin: 30,
      },
      bothTeamsToScore: 58,
      totalGoals: {
        over15: 75,
        over25: 50,
        over35: 30,
      },
    };
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Add some basic recommendations based on analysis
    if (analysis.expectedStatistics?.xG.total > 2.5) {
      recommendations.push('Consider Over 2.5 Goals - High expected goal total');
    }

    if (analysis.headToHead.last5Meetings.averageGoals > 3.0) {
      recommendations.push('Historical H2H shows high-scoring matches');
    }

    if (analysis.dataQuality.completeness < 70) {
      recommendations.push('Limited data available - proceed with caution');
    }

    return recommendations;
  }
}

export default new MatchController();
