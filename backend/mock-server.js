const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock match data for endpoint with comprehensive analysis fields
const createMockMatchData = (matchId) => {
  return {
    matchDetails: {
      id: matchId || "1568037",
      league: {
        id: "152",
        name: "Premier League",
        country: "England",
        logo: "https://media.api-sports.io/football/leagues/39.png",
        season: "2024-2025"
      },
      stadium: {
        id: "556",
        name: "Old Trafford",
        city: "Manchester",
        capacity: 74140
      },
      date: "2025-05-25T14:00:00+00:00",
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      },
      homeTeam: {
        id: "33",
        name: "Manchester United",
        logo: "https://media.api-sports.io/football/teams/33.png",
        shortName: "Man Utd"
      },
      awayTeam: {
        id: "40",
        name: "Liverpool",
        logo: "https://media.api-sports.io/football/teams/40.png",
        shortName: "Liverpool"
      },
      score: {
        halftime: {
          home: null,
          away: null
        },
        fulltime: {
          home: null,
          away: null
        }
      },
      events: []
    },
    statistics: {
      home: {
        shots: {
          total: 15,
          onTarget: 7,
          offTarget: 8
        },
        passes: {
          total: 450,
          accuracy: 85,
          successRate: 85
        },
        corners: 7,
        offsides: 2,
        fouls: 10,
        yellowCards: 2,
        redCards: 0,
        possession: 55
      },
      away: {
        shots: {
          total: 12,
          onTarget: 5,
          offTarget: 7
        },
        passes: {
          total: 420,
          accuracy: 83,
          successRate: 83
        },
        corners: 5,
        offsides: 3,
        fouls: 12,
        yellowCards: 3,
        redCards: 0,
        possession: 45
      }
    },
    h2h: {
      totalMatches: 212,
      homeTeamWins: 81,
      awayTeamWins: 69,
      draws: 62,
      recentMatches: [
        {
          date: "2024-03-17",
          competition: "Premier League",
          result: "Manchester United 2-1 Liverpool"
        },
        {
          date: "2023-12-08",
          competition: "Premier League",
          result: "Liverpool 3-1 Manchester United"
        },
        {
          date: "2023-08-27",
          competition: "FA Cup",
          result: "Manchester United 0-0 Liverpool"
        },
        {
          date: "2023-03-05",
          competition: "Premier League",
          result: "Liverpool 7-0 Manchester United"
        },
        {
          date: "2022-08-22",
          competition: "Premier League",
          result: "Manchester United 2-1 Liverpool"
        }
      ]
    },
    analysis: {
      overall: {
        home: {
          played: 35,
          won: 19,
          drawn: 8,
          lost: 8,
          goalsScored: 55,
          goalsConceded: 35,
          cleanSheets: 12,
          failedToScore: 5
        },
        away: {
          played: 35,
          won: 20,
          drawn: 10,
          lost: 5,
          goalsScored: 65,
          goalsConceded: 30,
          cleanSheets: 14,
          failedToScore: 3
        }
      },
      form: {
        home: ["W", "W", "D", "L", "W"],
        away: ["W", "D", "W", "W", "D"]
      },
      goalTimings: {
        home: {
          team: {
            id: "33",
            name: "Manchester United"
          },
          goalsByPeriod: {
            "0-15": 8,
            "16-30": 10,
            "31-45": 12,
            "46-60": 9,
            "61-75": 8,
            "76-90": 8
          },
          averageFirstGoalMinute: 32,
          firstGoalTimings: {
            "0-15": 5,
            "16-30": 8,
            "31-45": 6,
            "46-60": 5,
            "61-75": 3,
            "76-90": 2
          }
        },
        away: {
          team: {
            id: "40",
            name: "Liverpool"
          },
          goalsByPeriod: {
            "0-15": 7,
            "16-30": 12,
            "31-45": 10,
            "46-60": 14,
            "61-75": 12,
            "76-90": 10
          },
          averageFirstGoalMinute: 29,
          firstGoalTimings: {
            "0-15": 7,
            "16-30": 10,
            "31-45": 5,
            "46-60": 6,
            "61-75": 4,
            "76-90": 2
          }
        }
      },
      cardAnalysis: {
        home: {
          team: {
            id: "33",
            name: "Manchester United"
          },
          yellowCards: 65,
          redCards: 3
        },
        away: {
          team: {
            id: "40",
            name: "Liverpool"
          },
          yellowCards: 48,
          redCards: 1
        }
      },
      cornerAnalysis: {
        home: {
          team: {
            id: "33",
            name: "Manchester United"
          },
          corners: 180,
          cornersFor: 110,
          cornersAgainst: 70,
          averageCornersFor: 5.5,
          averageCornersAgainst: 3.5,
          over8_5: 65,
          over9_5: 45,
          over10_5: 30
        },
        away: {
          team: {
            id: "40",
            name: "Liverpool"
          },
          corners: 190,
          cornersFor: 120,
          cornersAgainst: 70,
          averageCornersFor: 6.0,
          averageCornersAgainst: 3.5,
          over8_5: 70,
          over9_5: 50,
          over10_5: 35
        }
      },
      teamStats: {
        home: {
          over1_5: 80,
          over2_5: 55,
          over3_5: 30,
          btts: 60,
          cleanSheets: 12,
          failedToScore: 5,
          averageGoalsScored: 1.8,
          averageGoalsConceded: 1.1,
          cornersFor: 110,
          cornersAgainst: 70,
          averageCornersFor: 5.5,
          averageCornersAgainst: 3.5,
          over8_5: 65,
          over9_5: 45,
          over10_5: 30,
          totalCorners: 180,
          totalYellowCards: 65,
          totalRedCards: 3,
          averageYellowCards: 1.8,
          averageRedCards: 0.1,
          cardsPer15Min: [10, 15, 20, 15, 25, 15],
          percentages: {
            over2Cards: 75,
            over3Cards: 45,
            over4Cards: 20,
            over5Cards: 10
          },
          goalsScored: {
            first15: 8,
            min16_30: 10,
            min31_45: 12,
            min46_60: 9,
            min61_75: 8,
            min76_90: 8
          },
          goalsConceded: {
            first15: 5,
            min16_30: 7,
            min31_45: 8,
            min46_60: 6,
            min61_75: 5,
            min76_90: 4
          }
        },
        away: {
          over1_5: 85,
          over2_5: 65,
          over3_5: 40,
          btts: 55,
          cleanSheets: 14,
          failedToScore: 3,
          averageGoalsScored: 2.2,
          averageGoalsConceded: 0.9,
          cornersFor: 120,
          cornersAgainst: 70,
          averageCornersFor: 6.0,
          averageCornersAgainst: 3.5,
          over8_5: 70,
          over9_5: 50,
          over10_5: 35,
          totalCorners: 190,
          totalYellowCards: 48,
          totalRedCards: 1,
          averageYellowCards: 1.4,
          averageRedCards: 0.03,
          cardsPer15Min: [8, 12, 15, 20, 18, 25],
          percentages: {
            over2Cards: 70,
            over3Cards: 40,
            over4Cards: 15,
            over5Cards: 8
          },
          goalsScored: {
            first15: 7,
            min16_30: 12,
            min31_45: 10,
            min46_60: 14,
            min61_75: 12,
            min76_90: 10
          },
          goalsConceded: {
            first15: 4,
            min16_30: 6,
            min31_45: 5,
            min46_60: 7,
            min61_75: 4,
            min76_90: 4
          }
        }
      },
      predictions: {
        home: 40,
        draw: 25,
        away: 35,
        homeWinProbability: 0.4,
        drawProbability: 0.25,
        awayWinProbability: 0.35,
        btts: {
          yes: 65,
          no: 35
        },
        overUnder: {
          over2_5: 60,
          under2_5: 40
        },
        correctScore: [
          {
            score: "2-1",
            probability: 15
          },
          {
            score: "1-1",
            probability: 13
          },
          {
            score: "1-2",
            probability: 12
          }
        ],
        firstGoalScorer: [
          {
            player: "Bruno Fernandes",
            team: "Manchester United",
            probability: 18
          },
          {
            player: "Mohamed Salah",
            team: "Liverpool",
            probability: 22
          }
        ],
        goalsTimeFrame: "46-75",
        firstGoalTeam: "Liverpool",
        firstGoalMinute: "16-30",
        confidence: 70
      }
    }
  };
};

