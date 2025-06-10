/**
 * FootyStats API Service
 * Comprehensive football data API with everything package
 * Documentation: https://footystats.org/api/documentations/
 */

const axios = require('axios');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.football-data-api.com',
  API_KEY: process.env.FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756',
  RATE_LIMIT: 150, // ms between requests
  MAX_RETRIES: 3,
  TIMEOUT: 10000
};

// Cache configuration
const CACHE_KEYS = {
  MATCH_DETAILS: 'footystats-match-details',
  LEAGUE_MATCHES: 'footystats-league-matches',
  TODAY_MATCHES: 'footystats-today-matches',
  TEAM_STATS: 'footystats-team-stats',
  LEAGUE_PLAYERS: 'footystats-league-players',
  PLAYER_STATS: 'footystats-player-stats',
  BTTS_STATS: 'footystats-btts-stats',
  OVER25_STATS: 'footystats-over25-stats',
  LEAGUE_LIST: 'footystats-league-list'
};

const CACHE_TTL = {
  MATCH_DETAILS: 2 * 60 * 1000,    // 2 minutes
  LEAGUE_MATCHES: 5 * 60 * 1000,   // 5 minutes
  TODAY_MATCHES: 30 * 1000,        // 30 seconds
  TEAM_STATS: 10 * 60 * 1000,      // 10 minutes
  STATS: 15 * 60 * 1000,           // 15 minutes
  LEAGUE_LIST: 60 * 60 * 1000      // 1 hour
};

// Rate limiting
let lastRequestTime = 0;

/**
 * Rate-limited API request with retry logic
 */
const makeApiRequest = async (endpoint, params = {}, retries = 0) => {
  try {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < API_CONFIG.RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RATE_LIMIT - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    // Add API key to params
    const requestParams = {
      key: API_CONFIG.API_KEY,
      ...params
    };

    logger.info(`FootyStats API request: ${endpoint}`, { 
      service: 'footystats-api',
      params: requestParams 
    });

    const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
      params: requestParams,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'User-Agent': 'OddGenius/1.0',
        'Accept': 'application/json'
      }
    });

    if (response.data) {
      logger.info(`FootyStats API success: ${endpoint}`, { 
        service: 'footystats-api',
        dataSize: JSON.stringify(response.data).length 
      });
      return response.data;
    }

    throw new Error('No data received from FootyStats API');

  } catch (error) {
    logger.error(`FootyStats API error: ${endpoint}`, { 
      service: 'footystats-api',
      error: error.message,
      retries,
      params
    });

    // Retry logic
    if (retries < API_CONFIG.MAX_RETRIES && error.response?.status !== 404) {
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff
      logger.info(`Retrying FootyStats API request in ${delay}ms`, { 
        service: 'footystats-api',
        endpoint,
        retries: retries + 1
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(endpoint, params, retries + 1);
    }

    throw error;
  }
};

/**
 * Cached API request wrapper
 */
const cachedApiRequest = async (endpoint, params, cacheKey, cacheTTL) => {
  if (cacheKey && cacheTTL) {
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`Returning cached FootyStats data: ${cacheKey}`, { service: 'footystats-api' });
      return cached;
    }
  }

  const data = await makeApiRequest(endpoint, params);
  
  if (cacheKey && cacheTTL && data) {
    cache.set(cacheKey, data, cacheTTL);
    logger.info(`Cached FootyStats data: ${cacheKey}`, { service: 'footystats-api' });
  }

  return data;
};

/**
 * Get comprehensive match details including stats, H2H, odds, lineups
 */
