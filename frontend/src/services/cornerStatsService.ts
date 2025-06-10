import axios from 'axios';
import { CornerStats } from '../types/cornerStats';

// Backend API Configuration - Use same pattern as Card Stats and BTTS
const BACKEND_BASE_URL = 'http://localhost:5000/api';

console.log('[CornerStatsService] Initialized with backend URL:', BACKEND_BASE_URL);

// Simple cache object to store previous API responses
interface CacheItem {
  data: CornerStats;
  timestamp: number;
}

const cornerStatsCache: Record<string, CacheItem> = {};

// Clear cache function
const clearCornerStatsCache = () => {
  Object.keys(cornerStatsCache).forEach(key => delete cornerStatsCache[key]);
  console.log('[CornerStatsService] Cache cleared');
};

// Main function to fetch corner statistics using backend endpoint (like Card Stats)
export const fetchCornerStats = async (matchId: string, gameCount: number = 10): Promise<CornerStats> => {
  try {
    console.log(`[CornerStatsService] Fetching corner stats from backend for match ${matchId} with ${gameCount} games`);

    // Create a cache key based on match ID and game count
    const cacheKey = `${matchId}-${gameCount}`;

    // Check if we have cached data that's less than 1 hour old
    const cachedData = cornerStatsCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
      console.log(`[CornerStatsService] Using cached corner stats data for ${cacheKey}`);
      return cachedData.data;
    }

    console.log(`[CornerStatsService] Making request to backend corner stats endpoint`);

    // Make request to backend corner statistics endpoint (same pattern as Card Stats)
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${matchId}/corners`, {
      params: {
        matches: gameCount
      },
      timeout: 15000
    });

    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend corner statistics endpoint');
    }

    const cornerStats = response.data.result;

    // Cache the result for 1 hour
    cornerStatsCache[cacheKey] = {
      data: cornerStats,
      timestamp: Date.now()
    };

    console.log(`[CornerStatsService] Successfully fetched corner stats from backend for match ${matchId}`);
    return cornerStats;

  } catch (error) {
    console.error('[CornerStatsService] Error fetching corner statistics from backend:', error);
    throw new Error(`Failed to fetch corner statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export the service with clear cache function
export default {
  fetchCornerStats,
  clearCornerStatsCache
};