// Function to generate unique mock data based on matchId
const generateUniqueMatchData = (matchId) => {
  const baseData = createMockMatchData(matchId);
  
  // Make some values unique based on match ID
  const numericId = parseInt(matchId) || 0;
  
  // Add some variability to the data based on match ID
  baseData.analysis.overall.home.goalsScored += numericId % 10;
  baseData.analysis.overall.away.goalsScored += numericId % 8;
  
  // Make goal timings vary slightly
  for (const period in baseData.analysis.goalTimings.home.goalsByPeriod) {
    baseData.analysis.goalTimings.home.goalsByPeriod[period] += numericId % 5;
    baseData.analysis.goalTimings.away.goalsByPeriod[period] += numericId % 4;
  }
  
  // Adjust team names for custom matchIds
  if (numericId > 2000000) {
    baseData.matchDetails.homeTeam.name = `Home Team ${numericId % 100}`;
    baseData.matchDetails.awayTeam.name = `Away Team ${(numericId + 50) % 100}`;
    
    // Update team names throughout the data structure
    baseData.analysis.goalTimings.home.team.name = baseData.matchDetails.homeTeam.name;
    baseData.analysis.goalTimings.away.team.name = baseData.matchDetails.awayTeam.name;
    baseData.analysis.cardAnalysis.home.team.name = baseData.matchDetails.homeTeam.name;
    baseData.analysis.cardAnalysis.away.team.name = baseData.matchDetails.awayTeam.name;
    baseData.analysis.cornerAnalysis.home.team.name = baseData.matchDetails.homeTeam.name;
    baseData.analysis.cornerAnalysis.away.team.name = baseData.matchDetails.awayTeam.name;
  }
  
  // Restructure data for enhanced match analysis format
  // This ensures UI components receive complete data
  baseData.teamForm = {
    home: baseData.analysis.form.home.map((result, index) => ({
      result,
      date: new Date(Date.now() - (index * 604800000)).toISOString().split('T')[0],
      opponent: `Opponent ${index + 1}`,
      score: result === 'W' ? '2-0' : result === 'D' ? '1-1' : '0-1'
    })),
    away: baseData.analysis.form.away.map((result, index) => ({
      result,
      date: new Date(Date.now() - (index * 604800000)).toISOString().split('T')[0],
      opponent: `Opponent ${index + 1}`,
      score: result === 'W' ? '2-0' : result === 'D' ? '1-1' : '0-1'
    }))
  };
  
  // Add insights for better match analysis
  baseData.insights = {
    key_stats: [
      {
        title: "Scoring Patterns",
        content: `${baseData.matchDetails.homeTeam.name} scores most goals in the ${
          Object.entries(baseData.analysis.goalTimings.home.goalsByPeriod)
            .sort((a, b) => b[1] - a[1])[0][0]
        } minute range.`
      },
      {
        title: "Corner Analysis",
        content: `${baseData.matchDetails.awayTeam.name} averages ${baseData.analysis.cornerAnalysis.away.averageCornersFor.toFixed(1)} corners per match.`
      },
      {
        title: "Clean Sheets",
        content: `${baseData.matchDetails.homeTeam.name} has kept ${baseData.analysis.overall.home.cleanSheets} clean sheets this season.`
      }
    ],
    form_insight: `${baseData.matchDetails.homeTeam.name} has won ${baseData.analysis.form.home.filter(r => r === 'W').length} of their last 5 matches.`,
    h2h_insight: `${baseData.matchDetails.homeTeam.name} has won ${baseData.h2h.homeTeamWins} times against ${baseData.matchDetails.awayTeam.name} in their head-to-head history.`,
    key_players: [
      {
        name: "Marcus Rashford",
        team: baseData.matchDetails.homeTeam.name,
        stat: "5 goals in last 5 matches"
      },
      {
        name: "Mohamed Salah",
        team: baseData.matchDetails.awayTeam.name,
        stat: "7 assists this season"
      }
    ]
  };
  
  return baseData;
};

