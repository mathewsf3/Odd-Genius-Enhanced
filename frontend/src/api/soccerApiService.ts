// Fixed and optimized implementation of soccerApiService

import axios from 'axios';
import { memoryCache } from './apiClient';
import { Match, Team, League, Score, Odds, Statistics, StatsData, BettingPerformance, Algorithm } from '../types/interfaces';

// Re-export interfaces for backward compatibility
export type { Match, Team, League, Score, Odds, Statistics, StatsData, BettingPerformance, Algorithm };

// Cache TTLs in milliseconds
export const CACHE_TTL = {
  LIVE_MATCHES: 30 * 1000,        // 30 seconds for live matches
  UPCOMING_MATCHES: 5 * 60 * 1000, // 5 minutes for upcoming matches
  MATCH_DETAILS: 60 * 1000,       // 60 seconds for match details
  STATS: 30 * 60 * 1000,          // 30 minutes for stats
  PREMIUM_PICKS: 10 * 60 * 1000,  // 10 minutes for premium picks
  PREMATCH_ANALYSIS: 5 * 60 * 1000 // 5 minutes for pre-match analysis
};

class SoccerApiService {
  private baseUrl: string;

  constructor() {
    // Use backend API
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  private getCacheKey(prefix: string, id: string): string {
    return `${prefix}-${id}`;
  }

  async getMatchDetails(matchId: string): Promise<Match | null> {
    try {
      const cacheKey = this.getCacheKey('match', matchId);
      const cachedData = memoryCache.get<Match | undefined>(cacheKey, CACHE_TTL.MATCH_DETAILS);
      if (cachedData) {
        console.log('Using cached match details for', matchId);
        return cachedData;
      }

      // Try to get complete data first (includes all analysis data)
      try {
        console.log('Trying to fetch complete match details for', matchId);
        const completeResponse = await fetch(`${this.baseUrl}/matches/${matchId}/complete`);
        if (completeResponse.ok) {
          const completeData = await completeResponse.json();
          if (completeData.success && completeData.result) {
            console.log('Successfully fetched complete match details for', matchId);
            const match = completeData.result as Match;
            memoryCache.set(cacheKey, match);
            return match;
          }
        }
      } catch (error) {
        console.log('Error fetching complete match details, falling back to basic data', error);
      }

      // Fall back to basic match details if complete data fails
      console.log('Fetching basic match details for', matchId);
      const response = await fetch(`${this.baseUrl}/matches/${matchId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch match details');
      }

      const data = await response.json();
      if (!data.success || !data.result) {
        return null;
      }

      const match = data.result as Match;
      memoryCache.set(cacheKey, match);
      return match;
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error);
      return null;
    }
  }

  async getLiveMatches(): Promise<Match[]> {
    try {
      const cacheKey = 'live-matches';
      const cachedData = memoryCache.get<Match[] | undefined>(cacheKey, CACHE_TTL.LIVE_MATCHES);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/matches/live`);
      const matches = response.data.result || [];
      memoryCache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  async getUpcomingMatches(hours: number = 24): Promise<Match[]> {
    try {
      const cacheKey = this.getCacheKey('upcoming-matches', hours.toString());
      const cachedData = memoryCache.get<Match[] | undefined>(cacheKey, CACHE_TTL.UPCOMING_MATCHES);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/matches/upcoming?hours=${hours}`);
      const matches = response.data.result || [];
      memoryCache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return [];
    }
  }

  async getPreMatchAnalysis(matchId: string): Promise<StatsData | null> {
    try {
      const cacheKey = this.getCacheKey('pre-match-analysis', matchId);
      const cachedData = memoryCache.get<StatsData | undefined>(cacheKey, CACHE_TTL.PREMATCH_ANALYSIS);
      if (cachedData) {
        console.log('Using cached match analysis data');
        return cachedData;
      }

      console.log(`Fetching match analysis for ID: ${matchId}`);

      const response = await fetch(`${this.baseUrl}/analysis/matches/${matchId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch match analysis');
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        console.error('Unexpected data format:', data);
        return null;
      }

      const statsData = data.result as StatsData;
      memoryCache.set(cacheKey, statsData);
      return statsData;
    } catch (error) {
      console.error(`Error fetching pre-match analysis for match ${matchId}:`, error);
      return null;
    }
  }

  async getHeadToHead(team1Id: string, team2Id: string): Promise<Match[] | null> {
    try {
      const cacheKey = this.getCacheKey('h2h', `${team1Id}-${team2Id}`);
      const cachedData = memoryCache.get<Match[] | undefined>(cacheKey, CACHE_TTL.STATS);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/analysis/h2h/${team1Id}/${team2Id}`);
      const matches = response.data.result || [];
      memoryCache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching head-to-head matches:', error);
      return null;
    }
  }

  async getStats(period: string = 'all'): Promise<StatsData | null> {
    try {
      const cacheKey = this.getCacheKey('stats', period);
      const cachedData = memoryCache.get<StatsData | undefined>(cacheKey, CACHE_TTL.STATS);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/stats?period=${period}`);
      const stats = response.data.result || null;
      if (stats) {
        memoryCache.set(cacheKey, stats);
      }
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }

  async getPremiumPicks(): Promise<Match[]> {
    try {
      const cacheKey = 'premium-picks';
      const cachedData = memoryCache.get<Match[] | undefined>(cacheKey, CACHE_TTL.PREMIUM_PICKS);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/matches/premium-picks`);
      const picks = response.data.result || [];
      memoryCache.set(cacheKey, picks);
      return picks;
    } catch (error) {
      console.error('Error fetching premium picks:', error);
      return [];
    }
  }

  async getBettingPerformance(period: string = 'week'): Promise<BettingPerformance[]> {
    try {
      const cacheKey = this.getCacheKey('betting-performance', period);
      const cachedData = memoryCache.get<BettingPerformance[] | undefined>(cacheKey, CACHE_TTL.STATS);
      if (cachedData) {
        return cachedData;
      }

      const response = await axios.get(`${this.baseUrl}/stats/performance?period=${period}`);
      const performance = response.data.result || [];
      memoryCache.set(cacheKey, performance);
      return performance;
    } catch (error) {
      console.error('Error fetching betting performance:', error);
      return [];
    }
  }
}

export default new SoccerApiService();
