const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { cachedApiRequest, API_KEY } = require('../apiService');
const { getTeamLogo } = require('../../utils/logoHelper');

const CACHE_KEYS = {
  TEAM_FORM: 'team-form',
  TEAM_STATS: 'team-stats'
};

const CACHE_TTL = {
  TEAM_FORM: 30 * 60 * 1000, // 30 minutes
  TEAM_STATS: 60 * 60 * 1000 // 1 hour
};

/**
 * Transform team's recent match data into form analysis
 * @param {Object} apiData - Raw API response
 * @param {string} teamId - Team ID
 * @param {number} matchLimit - Number of matches to analyze
 * @returns {Object} Standardized team form analysis
 */
const transformTeamForm = (apiData, teamId, matchLimit) => {
  try {
    if (!apiData || !Array.isArray(apiData)) {
      return { recentMatches: [], formSummary: '', stats: {} };
    }

    // Sort matches by date (most recent first)
    const sortedMatches = [...apiData]
      .sort((a, b) => {
        const dateA = new Date(a.event_date || a.match_date);
        const dateB = new Date(b.event_date || b.match_date);
        return dateB - dateA;
      })
      .slice(0, matchLimit);

    const recentMatches = sortedMatches.map(match => {
      const isHomeTeam = (match.event_home_team_id === teamId || 
                         match.home_team_key === teamId ||
                         match.match_hometeam_id === teamId);

      const homeTeamName = match.event_home_team || match.match_hometeam_name;
      const awayTeamName = match.event_away_team || match.match_awayteam_name;
      const homeScore = parseInt(match.event_home_final_result || match.match_hometeam_score || 0, 10);
      const awayScore = parseInt(match.event_away_final_result || match.match_awayteam_score || 0, 10);

      // Determine result (W/D/L) from team's perspective
      let result = 'D';
      if (isHomeTeam) {
        result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
      } else {
        result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
      }

      return {
        id: match.event_key || match.match_id,
        date: match.event_date || match.match_date,
        competition: match.league_name || 'Unknown League',
        opponent: isHomeTeam ? awayTeamName : homeTeamName,
        opponentLogo: getTeamLogo(isHomeTeam ? awayTeamName : homeTeamName),
        venue: isHomeTeam ? 'home' : 'away',
        result: result,
        score: {
          for: isHomeTeam ? homeScore : awayScore,
          against: isHomeTeam ? awayScore : homeScore
        },
        stats: {
          possession: parseInt(isHomeTeam ? match.possession_home : match.possession_away || '0', 10),
          shotsOnTarget: parseInt(isHomeTeam ? match.shots_on_target_home : match.shots_on_target_away || '0', 10),
          corners: parseInt(isHomeTeam ? match.corner_home : match.corner_away || '0', 10)
        }
      };
    });

    // Calculate form summary and statistics
    const formSummary = recentMatches.map(m => m.result).join('');
    const totalMatches = recentMatches.length;
    const wins = recentMatches.filter(m => m.result === 'W').length;
    const draws = recentMatches.filter(m => m.result === 'D').length;
    const losses = recentMatches.filter(m => m.result === 'L').length;
    const goalsScored = recentMatches.reduce((sum, m) => sum + m.score.for, 0);
    const goalsConceded = recentMatches.reduce((sum, m) => sum + m.score.against, 0);

    // Advanced stats
    const homeMatches = recentMatches.filter(m => m.venue === 'home');
    const awayMatches = recentMatches.filter(m => m.venue === 'away');
    const homeWins = homeMatches.filter(m => m.result === 'W').length;
    const awayWins = awayMatches.filter(m => m.result === 'W').length;
    const cleanSheets = recentMatches.filter(m => m.score.against === 0).length;
    const failedToScore = recentMatches.filter(m => m.score.for === 0).length;

    const stats = {
      overall: {
        played: totalMatches,
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        goalDifference: goalsScored - goalsConceded,
        pointsPerGame: ((wins * 3 + draws) / totalMatches).toFixed(2),
        winRate: ((wins / totalMatches) * 100).toFixed(1),
        cleanSheetRate: ((cleanSheets / totalMatches) * 100).toFixed(1),
        failedToScoreRate: ((failedToScore / totalMatches) * 100).toFixed(1),
        averageGoalsScored: (goalsScored / totalMatches).toFixed(2),
        averageGoalsConceded: (goalsConceded / totalMatches).toFixed(2)
      },
      home: {
        played: homeMatches.length,
        wins: homeWins,
        winRate: ((homeWins / homeMatches.length) * 100).toFixed(1),
        goalsScored: homeMatches.reduce((sum, m) => sum + m.score.for, 0),
        goalsConceded: homeMatches.reduce((sum, m) => sum + m.score.against, 0)
      },
      away: {
        played: awayMatches.length,
        wins: awayWins,
        winRate: ((awayWins / awayMatches.length) * 100).toFixed(1),
        goalsScored: awayMatches.reduce((sum, m) => sum + m.score.for, 0),
        goalsConceded: awayMatches.reduce((sum, m) => sum + m.score.against, 0)
      }
    };

    // Calculate form trends
    const trends = {
      currentStreak: calculateStreak(formSummary),
      scoringStreak: calculateScoringStreak(recentMatches),
      formTrend: calculateFormTrend(recentMatches),
      homeAdvantage: (stats.home.winRate > stats.away.winRate * 1.5),
      strongDefense: (stats.overall.cleanSheetRate > 40),
      inconsistent: isFormInconsistent(formSummary)
    };

    return {
      recentMatches,
      formSummary,
      stats,
      trends
    };
  } catch (error) {
    logger.error(`Error transforming team form data: ${error.message}`, { service: 'team-form' });
    return { recentMatches: [], formSummary: '', stats: {} };
  }
};