// For real data calls (commented out as it requires API key)
// async function fetchRealData(matchId) {
//   const API_KEY = 'YOUR_API_KEY';
//   try {
//     const response = await axios.get(
//       `https://apiv2.allsportsapi.com/football/?met=Fixtures&matchId=${matchId}&APIkey=${API_KEY}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching real data:', error);
//     return null;
//   }
// }

// Match endpoint that returns real or realistic mock data
app.get('/match/:matchId', async (req, res) => {
  const { matchId } = req.params;
  
  console.log(`Received request for match ID: ${matchId}`);
  
  // Option 1: For demo/development, return realistic mock data
  const matchData = generateUniqueMatchData(matchId);
  return res.json(matchData);
  
  // Option 2: For production, try to get real data
  // Uncomment this section and comment out the line above to use real data
  // try {
  //   const realData = await fetchRealData(matchId);
  //   if (realData && realData.result) {
  //     return res.json(realData);
  //   } else {
  //     // Fall back to mock data if real data isn't available
  //     const matchData = generateUniqueMatchData(matchId);
  //     return res.json(matchData);
  //   }
  // } catch (error) {
  //   console.error(`Error fetching data for match ${matchId}:`, error);
  //   const matchData = generateUniqueMatchData(matchId);
  //   return res.json(matchData);
  // }
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});

// Add a specific match analysis endpoint to align with our enhanced service
app.get('/analysis/matches/:id', async (req, res) => {
  const matchId = req.params.id;
  
  console.log(`Received request for match analysis ID: ${matchId}`);
  
  // Generate match data with all enhanced fields
  const matchData = generateUniqueMatchData(matchId);
  
  // Structure response to align with our controller response format
  return res.json({
    success: true,
    result: {
      matchDetails: matchData.matchDetails,
      h2h: matchData.h2h,
      teamForm: matchData.teamForm,
      teamStats: matchData.analysis.teamStats,
      goalTimings: matchData.analysis.goalTimings,
      cardAnalysis: matchData.analysis.cardAnalysis,
      cornerAnalysis: matchData.analysis.cornerAnalysis,
      insights: matchData.insights,
      predictions: matchData.analysis.predictions,
      overall: matchData.analysis.overall,
      statistics: matchData.statistics
    }
  });
});

