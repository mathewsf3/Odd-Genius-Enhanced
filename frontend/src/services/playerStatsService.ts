import axios from 'axios';
import { PlayerStats } from '../types/playerStats';

// Backend API Configuration - Use same pattern as Card Stats and BTTS
const BACKEND_BASE_URL = 'http://localhost:5000/api';

// Cache for player statistics data
interface CachedPlayerStats {
  data: PlayerStats;
  timestamp: number;
}

const playerStatsCache: { [key: string]: CachedPlayerStats } = {};

// Clear cache function
export const clearPlayerStatsCache = () => {
  Object.keys(playerStatsCache).forEach(key => delete playerStatsCache[key]);
  console.log('[PlayerStatsService] Cache cleared');
};

// New backend-based function to fetch player stats using match ID
export const fetchPlayerStatsForMatch = async (matchId: string, gameCount: number = 10): Promise<PlayerStats> => {
  try {
    // Create a cache key based on match ID and game count
    const cacheKey = `match-${matchId}-${gameCount}`;

    // Check if we have cached data that's less than 1 hour old
    const cachedData = playerStatsCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
      console.log(`[PlayerStatsService] Using cached player stats data for match ${matchId} with ${gameCount} games`);
      return cachedData.data;
    }

    console.log(`[PlayerStatsService] Fetching player stats from backend for match ${matchId} with ${gameCount} games`);

    // Make request to backend player statistics endpoint
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${matchId}/players`, {
      params: {
        matches: gameCount
      },
      timeout: 15000 // Same timeout as Card Stats
    });

    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend player statistics endpoint');
    }

    const backendResult = response.data.result;

    // Format the response to match PlayerStats interface
    const result: PlayerStats = {
      homeTeamPlayers: backendResult.homeTeamPlayers,
      awayTeamPlayers: backendResult.awayTeamPlayers,
      topScorers: backendResult.topScorers,
      lineups: backendResult.lineups,
      isFallbackData: false, // Backend only provides real data
      gameCount: gameCount
    };

    // Cache the result
    playerStatsCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };

    console.log(`[PlayerStatsService] Successfully fetched player stats from backend for match ${matchId}`);
    return result;
  } catch (error) {
    console.error('[PlayerStatsService] Error fetching player stats from backend:', error);
    throw error;
  }
};

// Legacy function for backward compatibility - redirects to new backend approach
export const fetchPlayerStats = async (homeTeamId: string, awayTeamId: string, leagueId?: string, gameCount: number | string = 10): Promise<PlayerStats> => {
  // For now, we'll use a hardcoded match ID since we don't have a way to derive it from team IDs
  // In a real implementation, you'd need to look up the match ID from team IDs
  const matchId = '1430878'; // This should be passed from the calling component
  const gameCountNum = typeof gameCount === 'string' ? parseInt(gameCount) : gameCount;

  console.log(`[PlayerStatsService] Legacy function called, redirecting to backend approach for match ${matchId}`);
  return fetchPlayerStatsForMatch(matchId, gameCountNum);
};

export default {
  fetchPlayerStats,
  fetchPlayerStatsForMatch,
  clearPlayerStatsCache
};