import axios from 'axios';
import { CardStats } from '../types/cardStats';

// Backend API Configuration
const BACKEND_BASE_URL = 'http://localhost:5000/api';

// Cache for card statistics data
interface CachedCardStats {
  data: CardStats;
  timestamp: number;
}

const cardStatsCache: { [key: string]: CachedCardStats } = {};

// Clear cache function
const clearCardStatsCache = () => {
  Object.keys(cardStatsCache).forEach(key => delete cardStatsCache[key]);
  console.log('[CardStatsService] Cache cleared');
};

// Main function to fetch card statistics from backend
const fetchCardStats = async (matchId: string, gameCount: number = 10): Promise<CardStats> => {
  try {
    // Create a cache key based on match ID and game count
    const cacheKey = `${matchId}-${gameCount}`;

    // Check if we have cached data that's less than 1 hour old
    const cachedData = cardStatsCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < 3600000)) {
      console.log(`[CardStatsService] Using cached card stats data for ${cacheKey}`);
      return cachedData.data;
    }

    console.log(`[CardStatsService] Fetching card stats from backend for match ${matchId} with ${gameCount} games`);

    // Make request to backend card statistics endpoint
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${matchId}/cards`, {
      params: {
        matches: gameCount
      },
      timeout: 15000
    });

    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend card statistics endpoint');
    }

    const backendResult = response.data.result;

    // Transform backend response to match frontend CardStats interface
    const result: CardStats = {
      homeStats: {
        teamId: backendResult.homeStats.teamId,
        totalYellowCards: backendResult.homeStats.totalYellowCards,
        totalRedCards: backendResult.homeStats.totalRedCards,
        totalCards: backendResult.homeStats.totalCards,
        averageYellowCardsPerMatch: backendResult.homeStats.averageYellowCardsPerMatch,
        averageRedCardsPerMatch: backendResult.homeStats.averageRedCardsPerMatch,
        averageCardsPerMatch: backendResult.homeStats.averageCardsPerMatch,
        cardsByPeriod: backendResult.homeStats.cardsByPeriod,
        mostCardedPlayers: backendResult.homeStats.mostCardedPlayers,
        overRates: backendResult.homeStats.overRates
      },
      awayStats: {
        teamId: backendResult.awayStats.teamId,
        totalYellowCards: backendResult.awayStats.totalYellowCards,
        totalRedCards: backendResult.awayStats.totalRedCards,
        totalCards: backendResult.awayStats.totalCards,
        averageYellowCardsPerMatch: backendResult.awayStats.averageYellowCardsPerMatch,
        averageRedCardsPerMatch: backendResult.awayStats.averageRedCardsPerMatch,
        averageCardsPerMatch: backendResult.awayStats.averageCardsPerMatch,
        cardsByPeriod: backendResult.awayStats.cardsByPeriod,
        mostCardedPlayers: backendResult.awayStats.mostCardedPlayers,
        overRates: backendResult.awayStats.overRates
      },
      combinedStats: backendResult.combinedStats,
      isFallbackData: false // Backend only provides real data
    };

    // Cache the result
    cardStatsCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };

    console.log(`[CardStatsService] Successfully fetched card stats from backend for match ${matchId}`);
    console.log(`[CardStatsService] Home team: ${result.homeStats.totalCards} cards, Away team: ${result.awayStats.totalCards} cards`);
    console.log(`[CardStatsService] Combined average: ${result.combinedStats.averageCardsPerMatch.toFixed(2)} cards per match`);

    return result;
  } catch (error) {
    console.error('[CardStatsService] Error fetching card stats from backend:', error);
    throw error;
  }
};

export default {
  fetchCardStats,
  clearCardStatsCache
};
