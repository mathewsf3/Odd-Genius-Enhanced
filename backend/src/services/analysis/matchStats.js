const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { cachedApiRequest, API_KEY } = require('../apiService');
const { getTeamLogo, getLeagueLogo } = require('../../utils/logoHelper');

const CACHE_KEYS = {
  MATCH_DETAILS: 'match-details',
  MATCH_TIMELINE: 'match-timeline',
  MATCH_STATS: 'match-stats',
  LINEUPS: 'lineups',
  FIXTURES: 'fixtures',
  EVENTS: 'events'
};

const CACHE_TTL = {
  MATCH_DETAILS: 15 * 60 * 1000,  // 15 minutes
  MATCH_TIMELINE: 5 * 60 * 1000,  // 5 minutes
  MATCH_STATS: 15 * 60 * 1000,    // 15 minutes
  LINEUPS: 30 * 60 * 1000,       // 30 minutes
  FIXTURES: 15 * 60 * 1000,      // 15 minutes
  EVENTS: 2 * 60 * 1000          // 2 minutes
};

/**
 * Transform match statistics response into standardized format
 * @param {Object} statsResponse - The raw API response for match statistics
 * @param {string} matchId - The match ID
 * @returns {Object} Standardized statistics object
 */
const transformMatchStats = (statsResponse, matchId) => {
  if (!statsResponse.result || !statsResponse.result[matchId]) {
    return { home: {}, away: {} };
  }

  const statsData = statsResponse.result[matchId];
  
  return {
    home: {
      possession: parseInt(statsData.possession_home || '0'),
      shots: parseInt(statsData.shots_on_target_home || '0'),
      shotsTotal: parseInt(statsData.shots_total_home || '0'),
      corners: parseInt(statsData.corner_home || '0'),
      fouls: parseInt(statsData.fouls_home || '0'),
      yellowCards: parseInt(statsData.yellow_cards_home || '0'),
      redCards: parseInt(statsData.red_cards_home || '0'),
      offsides: parseInt(statsData.offsides_home || '0'),
      attacks: parseInt(statsData.attacks_home || '0'),
      dangerousAttacks: parseInt(statsData.dangerous_attacks_home || '0'),
      passes: parseInt(statsData.passes_home || '0'),
      passAccuracy: parseInt(statsData.pass_accuracy_home || '0'),
      shotAccuracy: parseInt(statsData.shot_accuracy_home || '0')
    },
    away: {
      possession: parseInt(statsData.possession_away || '0'),
      shots: parseInt(statsData.shots_on_target_away || '0'),
      shotsTotal: parseInt(statsData.shots_total_away || '0'),
      corners: parseInt(statsData.corner_away || '0'),
      fouls: parseInt(statsData.fouls_away || '0'),
      yellowCards: parseInt(statsData.yellow_cards_away || '0'),
      redCards: parseInt(statsData.red_cards_away || '0'),
      offsides: parseInt(statsData.offsides_away || '0'),
      attacks: parseInt(statsData.attacks_away || '0'),
      dangerousAttacks: parseInt(statsData.dangerous_attacks_away || '0'),
      passes: parseInt(statsData.passes_away || '0'),
      passAccuracy: parseInt(statsData.pass_accuracy_away || '0'),
      shotAccuracy: parseInt(statsData.shot_accuracy_away || '0')
    }
  };
};

/**
 * Transform match events into standardized timeline format
 * @param {Object} timelineResponse - The raw API response for match timeline
 * @param {string} matchId - The match ID
 * @returns {Array} Array of timeline events
 */
const transformMatchTimeline = (timelineResponse, matchId) => {
  if (!timelineResponse.result || !timelineResponse.result[matchId]) {
    return [];
  }

  const eventsData = timelineResponse.result[matchId];
  
  return eventsData.map(event => ({
    id: `${matchId}-${event.event_id || Math.random().toString(36).substr(2, 9)}`,
    type: event.event_type.toLowerCase(),
    team: event.home_away === 'h' ? 'home' : 'away',
    player: event.player,
    time: parseInt(event.event_time, 10),
    detail: event.event_detail || '',
    assistPlayer: event.assist || null,
    replacedPlayer: event.replaced_player || null,
    injuryTime: event.injury_time ? parseInt(event.injury_time, 10) : null
  }));
};

/**
 * Transform lineup data into standardized format
 * @param {Object} lineupResponse - The raw API response for lineups
 * @param {string} matchId - The match ID
 * @returns {Object} Standardized lineups object
 */
const transformLineups = (lineupResponse, matchId) => {
  if (!lineupResponse.result || !lineupResponse.result[matchId]) {
    return { home: [], away: [] };
  }

  const lineupData = lineupResponse.result[matchId];
  const lineups = { home: [], away: [], formations: { home: '', away: '' } };

  // Process home team lineup
  if (lineupData.home_team) {
    lineups.formations.home = lineupData.home_team.formation || '';
    
    if (lineupData.home_team.starting_lineups) {
      lineups.home = lineupData.home_team.starting_lineups.map(player => ({
        id: player.player_key,
        name: player.player,
        number: player.player_number,
        position: player.player_position,
        isCaptain: player.is_captain === '1'
      }));
    }

    if (lineupData.home_team.substitutes) {
      lineups.homeSubs = lineupData.home_team.substitutes.map(player => ({
        id: player.player_key,
        name: player.player,
        number: player.player_number,
        position: player.player_position
      }));
    }

    if (lineupData.home_team.coaches) {
      lineups.homeCoach = lineupData.home_team.coaches[0]?.coach_name || '';
    }
  }

  // Process away team lineup
  if (lineupData.away_team) {
    lineups.formations.away = lineupData.away_team.formation || '';
    
    if (lineupData.away_team.starting_lineups) {
      lineups.away = lineupData.away_team.starting_lineups.map(player => ({
        id: player.player_key,
        name: player.player,
        number: player.player_number,
        position: player.player_position,
        isCaptain: player.is_captain === '1'
      }));
    }

    if (lineupData.away_team.substitutes) {
      lineups.awaySubs = lineupData.away_team.substitutes.map(player => ({
        id: player.player_key,
        name: player.player,
        number: player.player_number,
        position: player.player_position
      }));
    }

    if (lineupData.away_team.coaches) {
      lineups.awayCoach = lineupData.away_team.coaches[0]?.coach_name || '';
    }
  }

  return lineups;
};

