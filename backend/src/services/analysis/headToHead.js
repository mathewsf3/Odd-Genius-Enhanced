const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { cachedApiRequest, API_KEY } = require('../apiService');
const { getTeamLogo } = require('../../utils/logoHelper');

const CACHE_KEYS = {
  H2H: 'h2h',
  TEAM_STATS: 'team-stats'
};

const CACHE_TTL = {
  H2H: 60 * 60 * 1000, // 1 hour
  TEAM_STATS: 30 * 60 * 1000 // 30 minutes
};

/**
 * Transform head to head data into standardized format
 * @param {Object} apiData - Raw API response data
 * @returns {Object} Standardized H2H data
 */
const transformH2HData = (apiData) => {
  try {
    if (!apiData || !apiData.firstTeam_VS_secondTeam) {
      return { matches: [], summary: { totalMatches: 0 } };
    }

    const matches = apiData.firstTeam_VS_secondTeam.map(match => ({
      id: match.match_id || match.event_key,
      date: match.match_date || match.event_date,
      competition: match.league_name || 'Unknown League',
      homeTeam: {
        name: match.match_hometeam_name || match.event_home_team,
        score: parseInt(match.match_hometeam_score || '0', 10)
      },
      awayTeam: {
        name: match.match_awayteam_name || match.event_away_team,
        score: parseInt(match.match_awayteam_score || '0', 10)
      },
      venue: match.match_stadium || '',
      result: match.match_hometeam_score > match.match_awayteam_score ? 'HOME' : 
              match.match_hometeam_score < match.match_awayteam_score ? 'AWAY' : 'DRAW',
      score: {
        home: parseInt(match.match_hometeam_score || '0', 10),
        away: parseInt(match.match_awayteam_score || '0', 10)
      }
    }));

    // Calculate summary statistics
    const team1Wins = matches.filter(m => 
      (m.homeTeam.name === apiData.firstTeam_name && m.score.home > m.score.away) ||
      (m.awayTeam.name === apiData.firstTeam_name && m.score.away > m.score.home)
    ).length;

    const team2Wins = matches.filter(m => 
      (m.homeTeam.name === apiData.secondTeam_name && m.score.home > m.score.away) ||
      (m.awayTeam.name === apiData.secondTeam_name && m.score.away > m.score.home)
    ).length;

    const draws = matches.filter(m => m.score.home === m.score.away).length;

    // Calculate goals
    const team1Goals = matches.reduce((total, match) => {
      if (match.homeTeam.name === apiData.firstTeam_name) {
        return total + match.score.home;
      } else if (match.awayTeam.name === apiData.firstTeam_name) {
        return total + match.score.away;
      }
      return total;
    }, 0);

    const team2Goals = matches.reduce((total, match) => {
      if (match.homeTeam.name === apiData.secondTeam_name) {
        return total + match.score.home;
      } else if (match.awayTeam.name === apiData.secondTeam_name) {
        return total + match.score.away;
      }
      return total;
    }, 0);

    // Calculate average goals per game
    const avgTotalGoals = (team1Goals + team2Goals) / matches.length;
    const avgTeam1Goals = team1Goals / matches.length;
    const avgTeam2Goals = team2Goals / matches.length;

    // Calculate win percentages
    const totalMatches = matches.length;
    const team1WinPercentage = (team1Wins / totalMatches) * 100;
    const team2WinPercentage = (team2Wins / totalMatches) * 100;
    const drawPercentage = (draws / totalMatches) * 100;

    return {
      firstTeam: {
        id: apiData.firstTeam_key,
        name: apiData.firstTeam_name,
        logo: getTeamLogo(apiData.firstTeam_name)
      },
      secondTeam: {
        id: apiData.secondTeam_key,
        name: apiData.secondTeam_name,
        logo: getTeamLogo(apiData.secondTeam_name)
      },
      matches: matches,
      summary: {
        totalMatches,
        wins: {
          firstTeam: team1Wins,
          secondTeam: team2Wins,
          draws: draws
        },
        winPercentages: {
          firstTeam: Math.round(team1WinPercentage * 10) / 10,
          secondTeam: Math.round(team2WinPercentage * 10) / 10,
          draws: Math.round(drawPercentage * 10) / 10
        },
        goals: {
          firstTeam: team1Goals,
          secondTeam: team2Goals,
          total: team1Goals + team2Goals
        },
        averages: {
          totalGoals: Math.round(avgTotalGoals * 100) / 100,
          firstTeamGoals: Math.round(avgTeam1Goals * 100) / 100,
          secondTeamGoals: Math.round(avgTeam2Goals * 100) / 100
        },
        trends: {
          highScoring: avgTotalGoals > 2.5,
          competitive: Math.abs(team1WinPercentage - team2WinPercentage) < 20,
          dominantTeam: team1WinPercentage > team2WinPercentage * 1.5 ? 'firstTeam' :
                       team2WinPercentage > team1WinPercentage * 1.5 ? 'secondTeam' : null
        }
      }
    };
  } catch (error) {
    logger.error(`Error transforming H2H data: ${error.message}`, { service: 'h2h-analysis' });
    return { matches: [], summary: { totalMatches: 0 } };
  }
};

/**
 * Get head-to-head analysis for two teams
 * @param {string} team1Id - First team ID
 * @param {string} team2Id - Second team ID 
 * @returns {Promise<Object>} Head-to-head analysis
 */
const getHeadToHead = async (team1Id, team2Id) => {
  try {
    const cacheKey = `${CACHE_KEYS.H2H}-${team1Id}-${team2Id}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info(`Returning cached H2H data for ${team1Id} vs ${team2Id}`, { service: 'h2h-analysis' });
      return cachedData;
    }

    // Fetch H2H data from API
    const response = await cachedApiRequest('/', {
      met: 'H2H',
      APIkey: API_KEY,
      firstTeamId: team1Id,
      secondTeamId: team2Id
    }, null, null);

    if (!response.result) {
      throw new Error('Invalid API response for H2H data');
    }

    // Transform the data
    const h2hData = transformH2HData(response.result);

    // Cache the results
    cache.set(cacheKey, h2hData, CACHE_TTL.H2H);

    return h2hData;
  } catch (error) {
    logger.error(`Error getting H2H data: ${error.message}`, { service: 'h2h-analysis' });
    throw error;
  }
};

module.exports = {
  getHeadToHead,
  transformH2HData
};
