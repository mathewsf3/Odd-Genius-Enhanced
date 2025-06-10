import axios from 'axios';
import { API_KEY } from '../config/api-config';

// Base URL for the API
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

// Types for league standings
export interface TeamStanding {
  standing_place: string;
  standing_place_type: string | null;
  standing_team: string;
  standing_P: string; // Matches played
  standing_W: string; // Wins
  standing_D: string; // Draws
  standing_L: string; // Losses
  standing_F: string; // Goals for
  standing_A: string; // Goals against
  standing_GD: string; // Goal difference
  standing_PTS: string; // Points
  team_key: string;
  league_key: string;
  league_season: string;
  league_round: string;
  standing_updated: string;
  fk_stage_key: string;
  stage_name: string;
}

export interface LeagueStandings {
  total: TeamStanding[];
  home: TeamStanding[];
  away: TeamStanding[];
}

export interface FormattedTeamStanding {
  position: number;
  team: {
    id: string;
    name: string;
    logo?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[]; // Last 5 matches: W, L, D
  homeTeamId?: string; // To highlight the home team
  awayTeamId?: string; // To highlight the away team
}

export interface FormattedLeagueStandings {
  league: {
    id: string;
    name: string;
    logo?: string;
    country?: string;
    season?: string;
  };
  standings: FormattedTeamStanding[];
  message?: string; // For competitions without traditional standings
  error?: string; // For error cases
}

// Cache for league standings data to reduce API calls
const leagueStandingsCache: { [key: string]: { data: FormattedLeagueStandings; timestamp: number } } = {};

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Clear cache function
export const clearLeagueStandingsCache = () => {
  Object.keys(leagueStandingsCache).forEach(key => {
    delete leagueStandingsCache[key];
  });
  console.log('[LeagueService] Cache cleared');
};

// Format team standings data
const formatTeamStandings = (
  standings: TeamStanding[],
  homeTeamId?: string,
  awayTeamId?: string
): FormattedTeamStanding[] => {
  return standings.map(standing => ({
    position: parseInt(standing.standing_place),
    team: {
      id: standing.team_key,
      name: standing.standing_team,
      logo: `https://apiv2.allsportsapi.com/logo/${standing.team_key}_${standing.standing_team.toLowerCase().replace(/\s+/g, '-')}.png`
    },
    played: parseInt(standing.standing_P),
    won: parseInt(standing.standing_W),
    drawn: parseInt(standing.standing_D),
    lost: parseInt(standing.standing_L),
    goalsFor: parseInt(standing.standing_F),
    goalsAgainst: parseInt(standing.standing_A),
    goalDifference: parseInt(standing.standing_GD),
    points: parseInt(standing.standing_PTS),
    form: [], // We don't have form data from the API
    homeTeamId: homeTeamId,
    awayTeamId: awayTeamId
  }));
};

// Fetch league standings from the API
const fetchLeagueStandings = async (
  leagueId: string,
  homeTeamId?: string,
  awayTeamId?: string,
  matchId?: string,
  signal?: AbortSignal
): Promise<FormattedLeagueStandings | null> => {
  try {
    console.log(`[LeagueService] Fetching standings for league ${leagueId} via backend`);

    // Check cache first
    const cacheKey = `league_${leagueId}`;
    const cachedData = leagueStandingsCache[cacheKey];

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
      console.log(`[LeagueService] Using cached data for league ${leagueId}`);
      return cachedData.data;
    }

    // Use backend API instead of direct AllSportsAPI call to eliminate duplicate loading
    const backendUrl = `http://localhost:5000/api/leagues/${leagueId}/standings`;
    console.log(`[LeagueService] Making backend API request to: ${backendUrl}`);

    // Build query parameters
    const params: any = {};
    if (matchId) {
      params.matchId = matchId;
      console.log(`[LeagueService] Including match ID in request: ${matchId}`);
    }

    const response = await axios.get(backendUrl, {
      params,
      signal,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if the backend response is valid
    if (!response.data || !response.data.success) {
      console.error('[LeagueService] Invalid backend response:', response.data);
      return null;
    }

    // Handle case where backend returns success but no result (API error)
    if (!response.data.result) {
      console.warn('[LeagueService] Backend returned success but no result data for league', leagueId);
      return null;
    }

    const backendData = response.data.result;

    // Check if we have standings data
    if (!backendData.standings || backendData.standings.length === 0) {
      console.warn(`[LeagueService] No standings data available for league ${leagueId}:`, backendData.message || 'Unknown reason');

      // Return a structured response for competitions without standings
      return {
        league: {
          id: backendData.league?.id || leagueId,
          name: backendData.league?.name || 'Competition',
          logo: backendData.league?.logo,
          country: backendData.league?.country,
          season: backendData.league?.season
        },
        standings: [],
        message: backendData.message || 'No standings data available for this competition.'
      };
    }

    // Format the standings data with dynamic team logos
    const formattedStandings: FormattedLeagueStandings = {
      league: {
        id: backendData.league?.id || leagueId,
        name: backendData.league?.name || 'League Standings',
        logo: backendData.league?.logo,
        country: backendData.league?.country,
        season: backendData.league?.season
      },
      standings: backendData.standings.map((standing: any) => ({
        position: standing.position,
        team: {
          id: standing.team.id,
          name: standing.team.name,
          logo: standing.team.logo // Use dynamic logo from backend
        },
        played: standing.played,
        won: standing.won,
        drawn: standing.drawn,
        lost: standing.lost,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDifference: standing.goalDifference,
        points: standing.points,
        form: standing.form || [],
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId
      }))
    };

    // Cache the formatted data
    leagueStandingsCache[cacheKey] = {
      data: formattedStandings,
      timestamp: Date.now()
    };

    console.log(`[LeagueService] Successfully fetched and cached standings for league ${leagueId}`);
    return formattedStandings;
  } catch (error) {
    console.error('[LeagueService] Error fetching league standings:', error);
    return null;
  }
};

// Export the service
const leagueService = {
  fetchLeagueStandings,
  clearLeagueStandingsCache
};

export default leagueService;