// Helper functions for trend analysis
const calculateStreak = (form) => {
  const currentResult = form[0];
  let streak = 1;
  for (let i = 1; i < form.length; i++) {
    if (form[i] === currentResult) streak++;
    else break;
  }
  return {
    type: currentResult,
    length: streak
  };
};

const calculateScoringStreak = (matches) => {
  let streak = 0;
  for (const match of matches) {
    if (match.score.for > 0) streak++;
    else break;
  }
  return streak;
};

const calculateFormTrend = (matches) => {
  const recentForm = matches.slice(0, 5);
  const olderForm = matches.slice(5, 10);
  
  if (recentForm.length === 0 || olderForm.length === 0) return 'neutral';
  
  const recentPoints = recentForm.reduce((sum, m) => sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
  const olderPoints = olderForm.reduce((sum, m) => sum + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
  
  if (recentPoints > olderPoints * 1.25) return 'improving';
  if (recentPoints < olderPoints * 0.75) return 'declining';
  return 'stable';
};

const isFormInconsistent = (form) => {
  let changes = 0;
  for (let i = 1; i < form.length; i++) {
    if (form[i] !== form[i-1]) changes++;
  }
  return changes >= form.length * 0.6;
};

/**
 * Get team form analysis
 * @param {string} teamId - Team ID
 * @param {number} matches - Number of matches to analyze
 * @returns {Promise<Object>} Team form analysis
 */
const getTeamForm = async (teamId, matches = 10) => {
  try {
    const cacheKey = `${CACHE_KEYS.TEAM_FORM}-${teamId}-${matches}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info(`Returning cached team form data for team ${teamId}`, { service: 'team-form' });
      return cachedData;
    }

    // Fetch team form data from API
    const response = await cachedApiRequest('/', {
      met: 'TeamResults',
      APIkey: API_KEY,
      teamId: teamId,
      last: matches
    }, null, null);

    if (!response.result) {
      throw new Error('Invalid API response for team form data');
    }

    // Transform the data
    const formData = transformTeamForm(response.result, teamId, matches);

    // Cache the results
    cache.set(cacheKey, formData, CACHE_TTL.TEAM_FORM);

    return formData;
  } catch (error) {
    logger.error(`Error getting team form data: ${error.message}`, { service: 'team-form' });
    throw error;
  }
};

module.exports = {
  getTeamForm,
  transformTeamForm
};
