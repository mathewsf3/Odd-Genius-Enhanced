import axios from 'axios';
import { BTTSStats } from '../types/bttsStats';

// Backend API Configuration
const BACKEND_BASE_URL = 'http://localhost:5000/api';

// Cache for BTTS statistics data
interface CachedBTTSStats {
  data: BTTSStats;
  timestamp: number;
}

const bttsStatsCache: { [key: string]: CachedBTTSStats } = {};

// Clear cache function
const clearBTTSStatsCache = () => {
  Object.keys(bttsStatsCache).forEach(key => delete bttsStatsCache[key]);
  console.log('[BTTSStatsService] Cache cleared');
};

// Main function to fetch BTTS statistics from backend
const fetchBTTSStats = async (matchId: string, gameCount: number = 10): Promise<BTTSStats> => {
  try {
    // Create a cache key based on match ID and game count
    const cacheKey = `${matchId}-${gameCount}`;

    // Check if we have cached data that's less than 1 hour old
    const cachedData = bttsStatsCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
      console.log(`[BTTSStatsService] Using cached BTTS stats data for ${cacheKey}`);
      return cachedData.data;
    }

    console.log(`[BTTSStatsService] Fetching BTTS stats from backend for match ${matchId} with ${gameCount} games`);

    // Make request to backend BTTS statistics endpoint
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${matchId}/btts`, {
      params: {
        matches: gameCount
      },
      timeout: 15000
    });

    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend BTTS statistics endpoint');
    }

    const backendResult = response.data.result;

    // Transform backend response to match frontend BTTSStats interface
    const result: BTTSStats = {
      homeStats: backendResult.homeStats,
      awayStats: backendResult.awayStats,
      h2hStats: backendResult.h2hStats,
      combinedStats: backendResult.combinedStats,
      isFallbackData: false // Backend only provides real data
    };

    // Cache the result
    bttsStatsCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };

    console.log(`[BTTSStatsService] Successfully fetched BTTS stats from backend for match ${matchId}`);
    console.log(`[BTTSStatsService] Home team: ${result.homeStats.bttsYesPercentage}% BTTS, Away team: ${result.awayStats.bttsYesPercentage}% BTTS`);
    console.log(`[BTTSStatsService] Combined prediction: ${result.combinedStats.prediction}`);

    return result;
  } catch (error) {
    console.error('[BTTSStatsService] Error fetching BTTS stats from backend:', error);
    throw error;
  }
};

export default {
  fetchBTTSStats,
  clearBTTSStatsCache
};
