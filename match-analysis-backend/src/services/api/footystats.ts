import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import config from '../../config/config';
import logger from '../../utils/logger';
import cacheService from '../cache/redis';
import { HistoricalMatch, Team, League, Referee } from '../../models/Match';

export interface FootyStatsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FootyStatsMatch {
  id: number;
  date: string;
  status: string;
  home_team: FootyStatsTeam;
  away_team: FootyStatsTeam;
  league: FootyStatsLeague;
  venue?: string;
  referee?: string;
  stats?: FootyStatsMatchStats;
  result?: {
    home_score: number;
    away_score: number;
    ht_score?: string;
  };
}

export interface FootyStatsTeam {
  id: number;
  name: string;
  short_name?: string;
  logo?: string;
  country?: string;
}

export interface FootyStatsLeague {
  id: number;
  name: string;
  country: string;
  season: string;
  logo?: string;
}

export interface FootyStatsMatchStats {
  corners?: {
    home: number;
    away: number;
    total: number;
    ht?: {
      home: number;
      away: number;
      total: number;
    };
  };
  cards?: {
    yellow_cards: {
      home: number;
      away: number;
      total: number;
    };
    red_cards: {
      home: number;
      away: number;
      total: number;
    };
    total_cards: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals?: {
    home: number;
    away: number;
    total: number;
  };
  xg?: {
    home: number;
    away: number;
    total: number;
  };
}

export interface TeamFormRequest {
  teamId: number;
  matchType: 'home' | 'away' | 'all';
  limit: number;
  leagueId?: number;
  season?: string;
}

export interface HeadToHeadRequest {
  homeTeamId: number;
  awayTeamId: number;
  limit: number;
}

class FootyStatsService {
  private api: AxiosInstance;
  private rateLimitCounter: Map<string, number> = new Map();
  private rateLimitReset: Map<string, number> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: config.api.footystats.baseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }  private setupInterceptors(): void {
    // Request interceptor for API key and rate limiting
    this.api.interceptors.request.use(
      async (requestConfig: InternalAxiosRequestConfig) => {
        // Add API key
        requestConfig.params = {
          ...requestConfig.params,
          key: config.api.footystats.key,
        };

        // Check rate limiting
        await this.checkRateLimit();

        logger.debug(`FootyStats API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
          params: requestConfig.params,
        });

        return requestConfig;
      },
      (error) => {
        logger.error('FootyStats API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug(`FootyStats API Response: ${response.status} ${response.config.url}`);
        this.updateRateLimit(response);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`FootyStats API Error: ${error.response.status} ${error.response.statusText}`, {
            url: error.config?.url,
            data: error.response.data,
          });
        } else {
          logger.error('FootyStats API Network Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const currentCount = this.rateLimitCounter.get(minute.toString()) || 0;

    if (currentCount >= config.api.footystats.rateLimit.requestsPerMinute) {
      const waitTime = 60000 - (now % 60000);
      logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.rateLimitCounter.set(minute.toString(), currentCount + 1);
  }

  private updateRateLimit(response: AxiosResponse): void {
    const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
    const rateLimitReset = response.headers['x-ratelimit-reset'];

    if (rateLimitRemaining !== undefined) {
      logger.debug(`Rate limit remaining: ${rateLimitRemaining}`);
    }

    if (rateLimitReset !== undefined) {
      const resetTime = parseInt(rateLimitReset) * 1000;
      this.rateLimitReset.set('current', resetTime);
    }
  }

  async getTeamMatches(request: TeamFormRequest): Promise<HistoricalMatch[]> {
    const cacheKey = `team_matches_${request.teamId}_${request.matchType}_${request.limit}_${request.leagueId || 'all'}`;
    
    // Check cache first
    const cached = await cacheService.get<HistoricalMatch[]>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for team matches: ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.api.get('/team/matches', {
        params: {
          team_id: request.teamId,
          match_type: request.matchType,
          limit: request.limit,
          league_id: request.leagueId,
          season: request.season,
          include_stats: true,
        },
      });

      const matches = this.transformMatches(response.data.matches || []);
      
      // Cache for 15 minutes
      await cacheService.set(cacheKey, matches, 900);
      
      logger.info(`Fetched ${matches.length} matches for team ${request.teamId}`);
      return matches;
    } catch (error) {
      logger.error(`Failed to fetch team matches for team ${request.teamId}:`, error);
      throw error;
    }
  }

  async getHeadToHeadMatches(request: HeadToHeadRequest): Promise<HistoricalMatch[]> {
    const cacheKey = `h2h_${request.homeTeamId}_${request.awayTeamId}_${request.limit}`;
    
    // Check cache first
    const cached = await cacheService.get<HistoricalMatch[]>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for H2H matches: ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.api.get('/head-to-head', {
        params: {
          home_team_id: request.homeTeamId,
          away_team_id: request.awayTeamId,
          limit: request.limit,
          include_stats: true,
        },
      });

      const matches = this.transformMatches(response.data.matches || []);
      
      // Cache for 30 minutes
      await cacheService.set(cacheKey, matches, 1800);
      
      logger.info(`Fetched ${matches.length} H2H matches between teams ${request.homeTeamId} and ${request.awayTeamId}`);
      return matches;
    } catch (error) {
      logger.error(`Failed to fetch H2H matches:`, error);
      throw error;
    }
  }

  async getLeagueStandings(leagueId: number, season?: string): Promise<any[]> {
    const cacheKey = `league_standings_${leagueId}_${season || 'current'}`;
    
    // Check cache first
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for league standings: ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.api.get('/league/standings', {
        params: {
          league_id: leagueId,
          season,
        },
      });

      const standings = response.data.standings || [];
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, standings, 3600);
      
      logger.info(`Fetched standings for league ${leagueId}`);
      return standings;
    } catch (error) {
      logger.error(`Failed to fetch league standings for league ${leagueId}:`, error);
      throw error;
    }
  }

  async getRefereeStats(refereeId: number): Promise<any> {
    const cacheKey = `referee_stats_${refereeId}`;
    
    // Check cache first
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for referee stats: ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.api.get('/referee/stats', {
        params: {
          referee_id: refereeId,
        },
      });

      const stats = response.data;
      
      // Cache for 24 hours
      await cacheService.set(cacheKey, stats, 86400);
      
      logger.info(`Fetched stats for referee ${refereeId}`);
      return stats;
    } catch (error) {
      logger.error(`Failed to fetch referee stats for referee ${refereeId}:`, error);
      throw error;
    }
  }

  async getLeagueAverages(leagueId: number, season?: string): Promise<any> {
    const cacheKey = `league_averages_${leagueId}_${season || 'current'}`;
    
    // Check cache first
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for league averages: ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.api.get('/league/averages', {
        params: {
          league_id: leagueId,
          season,
        },
      });

      const averages = response.data;
      
      // Cache for 4 hours
      await cacheService.set(cacheKey, averages, 14400);
      
      logger.info(`Fetched averages for league ${leagueId}`);
      return averages;
    } catch (error) {
      logger.error(`Failed to fetch league averages for league ${leagueId}:`, error);
      throw error;
    }
  }

  private transformMatches(footyStatsMatches: FootyStatsMatch[]): HistoricalMatch[] {
    return footyStatsMatches.map(match => this.transformMatch(match));
  }

  private transformMatch(footyStatsMatch: FootyStatsMatch): HistoricalMatch {
    return {
      id: footyStatsMatch.id,
      homeTeam: this.transformTeam(footyStatsMatch.home_team),
      awayTeam: this.transformTeam(footyStatsMatch.away_team),
      league: this.transformLeague(footyStatsMatch.league),
      date: footyStatsMatch.date,
      status: this.normalizeStatus(footyStatsMatch.status),
      venue: footyStatsMatch.venue,
      referee: footyStatsMatch.referee ? { name: footyStatsMatch.referee } : undefined,
      season: footyStatsMatch.league.season,
      result: footyStatsMatch.result ? {
        homeScore: footyStatsMatch.result.home_score,
        awayScore: footyStatsMatch.result.away_score,
        totalGoals: footyStatsMatch.result.home_score + footyStatsMatch.result.away_score,
        halfTimeScore: footyStatsMatch.result.ht_score ? this.parseHalfTimeScore(footyStatsMatch.result.ht_score) : undefined,
      } : {
        homeScore: 0,
        awayScore: 0,
        totalGoals: 0,
      },
      statistics: this.transformStatistics(footyStatsMatch.stats),
    };
  }

  private transformTeam(footyStatsTeam: FootyStatsTeam): Team {
    return {
      id: footyStatsTeam.id,
      name: footyStatsTeam.name,
      shortName: footyStatsTeam.short_name,
      logo: footyStatsTeam.logo,
      country: footyStatsTeam.country || '',
      league: {
        id: 0,
        name: '',
        country: footyStatsTeam.country || '',
        season: '',
      },
    };
  }

  private transformLeague(footyStatsLeague: FootyStatsLeague): League {
    return {
      id: footyStatsLeague.id,
      name: footyStatsLeague.name,
      country: footyStatsLeague.country,
      season: footyStatsLeague.season,
      logo: footyStatsLeague.logo,
    };
  }

  private normalizeStatus(status: string): 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('finished') || lowerStatus.includes('ft')) return 'finished';
    if (lowerStatus.includes('live') || lowerStatus.includes('playing')) return 'live';
    if (lowerStatus.includes('postponed')) return 'postponed';
    if (lowerStatus.includes('cancelled') || lowerStatus.includes('canceled')) return 'cancelled';
    return 'scheduled';
  }

  private parseHalfTimeScore(htScore: string): { home: number; away: number } {
    const parts = htScore.split('-');
    return {
      home: parseInt(parts[0] || '0', 10),
      away: parseInt(parts[1] || '0', 10),
    };
  }

  private transformStatistics(stats?: FootyStatsMatchStats): any {
    if (!stats) {
      return {
        corners: { home: 0, away: 0, total: 0 },
        cards: {
          yellow: { home: 0, away: 0, total: 0 },
          red: { home: 0, away: 0, total: 0 },
          total: { home: 0, away: 0, total: 0 },
        },
      };
    }

    return {
      corners: {
        home: stats.corners?.home || 0,
        away: stats.corners?.away || 0,
        total: stats.corners?.total || 0,
        firstHalf: stats.corners?.ht ? {
          home: stats.corners.ht.home,
          away: stats.corners.ht.away,
          total: stats.corners.ht.total,
        } : undefined,
      },
      cards: {
        yellow: {
          home: stats.cards?.yellow_cards.home || 0,
          away: stats.cards?.yellow_cards.away || 0,
          total: stats.cards?.yellow_cards.total || 0,
        },
        red: {
          home: stats.cards?.red_cards.home || 0,
          away: stats.cards?.red_cards.away || 0,
          total: stats.cards?.red_cards.total || 0,
        },
        total: {
          home: stats.cards?.total_cards.home || 0,
          away: stats.cards?.total_cards.away || 0,
          total: stats.cards?.total_cards.total || 0,
        },
      },
      xG: stats.xg ? {
        home: stats.xg.home,
        away: stats.xg.away,
        total: stats.xg.total,
      } : undefined,
    };
  }
}

export default new FootyStatsService();
