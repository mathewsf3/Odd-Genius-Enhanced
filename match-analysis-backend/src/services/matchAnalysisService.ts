import { 
  ComprehensiveMatchAnalysis, 
  AnalysisRequest, 
  TeamFormAnalysis,
  HeadToHeadAnalysis,
  LeagueContextAnalysis,
  ExpectedStatistics
} from '../models/MatchAnalysis';
import { HistoricalMatch, Team, League } from '../models/Match';
import footyStatsService from './api/footystats';
import goalsAnalysisService from './analysis/goalsAnalysis';
import cardsAnalysisService from './analysis/cardsAnalysis';
import cornersAnalysisService from './analysis/cornersAnalysis';
import cacheService from './cache/redis';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export class MatchAnalysisService {
  /**
   * Generate comprehensive match analysis
   */
  async generateComprehensiveAnalysis(request: AnalysisRequest): Promise<ComprehensiveMatchAnalysis> {
    const startTime = Date.now();
    logger.info(`Starting comprehensive analysis for teams ${request.homeTeamId} vs ${request.awayTeamId}`);

    try {
      // Validate request
      this.validateAnalysisRequest(request);

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      if (request.cacheResults !== false) {
        const cached = await cacheService.get<ComprehensiveMatchAnalysis>(cacheKey);
        if (cached) {
          logger.info(`Cache hit for analysis: ${cacheKey}`);
          return cached;
        }
      }

      // Fetch all required data in parallel
      const [
        homeTeamData,
        awayTeamData,
        headToHeadData,
        leagueData
      ] = await Promise.all([
        this.fetchTeamAnalysisData(request.homeTeamId, 'home', request.leagueId),
        this.fetchTeamAnalysisData(request.awayTeamId, 'away', request.leagueId),
        this.fetchHeadToHeadData(request.homeTeamId, request.awayTeamId),
        request.leagueId ? this.fetchLeagueContextData(request.leagueId) : null,
      ]);

      // Generate analysis
      const analysis: ComprehensiveMatchAnalysis = {
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

      // Cache the result
      if (request.cacheResults !== false) {
        await cacheService.set(cacheKey, analysis, 1800); // Cache for 30 minutes
      }

      const duration = Date.now() - startTime;
      logger.info(`Comprehensive analysis completed in ${duration}ms`);

      return analysis;
    } catch (error) {
      logger.error('Failed to generate comprehensive analysis:', error);
      throw error;
    }
  }

  /**
   * Fetch team analysis data (home or away form)
   */
  private async fetchTeamAnalysisData(teamId: number, matchType: 'home' | 'away', leagueId?: number): Promise<{
    team: Team;
    league: League;
    analysis: TeamFormAnalysis;
  }> {
    // Fetch last 10 matches for the team
    const matches = await footyStatsService.getTeamMatches({
      teamId,
      matchType,
      limit: 10,
      leagueId,
    });

    if (matches.length === 0) {
      throw new CustomError(`No matches found for team ${teamId}`, 404);
    }

    const team = matches[0].homeTeam.id === teamId ? matches[0].homeTeam : matches[0].awayTeam;
    const league = matches[0].league;

    // Determine if this team is playing at home in the target match
    const isHomeTeam = matchType === 'home';

    // Generate analysis based on match type
    const formAnalysis = {
      goals: goalsAnalysisService.analyzeGoals(matches, isHomeTeam),
      cards: cardsAnalysisService.analyzeCards(matches, isHomeTeam),
      corners: cornersAnalysisService.analyzeCorners(matches, isHomeTeam),
    };

    const analysis: TeamFormAnalysis = {
      team,
      ...(matchType === 'home' ? { homeForm: formAnalysis } : { awayForm: formAnalysis }),
    };

    return { team, league, analysis };
  }

  /**
   * Fetch head-to-head analysis data
   */
  private async fetchHeadToHeadData(homeTeamId: number, awayTeamId: number): Promise<HeadToHeadAnalysis> {
    try {
      const h2hMatches = await footyStatsService.getHeadToHeadMatches({
        homeTeamId,
        awayTeamId,
        limit: 10,
      });

      const last5Meetings = h2hMatches.slice(0, 5);
      const last10Meetings = h2hMatches.slice(0, 10);

      // Also fetch venue-specific data
      const [homeTeamHomeMatches, awayTeamAwayMatches] = await Promise.all([
        footyStatsService.getTeamMatches({ teamId: homeTeamId, matchType: 'home', limit: 5 }),
        footyStatsService.getTeamMatches({ teamId: awayTeamId, matchType: 'away', limit: 5 }),
      ]);

      return {
        last5Meetings: this.analyzeH2HMeetings(last5Meetings, homeTeamId, awayTeamId),
        last10Meetings: this.analyzeH2HMeetings(last10Meetings, homeTeamId, awayTeamId),
        venueAnalysis: {
          homeTeamHomeRecord: this.analyzeTeamRecord(homeTeamHomeMatches, homeTeamId, true),
          awayTeamAwayRecord: this.analyzeTeamRecord(awayTeamAwayMatches, awayTeamId, false),
        },
      };
    } catch (error) {
      logger.warn('Failed to fetch H2H data, using empty analysis:', error);
      return this.getEmptyH2HAnalysis();
    }
  }

  /**
   * Fetch league context data
   */
  private async fetchLeagueContextData(leagueId: number): Promise<LeagueContextAnalysis> {
    try {
      const [standings, averages] = await Promise.all([
        footyStatsService.getLeagueStandings(leagueId),
        footyStatsService.getLeagueAverages(leagueId),
      ]);

      return {
        league: { id: leagueId, name: '', country: '', season: '' }, // This would be populated from API
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
    } catch (error) {
      logger.warn('Failed to fetch league context, using defaults:', error);
      return this.getDefaultLeagueContext();
    }
  }

  /**
   * Calculate expected statistics
   */
  private async calculateExpectedStatistics(
    homeTeamData: any,
    awayTeamData: any
  ): Promise<ExpectedStatistics> {
    // This is a simplified implementation
    // In a real scenario, this would use more sophisticated models
    
    const homeGoalsAvg = homeTeamData.analysis.homeForm?.goals.last5Matches.averageGoalsFor || 1.2;
    const homeGoalsAgainstAvg = homeTeamData.analysis.homeForm?.goals.last5Matches.averageGoalsAgainst || 1.1;
    
    const awayGoalsAvg = awayTeamData.analysis.awayForm?.goals.last5Matches.averageGoalsFor || 1.0;
    const awayGoalsAgainstAvg = awayTeamData.analysis.awayForm?.goals.last5Matches.averageGoalsAgainst || 1.3;

    // Simple expected goals calculation
    const homeXG = (homeGoalsAvg + awayGoalsAgainstAvg) / 2;
    const awayXG = (awayGoalsAvg + homeGoalsAgainstAvg) / 2;

    return {
      xG: {
        home: parseFloat(homeXG.toFixed(2)),
        away: parseFloat(awayXG.toFixed(2)),
        total: parseFloat((homeXG + awayXG).toFixed(2)),
      },      xCorners: {
        home: parseFloat((((homeTeamData.analysis.homeForm?.corners.last5Matches.averageCornersFor || 5) + 
               (awayTeamData.analysis.awayForm?.corners.last5Matches.averageCornersAgainst || 5)) / 2).toFixed(1)),
        away: parseFloat((((awayTeamData.analysis.awayForm?.corners.last5Matches.averageCornersFor || 4.5) + 
               (homeTeamData.analysis.homeForm?.corners.last5Matches.averageCornersAgainst || 4.5)) / 2).toFixed(1)),
        total: 0,
      },
    };
  }

  /**
   * Helper methods
   */
  private validateAnalysisRequest(request: AnalysisRequest): void {
    if (!request.homeTeamId || !request.awayTeamId) {
      throw new CustomError('Home team ID and away team ID are required', 400);
    }

    if (request.homeTeamId === request.awayTeamId) {
      throw new CustomError('Home team and away team cannot be the same', 400);
    }
  }

  private generateCacheKey(request: AnalysisRequest): string {
    const keyParts = [
      'match_analysis',
      request.homeTeamId,
      request.awayTeamId,
      request.leagueId || 'any',
      request.matchDate || 'current',
    ];
    return keyParts.join('_');
  }

  private analyzeH2HMeetings(matches: HistoricalMatch[], homeTeamId: number, awayTeamId: number) {
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

  private analyzeTeamRecord(matches: HistoricalMatch[], teamId: number, isHome: boolean) {
    const wins = matches.filter(match => {
      const teamScore = isHome ? match.result.homeScore : match.result.awayScore;
      const opponentScore = isHome ? match.result.awayScore : match.result.homeScore;
      return teamScore > opponentScore;
    }).length;

    const draws = matches.filter(match => match.result.homeScore === match.result.awayScore).length;
    const losses = matches.length - wins - draws;

    return { wins, draws, losses, matches };
  }

  private processStandings(standings: any[]): any {
    // This would process the actual standings data
    return {
      homeTeamPosition: 0,
      awayTeamPosition: 0,
      pointsGap: 0,
      homeTeamPoints: 0,
      awayTeamPoints: 0,
    };
  }

  private getDefaultLeagueContext(): LeagueContextAnalysis {
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

  private getEmptyH2HAnalysis(): HeadToHeadAnalysis {
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

  private assessDataQuality(homeTeamData: any, awayTeamData: any, h2hData: HeadToHeadAnalysis): {
    completeness: number;
    reliability: number;
    freshness: number;
  } {
    let completeness = 0;
    let reliability = 0;
    let freshness = 0;

    // Assess completeness
    if (homeTeamData.analysis.homeForm?.goals.last5Matches.matches.length >= 5) completeness += 25;
    if (awayTeamData.analysis.awayForm?.goals.last5Matches.matches.length >= 5) completeness += 25;
    if (h2hData.last5Meetings.matches.length >= 3) completeness += 25;
    if (homeTeamData.analysis.homeForm?.goals.last10Matches.matches.length >= 8) completeness += 25;

    // Assess reliability (based on data consistency)
    reliability = Math.min(100, completeness + 20);

    // Assess freshness (based on how recent the data is)
    const now = new Date();
    const recentMatches = [
      ...(homeTeamData.analysis.homeForm?.goals.last5Matches.matches || []),
      ...(awayTeamData.analysis.awayForm?.goals.last5Matches.matches || []),
    ].filter(match => {
      const matchDate = new Date(match.date);
      const daysDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30; // Within last 30 days
    });

    freshness = Math.min(100, (recentMatches.length / 10) * 100);

    return {
      completeness: Math.round(completeness),
      reliability: Math.round(reliability),
      freshness: Math.round(freshness),
    };
  }
}

export default new MatchAnalysisService();
