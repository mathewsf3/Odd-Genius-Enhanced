const footyStatsApi = require('./footyStatsApiService');
const logger = require('../utils/logger');

/**
 * Compute over/under statistics for an array of matches
 * @param {Array} matches Array of match objects
 * @param {Function} extractor Function to extract numeric value from a match
 * @param {number[]} thresholds Threshold values
 * @returns {Object} Stats keyed by threshold
 */
function computeThresholdStats(matches, extractor, thresholds) {
  const valid = matches.map(extractor).filter(v => typeof v === 'number' && !isNaN(v));
  const total = valid.length;
  const result = {};
  thresholds.forEach(th => {
    const count = valid.filter(v => v > th).length;
    result[th] = {
      over: count,
      under: total - count,
      overPct: total ? Number(((count / total) * 100).toFixed(1)) : 0,
      underPct: total ? Number((((total - count) / total) * 100).toFixed(1)) : 0
    };
  });
  return { total, thresholds: result };
}

/**
 * Helper to fetch a team's matches by venue and limit
 */
async function fetchTeamMatches(teamId, venue, limit, seasonId) {
  try {
    const params = {
      team_id: teamId,
      venue,
      max_per_page: limit,
      order: 'date_desc'
    };
    if (seasonId) params.season_id = seasonId;
    const res = await footyStatsApi.cachedApiRequest('/league-matches', params, `${teamId}-${venue}-${limit}-${seasonId}`, footyStatsApi.CACHE_TTL.TEAM_STATS);
    return Array.isArray(res?.data) ? res.data.slice(0, limit) : [];
  } catch (err) {
    logger.error(`Failed to fetch matches for team ${teamId}`, { error: err.message });
    return [];
  }
}

/**
 * Calculate goal, card and corner stats for given matches
 */
function aggregateMatchStats(matches) {
  const goalExtractor = m => parseInt(m.totalGoalCount ?? (m.homeGoalCount || 0) + (m.awayGoalCount || 0));
  const cardExtractor = m => {
    const hY = parseInt(m.team_a_yellow_cards || 0);
    const hR = parseInt(m.team_a_red_cards || 0);
    const aY = parseInt(m.team_b_yellow_cards || 0);
    const aR = parseInt(m.team_b_red_cards || 0);
    return hY + hR + aY + aR;
  };
  const cornerExtractor = m => parseInt(m.totalCornerCount ?? (m.team_a_corners || 0) + (m.team_b_corners || 0));

  return {
    goals: computeThresholdStats(matches, goalExtractor, [0.5,1.5,2.5,3.5,4.5,5.5]),
    cards: computeThresholdStats(matches, cardExtractor, [0.5,1.5,2.5,3.5,4.5,5.5]),
    corners: computeThresholdStats(matches, cornerExtractor, [6.5,7.5,8.5,9.5,10.5,11.5,12.5,13.5])
  };
}

/**
 * Get comprehensive analysis for a match
 */
async function getComprehensiveMatchAnalysis(matchId) {
  const match = await footyStatsApi.getMatchDetails(matchId);
  if (!match) return null;
  const seasonId = match.season || match.season_id || null;
  const homeId = match.homeTeam?.id;
  const awayId = match.awayTeam?.id;

  const [home5, home10, away5, away10, referee, standings] = await Promise.all([
    fetchTeamMatches(homeId, 'home', 5, seasonId),
    fetchTeamMatches(homeId, 'home', 10, seasonId),
    fetchTeamMatches(awayId, 'away', 5, seasonId),
    fetchTeamMatches(awayId, 'away', 10, seasonId),
    match.referee?.id ? footyStatsApi.getRefereeStats(match.referee.id) : null,
    seasonId ? footyStatsApi.getLeagueStandings(seasonId) : null
  ]);

  return {
    match,
    league: standings,
    referee: referee,
    homeTeam: {
      last5Home: aggregateMatchStats(home5),
      last10Home: aggregateMatchStats(home10)
    },
    awayTeam: {
      last5Away: aggregateMatchStats(away5),
      last10Away: aggregateMatchStats(away10)
    }
  };
}

module.exports = {
  getComprehensiveMatchAnalysis
};
