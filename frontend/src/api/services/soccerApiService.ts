// src/api/soccerApiService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Your backend API

export interface Match {
  id: string;
  league: {
    id: string;
    name: string;
    logo: string;
  };
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    rating?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    rating?: number;
  };
  date: string;
  time: string;
  status: 'LIVE' | 'NS' | 'FT' | 'HT' | 'CANC';
  elapsed?: number;
  venue: string;
  score?: {
    home: number;
    away: number;
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  probability: {
    home: string;
    draw: string;
    away: string;
  };
  recommended?: 'home' | 'draw' | 'away';
  algorithm?: {
    recommendation: string;
    confidence: number;
    type: string;
  };
  isPromo?: boolean;
}

export interface StatsData {
  roi: {
    daily: Array<{date: string, value: number}>;
    weekly: number;
    monthly: number;
  };
  bets: {
    daily: Array<{date: string, wins: number, losses: number}>;
    totalWins: number;
    totalLosses: number;
    winRate: number;
  };
}

const soccerApiService = {
  getLiveMatches: async (): Promise<Match[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/live`);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  },

  getUpcomingMatches: async (hours = 24): Promise<Match[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/upcoming?hours=${hours}`);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return [];
    }
  },

  getStats: async (period = 'week'): Promise<StatsData> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats?period=${period}`);
      return response.data.result || {
        roi: { daily: [], weekly: 0, monthly: 0 },
        bets: { daily: [], totalWins: 0, totalLosses: 0, winRate: 0 }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        roi: { daily: [], weekly: 0, monthly: 0 },
        bets: { daily: [], totalWins: 0, totalLosses: 0, winRate: 0 }
      };
    }
  }
};

export default soccerApiService;