// Add enhanced match analysis endpoint that provides specific structured data for each UI tab
app.get('/enhanced-analysis/match/:id', async (req, res) => {
  const matchId = req.params.id;
  
  console.log(`Received request for enhanced match analysis ID: ${matchId}`);
  
  // Generate match data with all enhanced fields
  const matchData = generateUniqueMatchData(matchId);
  
  // Format team form data structure for TeamStatsTab
  const teamFormData = {
    homeTeam: {
      overall: {
        played: matchData.analysis.overall.home.played,
        won: matchData.analysis.overall.home.won,
        drawn: matchData.analysis.overall.home.drawn,
        lost: matchData.analysis.overall.home.lost,
        goalsFor: matchData.analysis.overall.home.goalsScored,
        goalsAgainst: matchData.analysis.overall.home.goalsConceded,
        cleanSheets: matchData.analysis.overall.home.cleanSheets,
        failedToScore: matchData.analysis.overall.home.failedToScore
      },
      home: {
        played: Math.floor(matchData.analysis.overall.home.played / 2),
        won: Math.floor(matchData.analysis.overall.home.won * 0.6),
        drawn: Math.floor(matchData.analysis.overall.home.drawn * 0.5),
        lost: Math.floor(matchData.analysis.overall.home.lost * 0.4),
        goalsFor: Math.floor(matchData.analysis.overall.home.goalsScored * 0.6),
        goalsAgainst: Math.floor(matchData.analysis.overall.home.goalsConceded * 0.5),
        cleanSheets: Math.floor(matchData.analysis.overall.home.cleanSheets * 0.7),
        failedToScore: Math.floor(matchData.analysis.overall.home.failedToScore * 0.4)
      },
      away: {
        played: Math.floor(matchData.analysis.overall.home.played / 2),
        won: Math.floor(matchData.analysis.overall.home.won * 0.4),
        drawn: Math.floor(matchData.analysis.overall.home.drawn * 0.5),
        lost: Math.floor(matchData.analysis.overall.home.lost * 0.6),
        goalsFor: Math.floor(matchData.analysis.overall.home.goalsScored * 0.4),
        goalsAgainst: Math.floor(matchData.analysis.overall.home.goalsConceded * 0.5),
        cleanSheets: Math.floor(matchData.analysis.overall.home.cleanSheets * 0.3),
        failedToScore: Math.floor(matchData.analysis.overall.home.failedToScore * 0.6)
      },
      form: matchData.analysis.form.home,
      recentResults: matchData.teamForm.home.map((result, i) => ({
        opponent: result.opponent,
        isHome: i % 2 === 0,
        result: result.result,
        score: result.score,
        date: result.date
      })),
      leaguePosition: 6,
      topScorer: {
        name: "Marcus Rashford",
        goals: 12,
        assists: 8
      },
      xG: {
        scored: 45.5,
        conceded: 38.2
      }
    },
    awayTeam: {
      overall: {
        played: matchData.analysis.overall.away.played,
        won: matchData.analysis.overall.away.won,
        drawn: matchData.analysis.overall.away.drawn,
        lost: matchData.analysis.overall.away.lost,
        goalsFor: matchData.analysis.overall.away.goalsScored,
        goalsAgainst: matchData.analysis.overall.away.goalsConceded,
        cleanSheets: matchData.analysis.overall.away.cleanSheets,
        failedToScore: matchData.analysis.overall.away.failedToScore
      },
      home: {
        played: Math.floor(matchData.analysis.overall.away.played / 2),
        won: Math.floor(matchData.analysis.overall.away.won * 0.6),
        drawn: Math.floor(matchData.analysis.overall.away.drawn * 0.5),
        lost: Math.floor(matchData.analysis.overall.away.lost * 0.4),
        goalsFor: Math.floor(matchData.analysis.overall.away.goalsScored * 0.6),
        goalsAgainst: Math.floor(matchData.analysis.overall.away.goalsConceded * 0.5),
        cleanSheets: Math.floor(matchData.analysis.overall.away.cleanSheets * 0.7),
        failedToScore: Math.floor(matchData.analysis.overall.away.failedToScore * 0.4)
      },
      away: {
        played: Math.floor(matchData.analysis.overall.away.played / 2),
        won: Math.floor(matchData.analysis.overall.away.won * 0.4),
        drawn: Math.floor(matchData.analysis.overall.away.drawn * 0.5),
        lost: Math.floor(matchData.analysis.overall.away.lost * 0.6),
        goalsFor: Math.floor(matchData.analysis.overall.away.goalsScored * 0.4),
        goalsAgainst: Math.floor(matchData.analysis.overall.away.goalsConceded * 0.5),
        cleanSheets: Math.floor(matchData.analysis.overall.away.cleanSheets * 0.3),
        failedToScore: Math.floor(matchData.analysis.overall.away.failedToScore * 0.6)
      },
      form: matchData.analysis.form.away,
      recentResults: matchData.teamForm.away.map((result, i) => ({
        opponent: result.opponent,
        isHome: i % 2 === 1,
        result: result.result,
        score: result.score,
        date: result.date
      })),
      leaguePosition: 3,
      topScorer: {
        name: "Mohamed Salah",
        goals: 19,
        assists: 9
      },
      xG: {
        scored: 58.3,
        conceded: 32.7
      }
    },
    leagueStats: {
      averageGoalsPerMatch: 2.7,
      homeWinPercentage: 45,
      drawPercentage: 26,
      awayWinPercentage: 29
    }
  };

  // Format goal timing data structure
  const goalTimingData = {
    teamStats: {
      home: {
        scoringPatterns: {
          firstHalfGoals: matchData.analysis.goalTimings.home.goalsByPeriod["0-15"] + 
                          matchData.analysis.goalTimings.home.goalsByPeriod["16-30"] + 
                          matchData.analysis.goalTimings.home.goalsByPeriod["31-45"],
          secondHalfGoals: matchData.analysis.goalTimings.home.goalsByPeriod["46-60"] + 
                           matchData.analysis.goalTimings.home.goalsByPeriod["61-75"] + 
                           matchData.analysis.goalTimings.home.goalsByPeriod["76-90"],
          earlyGoals: matchData.analysis.goalTimings.home.goalsByPeriod["0-15"],
          lateGoals: matchData.analysis.goalTimings.home.goalsByPeriod["76-90"],
          cleanSheets: matchData.analysis.overall.home.cleanSheets,
          failedToScore: matchData.analysis.overall.home.failedToScore
        },
        goalDistribution: [
          matchData.analysis.goalTimings.home.goalsByPeriod["0-15"],
          matchData.analysis.goalTimings.home.goalsByPeriod["16-30"],
          matchData.analysis.goalTimings.home.goalsByPeriod["31-45"],
          matchData.analysis.goalTimings.home.goalsByPeriod["46-60"],
          matchData.analysis.goalTimings.home.goalsByPeriod["61-75"],
          matchData.analysis.goalTimings.home.goalsByPeriod["76-90"]
        ],
        averageFirstGoalMinute: matchData.analysis.goalTimings.home.averageFirstGoalMinute || 30,
        firstGoalDistribution: [
          matchData.analysis.goalTimings.home.firstGoalTimings["0-15"],
          matchData.analysis.goalTimings.home.firstGoalTimings["16-30"],
          matchData.analysis.goalTimings.home.firstGoalTimings["31-45"],
          matchData.analysis.goalTimings.home.firstGoalTimings["46-60"],
          matchData.analysis.goalTimings.home.firstGoalTimings["61-75"],
          matchData.analysis.goalTimings.home.firstGoalTimings["76-90"]
        ]
      },
      away: {
        scoringPatterns: {
          firstHalfGoals: matchData.analysis.goalTimings.away.goalsByPeriod["0-15"] + 
                          matchData.analysis.goalTimings.away.goalsByPeriod["16-30"] + 
                          matchData.analysis.goalTimings.away.goalsByPeriod["31-45"],
          secondHalfGoals: matchData.analysis.goalTimings.away.goalsByPeriod["46-60"] + 
                           matchData.analysis.goalTimings.away.goalsByPeriod["61-75"] + 
                           matchData.analysis.goalTimings.away.goalsByPeriod["76-90"],
          earlyGoals: matchData.analysis.goalTimings.away.goalsByPeriod["0-15"],
          lateGoals: matchData.analysis.goalTimings.away.goalsByPeriod["76-90"],
          cleanSheets: matchData.analysis.overall.away.cleanSheets,
          failedToScore: matchData.analysis.overall.away.failedToScore
        },
        goalDistribution: [
          matchData.analysis.goalTimings.away.goalsByPeriod["0-15"],
          matchData.analysis.goalTimings.away.goalsByPeriod["16-30"],
          matchData.analysis.goalTimings.away.goalsByPeriod["31-45"],
          matchData.analysis.goalTimings.away.goalsByPeriod["46-60"],
          matchData.analysis.goalTimings.away.goalsByPeriod["61-75"],
          matchData.analysis.goalTimings.away.goalsByPeriod["76-90"]
        ],
        averageFirstGoalMinute: matchData.analysis.goalTimings.away.averageFirstGoalMinute || 30,
        firstGoalDistribution: [
          matchData.analysis.goalTimings.away.firstGoalTimings["0-15"],
          matchData.analysis.goalTimings.away.firstGoalTimings["16-30"],
          matchData.analysis.goalTimings.away.firstGoalTimings["31-45"],
          matchData.analysis.goalTimings.away.firstGoalTimings["46-60"],
          matchData.analysis.goalTimings.away.firstGoalTimings["61-75"],
          matchData.analysis.goalTimings.away.firstGoalTimings["76-90"]
        ]
      }
    },
    leagueAverages: {
      firstHalfGoals: 1.2,
      secondHalfGoals: 1.5,
      averageFirstGoalMinute: 34
    },
    predictions: {
      timeOfFirstGoal: matchData.analysis.predictions.firstGoalMinute,
      highestScoringPeriod: matchData.analysis.predictions.goalsTimeFrame,
      confidence: matchData.analysis.predictions.confidence
    }
  };

  // Format card analysis data
  const cardData = {
    teamStats: {
      home: {
        totalYellowCards: matchData.analysis.cardAnalysis.home.yellowCards,
        totalRedCards: matchData.analysis.cardAnalysis.home.redCards,
        averageYellowCards: matchData.analysis.teamStats.home.averageYellowCards,
        averageRedCards: matchData.analysis.teamStats.home.averageRedCards,
        cardsPer15Min: matchData.analysis.teamStats.home.cardsPer15Min,
        percentages: matchData.analysis.teamStats.home.percentages,
        mostBookedPlayers: [
          { name: "Scott McTominay", position: "MF", yellowCards: 7, redCards: 1, totalCards: 8 },
          { name: "Bruno Fernandes", position: "MF", yellowCards: 6, redCards: 0, totalCards: 6 },
          { name: "Luke Shaw", position: "DF", yellowCards: 5, redCards: 0, totalCards: 5 }
        ]
      },
      away: {
        totalYellowCards: matchData.analysis.cardAnalysis.away.yellowCards,
        totalRedCards: matchData.analysis.cardAnalysis.away.redCards,
        averageYellowCards: matchData.analysis.teamStats.away.averageYellowCards,
        averageRedCards: matchData.analysis.teamStats.away.averageRedCards,
        cardsPer15Min: matchData.analysis.teamStats.away.cardsPer15Min,
        percentages: matchData.analysis.teamStats.away.percentages,
        mostBookedPlayers: [
          { name: "Fabinho", position: "MF", yellowCards: 8, redCards: 0, totalCards: 8 },
          { name: "Trent Alexander-Arnold", position: "DF", yellowCards: 4, redCards: 0, totalCards: 4 },
          { name: "Virgil van Dijk", position: "DF", yellowCards: 3, redCards: 1, totalCards: 4 }
        ]
      }
    },
    leagueStats: {
      averageYellowCardsPerMatch: 3.5,
      averageRedCardsPerMatch: 0.2,
      percentages: {
        over2Cards: 65,
        over3Cards: 45,
        over4Cards: 25,
        over5Cards: 12
      }
    },
    refereeStats: {
      name: "Michael Oliver",
      matchesRefereed: 28,
      averageYellowCards: 4.2,
      averageRedCards: 0.3,
      mostRecentMatches: [
        { date: "2025-05-12", teams: "Arsenal vs Tottenham", yellowCards: 5, redCards: 1 },
        { date: "2025-05-05", teams: "Newcastle vs Chelsea", yellowCards: 3, redCards: 0 },
        { date: "2025-04-28", teams: "West Ham vs Leicester", yellowCards: 4, redCards: 0 },
      ]
    },
    prediction: {
      totalCards: "4-6",
      homeTeamCards: 3,
      awayTeamCards: 2,
      confidence: 75
    }
  };

  // Format predictions data
  const predictionsData = {
    modelPredictions: [
      {
        model: "Statistical Model",
        homeWin: matchData.analysis.predictions.home,
        draw: matchData.analysis.predictions.draw,
        awayWin: matchData.analysis.predictions.away,
        predictedScore: matchData.analysis.predictions.correctScore[0].score,
        btts: matchData.analysis.predictions.btts.yes > 50,
        over2_5: matchData.analysis.predictions.overUnder.over2_5 > 50,
        confidence: matchData.analysis.predictions.confidence
      },
      {
        model: "Machine Learning",
        homeWin: matchData.analysis.predictions.home + 5,
        draw: matchData.analysis.predictions.draw - 2,
        awayWin: matchData.analysis.predictions.away - 3,
        predictedScore: matchData.analysis.predictions.correctScore[0].score,
        btts: matchData.analysis.predictions.btts.yes > 55,
        over2_5: matchData.analysis.predictions.overUnder.over2_5 > 55,
        confidence: matchData.analysis.predictions.confidence + 5
      }
    ],
    consensusPrediction: {
      mostLikelyOutcome: matchData.analysis.predictions.home > matchData.analysis.predictions.away ? 
                         (matchData.analysis.predictions.home > matchData.analysis.predictions.draw ? 'HOME_WIN' : 'DRAW') : 
                         (matchData.analysis.predictions.away > matchData.analysis.predictions.draw ? 'AWAY_WIN' : 'DRAW'),
      mostLikelyScore: matchData.analysis.predictions.correctScore[0].score,
      homeWinProbability: matchData.analysis.predictions.home,
      drawProbability: matchData.analysis.predictions.draw,
      awayWinProbability: matchData.analysis.predictions.away,
      btts: matchData.analysis.predictions.btts.yes > 50,
      over2_5: matchData.analysis.predictions.overUnder.over2_5 > 50,
      averageGoals: 2.6,
      confidence: matchData.analysis.predictions.confidence
    },
    valueAnalysis: {
      bestBets: [
        {
          type: "1X2",
          selection: matchData.matchDetails.homeTeam.name + " Win",
          odds: 2.10,
          confidence: matchData.analysis.predictions.confidence,
          value: 110
        },
        {
          type: "Over/Under",
          selection: "Over 2.5 Goals",
          odds: 1.85,
          confidence: matchData.analysis.predictions.confidence - 5,
          value: 105
        },
        {
          type: "BTTS",
          selection: "Yes",
          odds: 1.75,
          confidence: matchData.analysis.predictions.confidence - 10,
          value: 108
        }
      ]
    },
    odds: {
      bookmakers: [
        {
          bookmaker: "Bet365",
          homeWin: 2.10,
          draw: 3.40,
          awayWin: 3.20,
          over2_5: 1.85,
          under2_5: 1.95,
          btts: {
            yes: 1.75,
            no: 2.05
          },
          correctScore: [
            { score: "1-0", odds: 7.00 },
            { score: "2-0", odds: 9.00 },
            { score: "2-1", odds: 8.50 },
            { score: "1-1", odds: 6.50 }
          ]
        },
        {
          bookmaker: "SkyBet",
          homeWin: 2.15,
          draw: 3.50,
          awayWin: 3.10,
          over2_5: 1.80,
          under2_5: 2.00,
          btts: {
            yes: 1.70,
            no: 2.10
          },
          correctScore: [
            { score: "1-0", odds: 7.50 },
            { score: "2-0", odds: 9.50 },
            { score: "2-1", odds: 8.00 },
            { score: "1-1", odds: 6.00 }
          ]
        }
      ],
      averageOdds: {
        homeWin: 2.125,
        draw: 3.45,
        awayWin: 3.15,
        over2_5: 1.825,
        under2_5: 1.975,
        btts: {
          yes: 1.725,
          no: 2.075
        }
      },
      impliedProbabilities: {
        homeWin: 47,
        draw: 29,
        awayWin: 32,
        over2_5: 55,
        under2_5: 51,
        btts: {
          yes: 58,
          no: 48
        }
      }
    }
  };

  // Structure response with all properly formatted data for each UI component
  return res.json({
    success: true,
    result: {
      matchDetails: matchData.matchDetails,
      h2h: matchData.h2h,
      teamForm: matchData.teamForm,
      teamFormData: teamFormData, // Properly formatted for TeamStatsTab
      goalTimingData: goalTimingData, // Properly formatted for GoalTimingAnalysisTab  
      cardData: cardData, // Properly formatted for CardAnalysisTab
      cornerData: {
        teamStats: {
          home: matchData.analysis.cornerAnalysis.home,
          away: matchData.analysis.cornerAnalysis.away
        }
      }, // Properly formatted for CornerAnalysisTab
      predictions: predictionsData, // Properly formatted for PredictionsTab
      matchStatistics: {
        home: matchData.statistics.home,
        away: matchData.statistics.away,
        teamStats: matchData.analysis.teamStats
      },
      insights: matchData.insights,
      overall: matchData.analysis.overall
    }
  });
});