const getMatchDetails = async (matchId) => {
  try {
    const cacheKey = `${CACHE_KEYS.MATCH_DETAILS}-${matchId}`;

    const data = await cachedApiRequest(
      '/match',
      { match_id: matchId },
      cacheKey,
      CACHE_TTL.MATCH_DETAILS
    );

    return transformMatchDetails(data);
  } catch (error) {
    logger.error(`Error fetching FootyStats match details for ${matchId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get match by ID (alias for getMatchDetails)
 */
const getMatchById = async (matchId, options = {}) => {
  return await getMatchDetails(matchId, options);
};

/**
 * Get matches for a specific league
 */
const getLeagueMatches = async (leagueId, options = {}) => {
  try {
    const { season = null, date = null, status = null } = options;
    
    logger.info(`Getting league matches for league ${leagueId}`, { 
      service: 'footystats',
      leagueId,
      season,
      date,
      status
    });

    const params = {
      key: API_CONFIG.API_KEY,
      action: 'get_events',
      league_id: leagueId
    };

    if (season) params.season = season;
    if (date) params.date = date;
    if (status) params.status = status;

    const response = await cachedApiRequest(
      '',
      params,
      `${CACHE_KEYS.LEAGUE_MATCHES}_${leagueId}`,
      CACHE_TTL.LEAGUE_MATCHES
    );

    if (!response || !response.data) {
      logger.warn('No league matches data received from FootyStats API', { service: 'footystats', leagueId });
      return { success: false, data: [], message: 'No league matches data available' };
    }

    // Transform matches if needed
    const matches = Array.isArray(response.data) ? response.data : [];
    
    logger.info(`Retrieved ${matches.length} matches for league ${leagueId}`, { service: 'footystats' });

    return {
      success: true,
      data: matches,
      count: matches.length
    };
  } catch (error) {
    logger.error(`Error fetching league matches for ${leagueId}:`, error);
    throw error;
  }
};

/**
 * Clear all FootyStats cache
 */
const clearCache = () => {
  try {
    // Clear all FootyStats-related cache entries
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      cache.del(cacheKey);
      // Also clear variations with IDs/parameters
      const keys = cache.keys();
      keys.forEach(key => {
        if (key.includes(cacheKey)) {
          cache.del(key);
        }
      });
    });

    logger.info('FootyStats cache cleared successfully', { service: 'footystats' });
    return { success: true, message: 'FootyStats cache cleared' };
  } catch (error) {
    logger.error('Error clearing FootyStats cache:', error);
    throw error;
  }
};

/**
 * Get comprehensive team statistics with season data
 */
const getTeamStats = async (teamId, includeStats = true) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-${teamId}`;

    const params = { team_id: teamId };
    if (includeStats) {
      params.include = 'stats';
    }

    const data = await cachedApiRequest(
      '/team',
      params,
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats team stats for ${teamId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get team's last X matches statistics (5, 10, 20)
 */
const getTeamLastXStats = async (teamId) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-lastx-${teamId}`;

    const data = await cachedApiRequest(
      '/lastx',
      { team_id: teamId },
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats team lastx stats for ${teamId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get league players for player analysis
 */
const getLeaguePlayers = async (seasonId, page = 1) => {
  try {
    const cacheKey = `${CACHE_KEYS.LEAGUE_PLAYERS}-${seasonId}-${page}`;

    const data = await cachedApiRequest(
      '/league-players',
      {
        season_id: seasonId,
        page: page,
        include: 'stats'
      },
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats league players for ${seasonId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get individual player statistics
 */
const getPlayerStats = async (playerId) => {
  try {
    const cacheKey = `${CACHE_KEYS.PLAYER_STATS}-${playerId}`;

    const data = await cachedApiRequest(
      '/player-stats',
      { player_id: playerId },
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats player stats for ${playerId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get today's matches
 */
const getTodayMatches = async () => {
  try {
    const data = await cachedApiRequest(
      '/todays-matches',
      {},
      CACHE_KEYS.TODAY_MATCHES,
      CACHE_TTL.TODAY_MATCHES
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats today matches:', { 
      service: 'footystats-api',
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get BTTS statistics
 */
const getBTTSStats = async () => {
  try {
    const data = await cachedApiRequest(
      '/stats-data-btts',
      {},
      CACHE_KEYS.BTTS_STATS,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats BTTS stats:', { 
      service: 'footystats-api',
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get Over 2.5 statistics
 */
const getOver25Stats = async () => {
  try {
    const data = await cachedApiRequest(
      '/stats-data-over25',
      {},
      CACHE_KEYS.OVER25_STATS,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats Over 2.5 stats:', {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get league standings/table using FootyStats API
 * Note: FootyStats uses season_id, not league_id for league tables
 */
const getLeagueStandings = async (seasonId) => {
  try {
    const cacheKey = `${CACHE_KEYS.LEAGUE_LIST}-standings-${seasonId}`;

    // Use league-tables endpoint with season_id and include stats
    const data = await cachedApiRequest(
      '/league-tables',
      {
        season_id: seasonId,
        include: 'stats'
      },
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats league standings for season ${seasonId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get league list with season IDs for FootyStats API
 */
const getLeagueSeasons = async () => {
  try {
    const cacheKey = `${CACHE_KEYS.LEAGUE_LIST}-seasons`;

    // Use league-list endpoint to get competitions with season IDs
    const data = await cachedApiRequest(
      '/league-list',
      {},
      cacheKey,
      CACHE_TTL.LEAGUE_LIST
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats league seasons:', {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get detailed team corner statistics
 */
const getTeamCornerStats = async (teamId) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-corners-${teamId}`;

    // Get team stats with corner-specific data
    const data = await cachedApiRequest(
      '/team',
      {
        team_id: teamId,
        include: 'stats,corners'
      },
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats team corner stats for ${teamId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get detailed team card statistics
 */
const getTeamCardStats = async (teamId) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-cards-${teamId}`;

    // Get team stats with card-specific data
    const data = await cachedApiRequest(
      '/team',
      {
        team_id: teamId,
        include: 'stats,cards'
      },
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats team card stats for ${teamId}:`, {
      service: 'footystats-api', 
      error: error.message
    });
    throw error;
  }
};

/**
 * Get team BTTS (Both Teams To Score) statistics
 */
const getTeamBTTSStats = async (teamId) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-btts-${teamId}`;

    // Get team stats with BTTS-specific data
    const data = await cachedApiRequest(
      '/team',
      {
        team_id: teamId,
        include: 'stats,btts'
      },
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats team BTTS stats for ${teamId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get country list with supported countries
 */
const getCountryList = async () => {
  try {
    const data = await cachedApiRequest(
      '/country-list',
      {},
      `${CACHE_KEYS.LEAGUE_LIST}-countries`,
      CACHE_TTL.LEAGUE_LIST
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats country list:', {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get teams for a specific league/season
 */
const getLeagueTeams = async (seasonId, options = {}) => {
  try {
    const { page = 1, includeStats = true } = options;
    const cacheKey = `${CACHE_KEYS.TEAM_STATS}-league-${seasonId}-${page}`;

    const params = {
      season_id: seasonId,
      page: page
    };

    if (includeStats) {
      params.include = 'stats';
    }

    const data = await cachedApiRequest(
      '/league-teams',
      params,
      cacheKey,
      CACHE_TTL.TEAM_STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats league teams for ${seasonId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get comprehensive league/season statistics and teams
 */
const getLeagueSeason = async (seasonId, options = {}) => {
  try {
    const { maxTime = null } = options;
    const cacheKey = `${CACHE_KEYS.LEAGUE_LIST}-season-${seasonId}`;

    const params = {
      season_id: seasonId
    };

    if (maxTime) {
      params.max_time = maxTime;
    }

    const data = await cachedApiRequest(
      '/league-season',
      params,
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats league season for ${seasonId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get referees for a specific league/season
 */
const getLeagueReferees = async (seasonId, options = {}) => {
  try {
    const { maxTime = null } = options;
    const cacheKey = `${CACHE_KEYS.LEAGUE_LIST}-referees-${seasonId}`;

    const params = {
      season_id: seasonId
    };

    if (maxTime) {
      params.max_time = maxTime;
    }

    const data = await cachedApiRequest(
      '/league-referees',
      params,
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats league referees for ${seasonId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get league list
 */
const getLeagueList = async () => {
  try {
    const data = await cachedApiRequest(
      '/league-list',
      {},
      CACHE_KEYS.LEAGUE_LIST,
      CACHE_TTL.LEAGUE_LIST
    );

    return data;
  } catch (error) {
    logger.error('Error fetching FootyStats league list:', { 
      service: 'footystats-api',
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get individual referee statistics across all competitions
 */
const getRefereeStats = async (refereeId) => {
  try {
    const cacheKey = `${CACHE_KEYS.LEAGUE_LIST}-referee-${refereeId}`;

    const data = await cachedApiRequest(
      '/referee',
      { referee_id: refereeId },
      cacheKey,
      CACHE_TTL.STATS
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats referee stats for ${refereeId}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Get matches by specific date with timezone support
 */
const getMatchesByDate = async (date, options = {}) => {
  try {
    const { timezone = 'UTC' } = options;
    const cacheKey = `${CACHE_KEYS.TODAY_MATCHES}-${date}`;

    const params = {
      date: date // Format: YYYY-MM-DD
    };

    if (timezone !== 'UTC') {
      params.timezone = timezone;
    }

    const data = await cachedApiRequest(
      '/todays-matches',
      params,
      cacheKey,
      CACHE_TTL.TODAY_MATCHES
    );

    return data;
  } catch (error) {
    logger.error(`Error fetching FootyStats matches for ${date}:`, {
      service: 'footystats-api',
      error: error.message
    });
    throw error;
  }
};

/**
 * Transform match details to our app format
 */
const transformMatchDetails = (apiResponse) => {
  if (!apiResponse || !apiResponse.data) return null;

  const data = apiResponse.data;

  return {
    // Basic match info
    id: data.id,
    homeTeam: {
      id: data.homeID,
      name: data.home_name || 'Home Team',
      logo: data.home_image ? `https://cdn.footystats.org/img/${data.home_image}` : null
    },
    awayTeam: {
      id: data.awayID,
      name: data.away_name || 'Away Team',
      logo: data.away_image ? `https://cdn.footystats.org/img/${data.away_image}` : null
    },
    
    // Match details
    status: data.status,
    date: data.date_unix ? new Date(data.date_unix * 1000).toISOString() : null,
    score: {
      home: data.homeGoalCount || 0,
      away: data.awayGoalCount || 0,
      total: data.totalGoalCount || 0
    },
    
    // Statistics
    stats: {
      corners: {
        home: data.team_a_corners || 0,
        away: data.team_b_corners || 0
      },
      cards: {
        home: {
          yellow: data.team_a_yellow_cards || 0,
          red: data.team_a_red_cards || 0,
          total: data.team_a_cards_num || 0
        },
        away: {
          yellow: data.team_b_yellow_cards || 0,
          red: data.team_b_red_cards || 0,
          total: data.team_b_cards_num || 0
        }
      },
      shots: {
        home: {
          total: data.team_a_shots || 0,
          onTarget: data.team_a_shotsOnTarget || 0,
          offTarget: data.team_a_shotsOffTarget || 0
        },
        away: {
          total: data.team_b_shots || 0,
          onTarget: data.team_b_shotsOnTarget || 0,
          offTarget: data.team_b_shotsOffTarget || 0
        }
      },
      possession: {
        home: data.team_a_possession || 0,
        away: data.team_b_possession || 0
      },
      fouls: {
        home: data.team_a_fouls || 0,
        away: data.team_b_fouls || 0
      },
      offsides: {
        home: data.team_a_offsides || 0,
        away: data.team_b_offsides || 0
      }
    },
    
    // Pre-match potentials (convert percentages to decimals)
    potentials: {
      btts: (data.btts_potential || 0) / 100,
      over15: (data.o15_potential || 0) / 100,
      over25: (data.o25_potential || 0) / 100,
      over35: (data.o35_potential || 0) / 100,
      corners: data.corners_potential || 0,
      cards: data.cards_potential || 0,
      avg: data.avg_potential || 0
    },
    
    // H2H data
    h2h: data.h2h || null,
    
    // Lineups
    lineups: data.lineups || null,
    bench: data.bench || null,
    
    // Trends
    trends: data.trends || null,
    
    // Odds
    odds: {
      ft_1: data.odds_ft_1 || null,
      ft_x: data.odds_ft_x || null,
      ft_2: data.odds_ft_2 || null,
      btts_yes: data.odds_btts_yes || null,
      btts_no: data.odds_btts_no || null,
      over25: data.odds_ft_over25 || null,
      under25: data.odds_ft_under25 || null
    },
    
    // Additional data
    league: {
      id: data.competition_id || null,
      name: data.league_name || null
    },
    referee: {
      id: data.refereeID || null,
      name: data.referee_name || null
    },
    stadium: {
      name: data.stadium_name || null,
      location: data.stadium_location || null
    }
  };
};

// Export service
module.exports = {
  // Core match data
  getMatchDetails,
  getMatchById, // NEW: Alias for getMatchDetails
  getTodayMatches,
  getMatchesByDate, // NEW: Get matches by specific date
  getLeagueMatches, // NEW: Get matches for specific league

  // Team analysis  
  getTeamStats,
  getTeamLastXStats,
  getTeamCornerStats,
  getTeamCardStats,
  getTeamBTTSStats,

  // Player analysis
  getLeaguePlayers,
  getPlayerStats,

  // League data
  getLeagueList,
  getLeagueSeasons,
  getLeagueSeason, // NEW: Comprehensive league/season data
  getLeagueStandings,
  getLeagueTeams, // NEW: Teams for specific league
  getLeagueReferees,
  getCountryList, // NEW: Supported countries

  // Statistics endpoints
  getBTTSStats,
  getOver25Stats,

  // Officials
  getRefereeStats,

  // Utility functions
  makeApiRequest,
  cachedApiRequest,
  transformMatchDetails,
  clearCache, // NEW: Clear cache function

  // Configuration
  API_CONFIG,
  CACHE_KEYS,
  CACHE_TTL
};
