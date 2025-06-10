import { Match, MatchAnalysis } from '../models/MatchAnalysis';
import { footyStatsClient } from './api/footystats';
import { redisCache } from './cache/redis';
import { goalsAnalysisService } from './analysis/goalsAnalysis';
import { cardsAnalysisService } from './analysis/cardsAnalysis';
import { cornersAnalysisService } from './analysis/cornersAnalysis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class MatchAnalysisService {
  /**
   * Get comprehensive match analysis for a given match
   */
  async getComprehensiveMatchAnalysis(matchId: number): Promise<MatchAnalysis> {
    try {
      // Try to get from cache first
      const cacheKey = `match_analysis_${matchId}`;
      const cachedData = await redisCache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Retrieved match analysis from cache for match ${matchId}`);
        return cachedData;
      }
      
      // Fetch match details
      const matchDetails = await footyStatsClient.getMatchDetails(matchId);
      const match: Match = this.transformMatchData(matchDetails);
      
      // Fetch team data
      const homeTeamLast5Home = await this.getTeamLastNHomeMatches(match.homeTeamId, 5);
      const homeTeamLast10Home = await this.getTeamLastNHomeMatches(match.homeTeamId, 10);
      const awayTeamLast5Away = await this.getTeamLastNAwayMatches(match.awayTeamId, 5);
      const awayTeamLast10Away = await this.getTeamLastNAwayMatches(match.awayTeamId, 10);
      
      // Fetch H2H data
      const h2hLast5 = await this.getHeadToHeadLastN(match.homeTeamId, match.awayTeamId, 5);
      const h2hLast10 = await this.getHeadToHeadLastN(match.homeTeamId, match.awayTeamId, 10);
      
      // Fetch referee data if available
      let refereeAnalysis = null;
      if (match.refereeId) {
        refereeAnalysis = await this.getRefereeAnalysis(match.refereeId);
      }
      
      // Fetch league data
      const leagueAnalysis = await this.getLeagueAnalysis(match.leagueId, match.homeTeamId, match.awayTeamId);
      
      // Player analysis
      const playerAnalysis = await this.getPlayerAnalysis(match.homeTeamId, match.awayTeamId);
      
      // Process and analyze the data
      const goalsAnalysis = goalsAnalysisService.analyzeGoals(
        homeTeamLast5Home, 
        homeTeamLast10Home, 
        awayTeamLast5Away, 
        awayTeamLast10Away, 
        h2hLast5, 
        h2hLast10
      );
      
      const cardsAnalysis = cardsAnalysisService.analyzeCards(
        homeTeamLast5Home, 
        homeTeamLast10Home, 
        awayTeamLast5Away, 
        awayTeamLast10Away, 
        h2hLast5, 
        h2hLast10,
        refereeAnalysis
      );
      
      const cornersAnalysis = cornersAnalysisService.analyzeCorners(
        homeTeamLast5Home, 
        homeTeamLast10Home, 
        awayTeamLast5Away, 
        awayTeamLast10Away, 
        h2hLast5, 
        h2hLast10
      );
      
      const h2hAnalysis = this.processHeadToHeadData(h2hLast5, h2hLast10);
      
      const expectedStats = this.calculateExpectedStats(
        homeTeamLast10Home,
        awayTeamLast10Away,
        h2hLast10,
        leagueAnalysis
      );
      
      // Compile the complete analysis
      const analysis: MatchAnalysis = {
        match,
        goalsAnalysis,
        cardsAnalysis,
        cornersAnalysis,
        refereeAnalysis,
        leagueAnalysis,
        h2hAnalysis,
        playerAnalysis,
        expectedStats
      };
      
      // Cache the analysis
      await redisCache.set(cacheKey, analysis, config.CACHE_EXPIRY.MATCH_DATA);
      
      return analysis;
    } catch (error) {
      logger.error(`Error getting comprehensive match analysis for match ${matchId}`, error);
      throw error;
    }
  }
  
  // Helper methods for fetching data with caching
  private async getTeamLastNHomeMatches(teamId: number, n: number): Promise<any[]> {
    const cacheKey = `team_${teamId}_home_last_${n}`;
    const cachedData = await redisCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await footyStatsClient.getTeamHomeMatches(teamId, n);
    await redisCache.set(cacheKey, data, config.CACHE_EXPIRY.TEAM_DATA);
    
    return data;
  }
  
  private async getTeamLastNAwayMatches(teamId: number, n: number): Promise<any[]> {
    const cacheKey = `team_${teamId}_away_last_${n}`;
    const cachedData = await redisCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await footyStatsClient.getTeamAwayMatches(teamId, n);
    await redisCache.set(cacheKey, data, config.CACHE_EXPIRY.TEAM_DATA);
    
    return data;
  }
  
  private async getHeadToHeadLastN(teamId1: number, teamId2: number, n: number): Promise<any[]> {
    const cacheKey = `h2h_${teamId1}_${teamId2}_last_${n}`;
    const cachedData = await redisCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await footyStatsClient.getHeadToHead(teamId1, teamId2, n);
    await redisCache.set(cacheKey, data, config.CACHE_EXPIRY.TEAM_DATA);
    
    return data;
  }
  
  private async getRefereeAnalysis(refereeId: number): Promise<any> {
    const cacheKey = `referee_${refereeId}`;
    const cachedData = await redisCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await footyStatsClient.getRefereeStats(refereeId);
    await redisCache.set(cacheKey, data, config.CACHE_EXPIRY.REFEREE_DATA);
    
    return data;
  }
  
  private async getLeagueAnalysis(leagueId: number, homeTeamId: number, awayTeamId: number): Promise<any> {
    const cacheKey = `league_${leagueId}`;
    const cachedData = await redisCache.get(cacheKey);
    
    let leagueData;
    if (cachedData) {
      leagueData = cachedData;
    } else {
      leagueData = await footyStatsClient.getLeagueTable(leagueId);
      await redisCache.set(cacheKey, leagueData, config.CACHE_EXPIRY.LEAGUE_DATA);
    }
    
    return this.processLeagueData(leagueData, homeTeamId, awayTeamId);
  }
  
  private async getPlayerAnalysis(homeTeamId: number, awayTeamId: number): Promise<any> {
    // Fetch player data for both teams
    const cacheKeyHome = `team_${homeTeamId}_players`;
    const cacheKeyAway = `team_${awayTeamId}_players`;
    
    let homeTeamPlayers = await redisCache.get(cacheKeyHome);
    let awayTeamPlayers = await redisCache.get(cacheKeyAway);
    
    if (!homeTeamPlayers) {
      homeTeamPlayers = await this.fetchTeamPlayers(homeTeamId);
      await redisCache.set(cacheKeyHome, homeTeamPlayers, config.CACHE_EXPIRY.TEAM_DATA);
    }
    
    if (!awayTeamPlayers) {
      awayTeamPlayers = await this.fetchTeamPlayers(awayTeamId);
      await redisCache.set(cacheKeyAway, awayTeamPlayers, config.CACHE_EXPIRY.TEAM_DATA);
    }
    
    // Analyze player stats for both teams
    return {
      homeTeam: await this.analyzeTeamPlayerStats(homeTeamPlayers),
      awayTeam: await this.analyzeTeamPlayerStats(awayTeamPlayers)
    };
  }
  
  private async fetchTeamPlayers(teamId: number): Promise<any[]> {
    // In a real implementation, this would call the FootyStats API to get players for a team
    // This is a placeholder implementation
    return [];
  }
  
  private async analyzeTeamPlayerStats(players: any[]): Promise<any[]> {
    // Process player stats for the last 5 and 10 matches
    const result = [];
    
    for (const player of players) {
      const playerStats = await this.getPlayerStats(player.id);
      result.push({
        id: player.id,
        name: player.name,
        position: player.position,
        last5: this.processPlayerLastNMatches(playerStats, 5),
        last10: this.processPlayerLastNMatches(playerStats, 10)
      });
    }
    
    return result;
  }
  
  private async getPlayerStats(playerId: number): Promise<any> {
    const cacheKey = `player_${playerId}`;
    const cachedData = await redisCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const data = await footyStatsClient.getPlayerStats(playerId);
    await redisCache.set(cacheKey, data, config.CACHE_EXPIRY.TEAM_DATA);
    
    return data;
  }
  
  private processPlayerLastNMatches(playerStats: any, n: number): any {
    // Process player stats for the last N matches
    return {
      goals: 0,  // Placeholder for actual calculation
      assists: 0,
      minutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      foulsCommitted: 0,
      foulsSuffered: 0,
      xG: 0,
      xA: 0
    };
  }
  
  private transformMatchData(matchDetails: any): Match {
    // Transform API match data into our Match model
    return {
      id: matchDetails.id,
      homeTeamId: matchDetails.home_team.id,
      homeTeamName: matchDetails.home_team.name,
      awayTeamId: matchDetails.away_team.id,
      awayTeamName: matchDetails.away_team.name,
      startTime: matchDetails.start_time,
      status: matchDetails.status,
      leagueId: matchDetails.league.id,
      leagueName: matchDetails.league.name,
      refereeId: matchDetails.referee?.id,
      refereeName: matchDetails.referee?.name,
      venue: matchDetails.venue,
      stats: matchDetails.stats ? {
        homeScore: matchDetails.stats.home_score,
        awayScore: matchDetails.stats.away_score,
        homeYellowCards: matchDetails.stats.home_yellow_cards,
        awayYellowCards: matchDetails.stats.away_yellow_cards,
        homeRedCards: matchDetails.stats.home_red_cards,
        awayRedCards: matchDetails.stats.away_red_cards,
        homeCorners: matchDetails.stats.home_corners,
        awayCorners: matchDetails.stats.away_corners
      } : undefined
    };
  }
  
  private processHeadToHeadData(h2hLast5: any[], h2hLast10: any[]): any {
    // Process head-to-head data
    const matches = {
      last5: this.transformH2HMatches(h2hLast5),
      last10: this.transformH2HMatches(h2hLast10)
    };
    
    const summary = this.calculateH2HSummary(h2hLast10);
    
    return {
      matches,
      summary
    };
  }
  
  private transformH2HMatches(matches: any[]): any[] {
    // Transform H2H match data into our required format
    return matches.map(match => ({
      id: match.id,
      date: match.date,
      homeTeam: {
        id: match.home_team.id,
        name: match.home_team.name,
        score: match.stats?.home_score || 0
      },
      awayTeam: {
        id: match.away_team.id,
        name: match.away_team.name,
        score: match.stats?.away_score || 0
      },
      venue: match.venue,
      stats: {
        totalGoals: (match.stats?.home_score || 0) + (match.stats?.away_score || 0),
        totalCards: (match.stats?.home_yellow_cards || 0) + (match.stats?.away_yellow_cards || 0) +
                    (match.stats?.home_red_cards || 0) + (match.stats?.away_red_cards || 0),
        totalCorners: (match.stats?.home_corners || 0) + (match.stats?.away_corners || 0)
      }
    }));
  }
  
  private calculateH2HSummary(matches: any[]): any {
    // Calculate H2H summary statistics
    let homeTeamWins = 0;
    let draws = 0;
    let awayTeamWins = 0;
    let totalGoals = 0;
    let totalCards = 0;
    let totalCorners = 0;
    
    matches.forEach(match => {
      const homeScore = match.stats?.home_score || 0;
      const awayScore = match.stats?.away_score || 0;
      
      if (homeScore > awayScore) {
        homeTeamWins++;
      } else if (homeScore < awayScore) {
        awayTeamWins++;
      } else {
        draws++;
      }
      
      totalGoals += homeScore + awayScore;
      totalCards += (match.stats?.home_yellow_cards || 0) + (match.stats?.away_yellow_cards || 0) +
                    (match.stats?.home_red_cards || 0) + (match.stats?.away_red_cards || 0);
      totalCorners += (match.stats?.home_corners || 0) + (match.stats?.away_corners || 0);
    });
    
    const matchCount = matches.length || 1; // Avoid division by zero
    
    return {
      homeTeamWins,
      draws,
      awayTeamWins,
      averageGoals: Math.round((totalGoals / matchCount) * 100) / 100,
      averageCards: Math.round((totalCards / matchCount) * 100) / 100,
      averageCorners: Math.round((totalCorners / matchCount) * 100) / 100
    };
  }
  
  private processLeagueData(leagueData: any, homeTeamId: number, awayTeamId: number): any {
    // Process league data for our analysis
    const homeTeam = leagueData.table.find((team: any) => team.team_id === homeTeamId);
    const awayTeam = leagueData.table.find((team: any) => team.team_id === awayTeamId);
    
    if (!homeTeam || !awayTeam) {
      return null;
    }
    
    return {
      id: leagueData.id,
      name: leagueData.name,
      homeTeamPosition: homeTeam.position,
      awayTeamPosition: awayTeam.position,
      pointsGap: Math.abs(homeTeam.points - awayTeam.points),
      possiblePositionChanges: this.calculatePossiblePositionChanges(leagueData.table, homeTeam, awayTeam),
      leagueAverages: this.calculateLeagueAverages(leagueData),
      homeTeamLeagueForm: {
        home: this.extractTeamLeagueForm(homeTeam, 'home'),
        overall: this.extractTeamLeagueForm(homeTeam, 'overall')
      },
      awayTeamLeagueForm: {
        away: this.extractTeamLeagueForm(awayTeam, 'away'),
        overall: this.extractTeamLeagueForm(awayTeam, 'overall')
      }
    };
  }
  
  private calculatePossiblePositionChanges(table: any[], homeTeam: any, awayTeam: any): any {
    // Simulate position changes based on match outcome
    // This is a placeholder - in reality, you'd need to implement complex logic based on points and goal difference
    return {
      homeTeamWin: { homeTeam: homeTeam.position, awayTeam: awayTeam.position },
      draw: { homeTeam: homeTeam.position, awayTeam: awayTeam.position },
      awayTeamWin: { homeTeam: homeTeam.position, awayTeam: awayTeam.position }
    };
  }
  
  private calculateLeagueAverages(leagueData: any): any {
    // Calculate league averages for various statistics
    return {
      goals: 2.5,  // Placeholder for actual calculation
      cards: 3.2,
      corners: 9.7
    };
  }
  
  private extractTeamLeagueForm(team: any, type: 'home' | 'away' | 'overall'): any {
    // Extract team form based on type (home/away/overall)
    const prefix = type === 'overall' ? '' : `${type}_`;
    
    return {
      wins: team[`${prefix}wins`] || 0,
      draws: team[`${prefix}draws`] || 0,
      losses: team[`${prefix}losses`] || 0,
      goalsFor: team[`${prefix}goals_for`] || 0,
      goalsAgainst: team[`${prefix}goals_against`] || 0
    };
  }
  
  private calculateExpectedStats(
    homeTeamLast10Home: any[],
    awayTeamLast10Away: any[],
    h2hLast10: any[],
    leagueAnalysis: any
  ): any {
    // Calculate expected stats for the upcoming match
    const homeTeamAvgGoalsScored = this.calculateAverageGoalsScored(homeTeamLast10Home, 'home');
    const homeTeamAvgGoalsConceded = this.calculateAverageGoalsConceded(homeTeamLast10Home, 'home');
    const awayTeamAvgGoalsScored = this.calculateAverageGoalsScored(awayTeamLast10Away, 'away');
    const awayTeamAvgGoalsConceded = this.calculateAverageGoalsConceded(awayTeamLast10Away, 'away');
    
    // Simple Poisson model for expected goals
    const homeTeamXG = homeTeamAvgGoalsScored * (awayTeamAvgGoalsConceded / leagueAnalysis.leagueAverages.goals);
    const awayTeamXG = awayTeamAvgGoalsScored * (homeTeamAvgGoalsConceded / leagueAnalysis.leagueAverages.goals);
    
    // Expected corners and cards - simplified calculation
    const xCorners = this.calculateAverageCorners(homeTeamLast10Home, 'home') + 
                     this.calculateAverageCorners(awayTeamLast10Away, 'away');
    
    const xCards = this.calculateAverageCards(homeTeamLast10Home, 'home') + 
                   this.calculateAverageCards(awayTeamLast10Away, 'away');
    
    return {
      xG: {
        homeTeam: Math.round(homeTeamXG * 100) / 100,
        awayTeam: Math.round(awayTeamXG * 100) / 100
      },
      xCorners: Math.round(xCorners * 100) / 100,
      xCards: Math.round(xCards * 100) / 100,
      historicalVariance: {
        goals: 0.2,  // Placeholder - would be calculated from historical data
        corners: 0.15,
        cards: 0.25
      }
    };
  }
  
  private calculateAverageGoalsScored(matches: any[], teamType: 'home' | 'away'): number {
    if (!matches.length) return 0;
    
    const totalGoals = matches.reduce((sum, match) => {
      return sum + (teamType === 'home' ? (match.stats?.home_score || 0) : (match.stats?.away_score || 0));
    }, 0);
    
    return totalGoals / matches.length;
  }
  
  private calculateAverageGoalsConceded(matches: any[], teamType: 'home' | 'away'): number {
    if (!matches.length) return 0;
    
    const totalGoals = matches.reduce((sum, match) => {
      return sum + (teamType === 'home' ? (match.stats?.away_score || 0) : (match.stats?.home_score || 0));
    }, 0);
    
    return totalGoals / matches.length;
  }
  
  private calculateAverageCorners(matches: any[], teamType: 'home' | 'away'): number {
    if (!matches.length) return 0;
    
    const totalCorners = matches.reduce((sum, match) => {
      return sum + (match.stats?.home_corners || 0) + (match.stats?.away_corners || 0);
    }, 0);
    
    return totalCorners / matches.length;
  }
  
  private calculateAverageCards(matches: any[], teamType: 'home' | 'away'): number {
    if (!matches.length) return 0;
    
    const totalCards = matches.reduce((sum, match) => {
      return sum + (match.stats?.home_yellow_cards || 0) + (match.stats?.away_yellow_cards || 0) +
                   (match.stats?.home_red_cards || 0) + (match.stats?.away_red_cards || 0);
    }, 0);
    
    return totalCards / matches.length;
  }
}



export const matchAnalysisService = new MatchAnalysisService();