// Add goal timing analysis endpoints
app.get('/api/teams/:teamId/goal-timings', async (req, res) => {
  const teamId = req.params.teamId;
  console.log(`Received request for goal timing analysis for team ID: ${teamId}`);
  
  // Generate team-specific goal timing data
  const mockGoalTiming = {
    team: { 
      id: teamId, 
      name: teamId === "33" ? "Manchester United" : 
            teamId === "40" ? "Liverpool" : "Team" 
    },
    goalsByPeriod: {
      "0-15": Math.floor(Math.random() * 10) + 5,
      "16-30": Math.floor(Math.random() * 10) + 8,
      "31-45": Math.floor(Math.random() * 12) + 8,
      "46-60": Math.floor(Math.random() * 10) + 7,
      "61-75": Math.floor(Math.random() * 10) + 6,
      "76-90": Math.floor(Math.random() * 10) + 5
    },
    averageFirstGoalMinute: Math.floor(Math.random() * 20) + 20,
    firstGoalTimings: {
      "0-15": Math.floor(Math.random() * 7) + 3,
      "16-30": Math.floor(Math.random() * 8) + 5,
      "31-45": Math.floor(Math.random() * 6) + 4,
      "46-60": Math.floor(Math.random() * 5) + 3,
      "61-75": Math.floor(Math.random() * 4) + 2,
      "76-90": Math.floor(Math.random() * 3) + 1
    }
  };
  
  return res.json({
    success: true,
    result: mockGoalTiming
  });
});

