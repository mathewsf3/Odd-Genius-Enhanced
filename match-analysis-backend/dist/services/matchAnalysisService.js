"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchAnalysisService = void 0;
const footystats_1 = __importDefault(require("./api/footystats"));
const goalsAnalysis_1 = __importDefault(require("./analysis/goalsAnalysis"));
const cardsAnalysis_1 = __importDefault(require("./analysis/cardsAnalysis"));
const cornersAnalysis_1 = __importDefault(require("./analysis/cornersAnalysis"));
const redis_1 = __importDefault(require("./cache/redis"));
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
class MatchAnalysisService {
    async generateComprehensiveAnalysis(request) {
        const startTime = Date.now();
        logger_1.default.info(`Starting comprehensive analysis for teams ${request.homeTeamId} vs ${request.awayTeamId}`);
        try {
            this.validateAnalysisRequest(request);
            const cacheKey = this.generateCacheKey(request);
            if (request.cacheResults !== false) {
                const cached = await redis_1.default.get(cacheKey);
                if (cached) {
                    logger_1.default.info(`Cache hit for analysis: ${cacheKey}`);
                    return cached;
                }
            }
            const [homeTeamData, awayTeamData, headToHeadData, leagueData] = await Promise.all([
                this.fetchTeamAnalysisData(request.homeTeamId, 'home', request.leagueId),
                this.fetchTeamAnalysisData(request.awayTeamId, 'away', request.leagueId),
                this.fetchHeadToHeadData(request.homeTeamId, request.awayTeamId),
                request.leagueId ? this.fetchLeagueContextData(request.leagueId) : null,
            ]);
            const analysis = {
                targetMatch: {
                    homeTeam: homeTeamData.team,
                    awayTeam: awayTeamData.team,
                    league: homeTeamData.league,
                    date: request.matchDate || new Date().toISOString(),
                },
                homeTeamAnalysis: homeTeamData.analysis,
                awayTeamAnalysis: awayTeamData.analysis,
                headToHead: headToHeadData,
                leagueContext: leagueData || this.getDefaultLeagueContext(),
                expectedStatistics: request.includeExpectedStats ? await this.calculateExpectedStatistics(homeTeamData, awayTeamData) : undefined,
                generatedAt: new Date().toISOString(),
                dataQuality: this.assessDataQuality(homeTeamData, awayTeamData, headToHeadData),
            };
            if (request.cacheResults !== false) {
                await redis_1.default.set(cacheKey, analysis, 1800);
            }
            const duration = Date.now() - startTime;
            logger_1.default.info(`Comprehensive analysis completed in ${duration}ms`);
            return analysis;
        }
        catch (error) {
            logger_1.default.error('Failed to generate comprehensive analysis:', error);
            throw error;
        }
    }
    async fetchTeamAnalysisData(teamId, matchType, leagueId) {
        const matches = await footystats_1.default.getTeamMatches({
            teamId,
            matchType,
            limit: 10,
            leagueId,
        });
        if (matches.length === 0) {
            throw new errorHandler_1.CustomError(`No matches found for team ${teamId}`, 404);
        }
        const team = matches[0].homeTeam.id === teamId ? matches[0].homeTeam : matches[0].awayTeam;
        const league = matches[0].league;
        const isHomeTeam = matchType === 'home';
        const formAnalysis = {
            goals: goalsAnalysis_1.default.analyzeGoals(matches, isHomeTeam),
            cards: cardsAnalysis_1.default.analyzeCards(matches, isHomeTeam),
            corners: cornersAnalysis_1.default.analyzeCorners(matches, isHomeTeam),
        };
        const analysis = {
            team,
            ...(matchType === 'home' ? { homeForm: formAnalysis } : { awayForm: formAnalysis }),
        };
        return { team, league, analysis };
    }
    async fetchHeadToHeadData(homeTeamId, awayTeamId) {
        try {
            const h2hMatches = await footystats_1.default.getHeadToHeadMatches({
                homeTeamId,
                awayTeamId,
                limit: 10,
            });
            const last5Meetings = h2hMatches.slice(0, 5);
            const last10Meetings = h2hMatches.slice(0, 10);
            const [homeTeamHomeMatches, awayTeamAwayMatches] = await Promise.all([
                footystats_1.default.getTeamMatches({ teamId: homeTeamId, matchType: 'home', limit: 5 }),
                footystats_1.default.getTeamMatches({ teamId: awayTeamId, matchType: 'away', limit: 5 }),
            ]);
            return {
                last5Meetings: this.analyzeH2HMeetings(last5Meetings, homeTeamId, awayTeamId),
                last10Meetings: this.analyzeH2HMeetings(last10Meetings, homeTeamId, awayTeamId),
                venueAnalysis: {
                    homeTeamHomeRecord: this.analyzeTeamRecord(homeTeamHomeMatches, homeTeamId, true),
                    awayTeamAwayRecord: this.analyzeTeamRecord(awayTeamAwayMatches, awayTeamId, false),
                },
            };
        }
        catch (error) {
            logger_1.default.warn('Failed to fetch H2H data, using empty analysis:', error);
            return this.getEmptyH2HAnalysis();
        }
    }
    async fetchLeagueContextData(leagueId) {
        try {
            const [standings, averages] = await Promise.all([
                footystats_1.default.getLeagueStandings(leagueId),
                footystats_1.default.getLeagueAverages(leagueId),
            ]);
            return {
                league: { id: leagueId, name: '', country: '', season: '' },
                standings: this.processStandings(standings),
                averages: {
                    goalsPerMatch: averages.goals_per_match || 2.5,
                    cardsPerMatch: averages.cards_per_match || 4.2,
                    cornersPerMatch: averages.corners_per_match || 10.5,
                },
                homeAdvantage: {
                    homeWinPercentage: averages.home_win_percentage || 45,
                    awayWinPercentage: averages.away_win_percentage || 28,
                    drawPercentage: averages.draw_percentage || 27,
                },
            };
        }
        catch (error) {
            logger_1.default.warn('Failed to fetch league context, using defaults:', error);
            return this.getDefaultLeagueContext();
        }
    }
    async calculateExpectedStatistics(homeTeamData, awayTeamData) {
        const homeGoalsAvg = homeTeamData.analysis.homeForm?.goals.last5Matches.averageGoalsFor || 1.2;
        const homeGoalsAgainstAvg = homeTeamData.analysis.homeForm?.goals.last5Matches.averageGoalsAgainst || 1.1;
        const awayGoalsAvg = awayTeamData.analysis.awayForm?.goals.last5Matches.averageGoalsFor || 1.0;
        const awayGoalsAgainstAvg = awayTeamData.analysis.awayForm?.goals.last5Matches.averageGoalsAgainst || 1.3;
        const homeXG = (homeGoalsAvg + awayGoalsAgainstAvg) / 2;
        const awayXG = (awayGoalsAvg + homeGoalsAgainstAvg) / 2;
        return {
            xG: {
                home: parseFloat(homeXG.toFixed(2)),
                away: parseFloat(awayXG.toFixed(2)),
                total: parseFloat((homeXG + awayXG).toFixed(2)),
            }, xCorners: {
                home: parseFloat((((homeTeamData.analysis.homeForm?.corners.last5Matches.averageCornersFor || 5) +
                    (awayTeamData.analysis.awayForm?.corners.last5Matches.averageCornersAgainst || 5)) / 2).toFixed(1)),
                away: parseFloat((((awayTeamData.analysis.awayForm?.corners.last5Matches.averageCornersFor || 4.5) +
                    (homeTeamData.analysis.homeForm?.corners.last5Matches.averageCornersAgainst || 4.5)) / 2).toFixed(1)),
                total: 0,
            },
        };
    }
    validateAnalysisRequest(request) {
        if (!request.homeTeamId || !request.awayTeamId) {
            throw new errorHandler_1.CustomError('Home team ID and away team ID are required', 400);
        }
        if (request.homeTeamId === request.awayTeamId) {
            throw new errorHandler_1.CustomError('Home team and away team cannot be the same', 400);
        }
    }
    generateCacheKey(request) {
        const keyParts = [
            'match_analysis',
            request.homeTeamId,
            request.awayTeamId,
            request.leagueId || 'any',
            request.matchDate || 'current',
        ];
        return keyParts.join('_');
    }
    analyzeH2HMeetings(matches, homeTeamId, awayTeamId) {
        const homeTeamWins = matches.filter(match => {
            const homeWon = match.result.homeScore > match.result.awayScore;
            const homeTeamIsHome = match.homeTeam.id === homeTeamId;
            return (homeTeamIsHome && homeWon) || (!homeTeamIsHome && !homeWon);
        }).length;
        const awayTeamWins = matches.filter(match => {
            const awayWon = match.result.awayScore > match.result.homeScore;
            const awayTeamIsAway = match.awayTeam.id === awayTeamId;
            return (awayTeamIsAway && awayWon) || (!awayTeamIsAway && !awayWon);
        }).length;
        const draws = matches.filter(match => match.result.homeScore === match.result.awayScore).length;
        return {
            matches,
            homeTeamWins,
            awayTeamWins,
            draws,
            averageGoals: matches.length > 0 ?
                parseFloat((matches.reduce((sum, m) => sum + m.result.totalGoals, 0) / matches.length).toFixed(2)) : 0,
            averageCards: matches.length > 0 ?
                parseFloat((matches.reduce((sum, m) => sum + m.statistics.cards.total.total, 0) / matches.length).toFixed(2)) : 0,
            averageCorners: matches.length > 0 ?
                parseFloat((matches.reduce((sum, m) => sum + m.statistics.corners.total, 0) / matches.length).toFixed(2)) : 0,
        };
    }
    analyzeTeamRecord(matches, teamId, isHome) {
        const wins = matches.filter(match => {
            const teamScore = isHome ? match.result.homeScore : match.result.awayScore;
            const opponentScore = isHome ? match.result.awayScore : match.result.homeScore;
            return teamScore > opponentScore;
        }).length;
        const draws = matches.filter(match => match.result.homeScore === match.result.awayScore).length;
        const losses = matches.length - wins - draws;
        return { wins, draws, losses, matches };
    }
    processStandings(standings) {
        return {
            homeTeamPosition: 0,
            awayTeamPosition: 0,
            pointsGap: 0,
            homeTeamPoints: 0,
            awayTeamPoints: 0,
        };
    }
    getDefaultLeagueContext() {
        return {
            league: { id: 0, name: 'Unknown', country: '', season: '' },
            averages: {
                goalsPerMatch: 2.5,
                cardsPerMatch: 4.2,
                cornersPerMatch: 10.5,
            },
            homeAdvantage: {
                homeWinPercentage: 45,
                awayWinPercentage: 28,
                drawPercentage: 27,
            },
        };
    }
    getEmptyH2HAnalysis() {
        const emptyMeetings = {
            matches: [],
            homeTeamWins: 0,
            awayTeamWins: 0,
            draws: 0,
            averageGoals: 0,
            averageCards: 0,
            averageCorners: 0,
        };
        return {
            last5Meetings: emptyMeetings,
            last10Meetings: emptyMeetings,
            venueAnalysis: {
                homeTeamHomeRecord: { wins: 0, draws: 0, losses: 0, matches: [] },
                awayTeamAwayRecord: { wins: 0, draws: 0, losses: 0, matches: [] },
            },
        };
    }
    assessDataQuality(homeTeamData, awayTeamData, h2hData) {
        let completeness = 0;
        let reliability = 0;
        let freshness = 0;
        if (homeTeamData.analysis.homeForm?.goals.last5Matches.matches.length >= 5)
            completeness += 25;
        if (awayTeamData.analysis.awayForm?.goals.last5Matches.matches.length >= 5)
            completeness += 25;
        if (h2hData.last5Meetings.matches.length >= 3)
            completeness += 25;
        if (homeTeamData.analysis.homeForm?.goals.last10Matches.matches.length >= 8)
            completeness += 25;
        reliability = Math.min(100, completeness + 20);
        const now = new Date();
        const recentMatches = [
            ...(homeTeamData.analysis.homeForm?.goals.last5Matches.matches || []),
            ...(awayTeamData.analysis.awayForm?.goals.last5Matches.matches || []),
        ].filter(match => {
            const matchDate = new Date(match.date);
            const daysDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });
        freshness = Math.min(100, (recentMatches.length / 10) * 100);
        return {
            completeness: Math.round(completeness),
            reliability: Math.round(reliability),
            freshness: Math.round(freshness),
        };
    }
}
exports.MatchAnalysisService = MatchAnalysisService;
exports.default = new MatchAnalysisService();
//# sourceMappingURL=matchAnalysisService.js.map