/**
 * Get detailed match statistics
 * @param {string} matchId - The match ID
 * @returns {Promise<Object>} Match statistics and details
 */
const getMatchStats = async (matchId) => {
  try {
    // Check complete cache first
    const completeCacheKey = `${CACHE_KEYS.MATCH_DETAILS}-${matchId}-complete`;
    const cachedComplete = cache.get(completeCacheKey);
    if (cachedComplete) {
      logger.info(`Returning complete cached match stats for match ${matchId}`, { service: 'match-stats' });
      return cachedComplete;
    }    // Enhanced retry logic for important match data
    const fetchWithRetry = async (endpoint, params, cacheKey, cacheTTL, maxRetries = 3) => {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await cachedApiRequest(endpoint, params, cacheKey, cacheTTL);
        } catch (error) {
          lastError = error;
          logger.warn(`Retry ${i + 1}/${maxRetries} failed for ${params.met}`, { service: 'match-stats', error: error.message });
          if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
        }
      }
      throw lastError;
    };

    // Fetch all required data in parallel with enhanced retry logic
    const [fixturesResponse, lineupResponse, statsResponse] = await Promise.all([
      fetchWithRetry('/', {
        met: 'Fixtures',
        APIkey: API_KEY,
        matchId: matchId
      }, `${CACHE_KEYS.FIXTURES}-${matchId}`, CACHE_TTL.FIXTURES),
      
      fetchWithRetry('/', {
        met: 'Lineups',
        APIkey: API_KEY,
        matchId: matchId
      }, `${CACHE_KEYS.LINEUPS}-${matchId}`, CACHE_TTL.LINEUPS),
      
      cachedApiRequest('/', {
        met: 'Statistics',
        APIkey: API_KEY,
        matchId: matchId
      }, `${CACHE_KEYS.MATCH_STATS}-${matchId}`, CACHE_TTL.MATCH_STATS)
    ]);

    if (!fixturesResponse.result || !Array.isArray(fixturesResponse.result) || fixturesResponse.result.length === 0) {
      throw new Error('Invalid API response for match details');
    }

    const matchData = fixturesResponse.result[0];

    // Transform all data in parallel
    const [lineups, statistics] = await Promise.all([
      transformLineups(lineupResponse, matchId),
      transformMatchStats(statsResponse, matchId)
    ]);

    // Parse score
    const score = {
      home: parseInt(matchData.match_hometeam_score || matchData.event_home_final_result || '0', 10),
      away: parseInt(matchData.match_awayteam_score || matchData.event_away_final_result || '0', 10)
    };

    // Get match timeline for live or finished matches
    let events = [];
    if (matchData.event_status === 'Finished' || matchData.event_live === '1') {
      try {
        const timelineResponse = await cachedApiRequest('/', {
          met: 'Events',
          APIkey: API_KEY,
          matchId: matchId
        }, `${CACHE_KEYS.EVENTS}-${matchId}`, CACHE_TTL.EVENTS);

        events = transformMatchTimeline(timelineResponse, matchId);
      } catch (error) {
        logger.warn(`Error fetching match timeline: ${error.message}`, { service: 'match-stats' });
      }
    }

    // Create comprehensive match details object
    const matchDetails = {
      id: matchId,
      league: {
        id: matchData.league_id || matchData.event_league_id,
        name: matchData.league_name || matchData.event_league_name,
        country: matchData.country_name || matchData.event_country_name
      },
      homeTeam: {
        id: matchData.match_hometeam_id || matchData.event_home_team_id,
        name: matchData.match_hometeam_name || matchData.event_home_team,
        logo: getTeamLogo(matchData.match_hometeam_id || matchData.event_home_team_id)
      },
      awayTeam: {
        id: matchData.match_awayteam_id || matchData.event_away_team_id,
        name: matchData.match_awayteam_name || matchData.event_away_team,
        logo: getTeamLogo(matchData.match_awayteam_id || matchData.event_away_team_id)
      },
      date: matchData.event_date,
      time: matchData.event_time,
      status: matchData.event_status,
      elapsed: parseInt(matchData.event_status?.replace("'", "") || '0', 10),
      venue: matchData.event_stadium || `${homeTeam.name} Stadium`,
      referee: matchData.event_referee || 'TBA',
      score,
      lineups,
      statistics,
      events,
      weather: matchData.event_weather || null,
      formations: lineups.formations
    };

    // Cache the complete result
    cache.set(completeCacheKey, matchDetails, CACHE_TTL.MATCH_DETAILS);

    return matchDetails;
  } catch (error) {
    logger.error(`Error getting match stats: ${error.message}`, { service: 'match-stats' });
    throw error;
  }
};

module.exports = {
  getMatchStats,
  transformMatchStats,
  transformMatchTimeline,
  transformLineups
};
