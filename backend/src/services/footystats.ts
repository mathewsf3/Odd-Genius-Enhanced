import axios from 'axios';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export class FootyStatsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  
  constructor() {
    this.apiKey = config.FOOTYSTATS_API_KEY;
    this.baseUrl = 'https://api.footystats.org/';
  }
  
  async getUpcomingMatches(leagueId?: number): Promise<any> {
    try {
      const url = `${this.baseUrl}upcoming-matches`;
      const params = {
        key: this.apiKey,
        include: 'stats,league',
        ...(leagueId && { league_id: leagueId })
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching upcoming matches', error);
      throw error;
    }
  }
  
  async getMatchDetails(matchId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}match/${matchId}`;
      const params = {
        key: this.apiKey,
        include: 'stats,events,lineups,h2h'
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching match details for match ${matchId}`, error);
      throw error;
    }
  }
  
  async getTeamMatches(teamId: number, last: number = 10): Promise<any> {
    try {
      const url = `${this.baseUrl}team/${teamId}/matches`;
      const params = {
        key: this.apiKey,
        include: 'stats,events',
        last: last
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching team matches for team ${teamId}`, error);
      throw error;
    }
  }
  
  async getTeamHomeMatches(teamId: number, last: number = 10): Promise<any> {
    try {
      const url = `${this.baseUrl}team/${teamId}/matches/home`;
      const params = {
        key: this.apiKey,
        include: 'stats,events',
        last: last
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching team home matches for team ${teamId}`, error);
      throw error;
    }
  }
  
  async getTeamAwayMatches(teamId: number, last: number = 10): Promise<any> {
    try {
      const url = `${this.baseUrl}team/${teamId}/matches/away`;
      const params = {
        key: this.apiKey,
        include: 'stats,events',
        last: last
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching team away matches for team ${teamId}`, error);
      throw error;
    }
  }
  
  async getHeadToHead(teamId1: number, teamId2: number, last: number = 10): Promise<any> {
    try {
      const url = `${this.baseUrl}h2h/${teamId1}/${teamId2}`;
      const params = {
        key: this.apiKey,
        include: 'stats,events',
        last: last
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching H2H for teams ${teamId1} and ${teamId2}`, error);
      throw error;
    }
  }
  
  async getRefereeStats(refereeId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}referee/${refereeId}`;
      const params = {
        key: this.apiKey,
        include: 'stats,matches'
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching referee stats for referee ${refereeId}`, error);
      throw error;
    }
  }
  
  async getLeagueTable(leagueId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}league/${leagueId}/table`;
      const params = {
        key: this.apiKey,
        include: 'stats'
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching league table for league ${leagueId}`, error);
      throw error;
    }
  }
  
  async getPlayerStats(playerId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}player/${playerId}`;
      const params = {
        key: this.apiKey,
        include: 'stats,matches'
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching player stats for player ${playerId}`, error);
      throw error;
    }
  }
}

export const footyStatsClient = new FootyStatsClient();