// Add card analysis endpoints
app.get('/api/matches/:matchId/cards', async (req, res) => {
  const matchId = req.params.matchId;
  console.log(`Received request for card analysis for match ID: ${matchId}`);
  
  // Generate match-specific card data
  const mockCardAnalysis = {
    home: {
      team: { 
        id: "33", 
        name: "Manchester United" 
      },
      yellowCards: Math.floor(Math.random() * 4) + 1,
      redCards: Math.floor(Math.random() * 2),
      totalYellowCards: Math.floor(Math.random() * 60) + 40,
      totalRedCards: Math.floor(Math.random() * 5) + 1,
      averageYellowCards: ((Math.random() * 1) + 1.5).toFixed(1),
      averageRedCards: (Math.random() * 0.3).toFixed(2),
      cardsPer15Min: [
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 20) + 15,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 20) + 15,
        Math.floor(Math.random() * 20) + 10
      ],
      percentages: {
        over2Cards: Math.floor(Math.random() * 30) + 50,
        over3Cards: Math.floor(Math.random() * 30) + 30,
        over4Cards: Math.floor(Math.random() * 20) + 15,
        over5Cards: Math.floor(Math.random() * 15) + 5
      }
    },
    away: {
      team: { 
        id: "40", 
        name: "Liverpool" 
      },
      yellowCards: Math.floor(Math.random() * 4) + 1,
      redCards: Math.floor(Math.random() * 2),
      totalYellowCards: Math.floor(Math.random() * 60) + 40,
      totalRedCards: Math.floor(Math.random() * 5) + 1,
      averageYellowCards: ((Math.random() * 1) + 1.5).toFixed(1),
      averageRedCards: (Math.random() * 0.3).toFixed(2),
      cardsPer15Min: [
        Math.floor(Math.random() * 20) + 5,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 20) + 15,
        Math.floor(Math.random() * 20) + 10,
        Math.floor(Math.random() * 20) + 15,
        Math.floor(Math.random() * 20) + 10
      ],
      percentages: {
        over2Cards: Math.floor(Math.random() * 30) + 50,
        over3Cards: Math.floor(Math.random() * 30) + 30,
        over4Cards: Math.floor(Math.random() * 20) + 15,
        over5Cards: Math.floor(Math.random() * 15) + 5
      }
    }
  };
  
  return res.json({
    success: true,
    result: mockCardAnalysis
  });
});

