"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("../middleware/errorHandler");
const matchAnalysisService_1 = __importDefault(require("../services/matchAnalysisService"));
const logger_1 = __importDefault(require("../utils/logger"));
const analysisRequestSchema = joi_1.default.object({
    homeTeamId: joi_1.default.number().integer().positive().required(),
    awayTeamId: joi_1.default.number().integer().positive().required(),
    leagueId: joi_1.default.number().integer().positive().optional(),
    matchDate: joi_1.default.string().isoDate().optional(),
    includePlayerStats: joi_1.default.boolean().optional().default(false),
    includeExpectedStats: joi_1.default.boolean().optional().default(true),
    cacheResults: joi_1.default.boolean().optional().default(true),
});
const teamStatsRequestSchema = joi_1.default.object({
    teamId: joi_1.default.number().integer().positive().required(),
    matchType: joi_1.default.string().valid('home', 'away', 'all').optional().default('all'),
    limit: joi_1.default.number().integer().min(1).max(20).optional().default(10),
    leagueId: joi_1.default.number().integer().positive().optional(),
});
const h2hRequestSchema = joi_1.default.object({
    homeTeamId: joi_1.default.number().integer().positive().required(),
    awayTeamId: joi_1.default.number().integer().positive().required(),
    limit: joi_1.default.number().integer().min(1).max(20).optional().default(10),
});
class MatchController {
    constructor() {
        this.analyzeMatch = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { error, value } = analysisRequestSchema.validate(req.body);
            if (error) {
                throw new errorHandler_1.CustomError(`Validation error: ${error.details[0].message}`, 400);
            }
            const analysisRequest = value;
            logger_1.default.info('Analyzing match:', {
                homeTeamId: analysisRequest.homeTeamId,
                awayTeamId: analysisRequest.awayTeamId,
                leagueId: analysisRequest.leagueId,
            });
            const analysis = await matchAnalysisService_1.default.generateComprehensiveAnalysis(analysisRequest);
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
        this.getTeamForm = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const teamId = parseInt(req.params.teamId);
            if (!teamId || teamId <= 0) {
                throw new errorHandler_1.CustomError('Invalid team ID', 400);
            }
            const { error, value } = teamStatsRequestSchema.validate({
                teamId,
                ...req.query,
            });
            if (error) {
                throw new errorHandler_1.CustomError(`Validation error: ${error.details[0].message}`, 400);
            }
            const { matchType, limit, leagueId } = value;
            logger_1.default.info(`Fetching team form for team ${teamId}:`, { matchType, limit, leagueId });
            const analysis = await matchAnalysisService_1.default.generateComprehensiveAnalysis({
                homeTeamId: matchType === 'away' ? 1 : teamId,
                awayTeamId: matchType === 'home' ? 1 : teamId,
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
        this.getHeadToHead = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { error, value } = h2hRequestSchema.validate(req.query);
            if (error) {
                throw new errorHandler_1.CustomError(`Validation error: ${error.details[0].message}`, 400);
            }
            const { homeTeamId, awayTeamId, limit } = value;
            logger_1.default.info(`Fetching H2H analysis:`, { homeTeamId, awayTeamId, limit });
            const analysis = await matchAnalysisService_1.default.generateComprehensiveAnalysis({
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
        this.getPredictions = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { error, value } = analysisRequestSchema.validate(req.body);
            if (error) {
                throw new errorHandler_1.CustomError(`Validation error: ${error.details[0].message}`, 400);
            }
            const analysisRequest = {
                ...value,
                includeExpectedStats: true,
            };
            logger_1.default.info('Generating predictions:', {
                homeTeamId: analysisRequest.homeTeamId,
                awayTeamId: analysisRequest.awayTeamId,
            });
            const analysis = await matchAnalysisService_1.default.generateComprehensiveAnalysis(analysisRequest);
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
        this.getMatchOverview = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { homeTeamId, awayTeamId } = req.query;
            if (!homeTeamId || !awayTeamId) {
                throw new errorHandler_1.CustomError('homeTeamId and awayTeamId are required', 400);
            }
            const analysis = await matchAnalysisService_1.default.generateComprehensiveAnalysis({
                homeTeamId: parseInt(homeTeamId),
                awayTeamId: parseInt(awayTeamId),
                includeExpectedStats: true,
                cacheResults: true,
            });
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
        this.healthCheck = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            res.status(200).json({
                success: true,
                message: 'Match Analysis API is healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
            });
        });
    }
    calculateTeamProbabilities(teamAnalysis) {
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
    calculateMatchProbabilities(analysis) {
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
    generateRecommendations(analysis) {
        const recommendations = [];
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
exports.MatchController = MatchController;
exports.default = new MatchController();
//# sourceMappingURL=matchController.js.map