// Add corner analysis endpoints
app.get('/api/matches/:matchId/stats', async (req, res) => {
  const matchId = req.params.matchId;
  console.log(`Received request for match stats (corners/cards) for match ID: ${matchId}`);
  
  // For this endpoint we'll return both corner and card stats since they share the same endpoint
  const mockStats = {
    home: {
      team: { 
        id: "33", 
        name: "Manchester United" 
      },
      corners: Math.floor(Math.random() * 8) + 3,
      cornersFor: Math.floor(Math.random() * 120) + 80,
      cornersAgainst: Math.floor(Math.random() * 100) + 50,
      averageCornersFor: ((Math.random() * 2) + 4).toFixed(1),
      averageCornersAgainst: ((Math.random() * 2) + 3).toFixed(1),
      over8_5: Math.floor(Math.random() * 30) + 50,
      over9_5: Math.floor(Math.random() * 30) + 40,
      over10_5: Math.floor(Math.random() * 30) + 25,
      yellowCards: Math.floor(Math.random() * 4) + 1,
      redCards: Math.floor(Math.random() * 2)
    },
    away: {
      team: { 
        id: "40", 
        name: "Liverpool" 
      },
      corners: Math.floor(Math.random() * 8) + 3,
      cornersFor: Math.floor(Math.random() * 120) + 80,
      cornersAgainst: Math.floor(Math.random() * 100) + 50,
      averageCornersFor: ((Math.random() * 2) + 4).toFixed(1),
      averageCornersAgainst: ((Math.random() * 2) + 3).toFixed(1),
      over8_5: Math.floor(Math.random() * 30) + 50,
      over9_5: Math.floor(Math.random() * 30) + 40,
      over10_5: Math.floor(Math.random() * 30) + 25,
      yellowCards: Math.floor(Math.random() * 4) + 1,
      redCards: Math.floor(Math.random() * 2)
    }
  };
  
  return res.json({
    success: true,
    result: mockStats
  });
});
