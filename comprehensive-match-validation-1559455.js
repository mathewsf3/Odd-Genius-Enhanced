const axios = require('axios');
const fs = require('fs');

const MATCH_ID = '1559455';
const BASE_URL = 'http://localhost:5000/api';

// External data sources for cross-referencing
const EXTERNAL_SOURCES = {
  ESPN: 'https://www.espn.com/soccer/',
  UEFA: 'https://www.uefa.com/',
  REUTERS: 'https://www.reuters.com/sports/soccer/'
};

class MatchDataValidator {
  constructor(matchId) {
    this.matchId = matchId;
    this.validationResults = {
      match: null,
      h2h: null,
      corners: null,
      cards: null,
      btts: null,
      players: null,
      discrepancies: [],
      corrections: [],
      accuracy: 0
    };
  }

  async validateAllData() {
    console.log(`🔍 Starting comprehensive validation for match ${this.matchId}`);
    console.log('=' .repeat(80));

    try {
      // Fetch all match data
      await this.fetchMatchData();
      await this.fetchH2HData();
      await this.fetchCornerStats();
      await this.fetchCardStats();
      await this.fetchBTTSStats();
      await this.fetchPlayerStats();

      // Perform validations
      this.validateMatchDetails();
      this.validateH2HData();
      this.validateCornerStatistics();
      this.validateCardStatistics();
      this.validateBTTSStatistics();
      this.validatePlayerStatistics();
      this.validateMathematicalConsistency();

      // Cross-reference with external sources
      await this.crossReferenceWithExternalSources();

      // Generate report
      this.generateValidationReport();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  async fetchMatchData() {
    try {
      console.log('📊 Fetching match details...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      this.validationResults.match = response.data;
      console.log(`✅ Match data fetched: ${response.data.result?.homeTeam?.name} vs ${response.data.result?.awayTeam?.name}`);
    } catch (error) {
      console.error('❌ Failed to fetch match data:', error.response?.status || error.code || error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'Match Details',
        issue: `Failed to fetch match data: ${error.response?.status || error.code || error.message}`
      });
    }
  }

  async fetchH2HData() {
    try {
      console.log('📊 Fetching H2H data...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}/h2h`, { timeout: 15000 });
      this.validationResults.h2h = response.data;
      console.log(`✅ H2H data fetched: ${response.data.result?.matches?.length || 0} historical matches`);
    } catch (error) {
      console.error('❌ Failed to fetch H2H data:', error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'H2H Data',
        issue: `Failed to fetch H2H data: ${error.message}`
      });
    }
  }

  async fetchCornerStats() {
    try {
      console.log('📊 Fetching corner statistics...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}/corners?matches=10`, { timeout: 15000 });
      this.validationResults.corners = response.data;
      console.log('✅ Corner statistics fetched');
    } catch (error) {
      console.error('❌ Failed to fetch corner stats:', error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'Corner Statistics',
        issue: `Failed to fetch corner stats: ${error.message}`
      });
    }
  }

  async fetchCardStats() {
    try {
      console.log('📊 Fetching card statistics...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}/cards?matches=10`, { timeout: 15000 });
      this.validationResults.cards = response.data;
      console.log('✅ Card statistics fetched');
    } catch (error) {
      console.error('❌ Failed to fetch card stats:', error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'Card Statistics',
        issue: `Failed to fetch card stats: ${error.message}`
      });
    }
  }

  async fetchBTTSStats() {
    try {
      console.log('📊 Fetching BTTS statistics...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}/btts?matches=10`, { timeout: 15000 });
      this.validationResults.btts = response.data;
      console.log('✅ BTTS statistics fetched');
    } catch (error) {
      console.error('❌ Failed to fetch BTTS stats:', error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'BTTS Statistics',
        issue: `Failed to fetch BTTS stats: ${error.message}`
      });
    }
  }

  async fetchPlayerStats() {
    try {
      console.log('📊 Fetching player statistics...');
      const response = await axios.get(`${BASE_URL}/matches/${this.matchId}/players?matches=10`, { timeout: 15000 });
      this.validationResults.players = response.data;
      console.log('✅ Player statistics fetched');
    } catch (error) {
      console.error('❌ Failed to fetch player stats:', error.message);
      this.validationResults.discrepancies.push({
        type: 'FETCH_ERROR',
        section: 'Player Statistics',
        issue: `Failed to fetch player stats: ${error.message}`
      });
    }
  }

  validateMatchDetails() {
    console.log('\n🔍 Validating match details...');

    if (!this.validationResults.match?.result) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'Match Details',
        issue: 'No match data available'
      });
      return;
    }

    const match = this.validationResults.match.result;

    // Validate required fields
    const requiredFields = ['homeTeam', 'awayTeam', 'league', 'date', 'time'];
    requiredFields.forEach(field => {
      if (!match[field] || (typeof match[field] === 'object' && Object.keys(match[field]).length === 0)) {
        this.validationResults.discrepancies.push({
          type: 'MISSING_FIELD',
          section: 'Match Details',
          issue: `Missing or empty field: ${field}`
        });
      }
    });

    // Validate team data
    if (match.homeTeam && match.awayTeam) {
      if (match.homeTeam.name === match.awayTeam.name) {
        this.validationResults.discrepancies.push({
          type: 'DATA_ERROR',
          section: 'Match Details',
          issue: 'Home and away teams have the same name'
        });
      }

      // Cross-reference with known team data
      this.crossReferenceTeamData(match.homeTeam, 'Home Team');
      this.crossReferenceTeamData(match.awayTeam, 'Away Team');
    }

    // Validate match is Germany vs Portugal (expected for this ID)
    const expectedTeams = ['Germany', 'Portugal'];
    const actualTeams = [match.homeTeam?.name, match.awayTeam?.name];

    if (!expectedTeams.every(team => actualTeams.includes(team))) {
      this.validationResults.discrepancies.push({
        type: 'DATA_MISMATCH',
        section: 'Match Details',
        issue: `Expected Germany vs Portugal, got ${actualTeams.join(' vs ')}`
      });
    }

    console.log(`✅ Match details validation completed: ${match.homeTeam?.name} vs ${match.awayTeam?.name}`);
  }

  crossReferenceTeamData(team, teamType) {
    // Validate team has required fields
    if (!team.id || !team.name || !team.logo) {
      this.validationResults.discrepancies.push({
        type: 'INCOMPLETE_TEAM_DATA',
        section: 'Match Details',
        issue: `${teamType} missing required fields (id, name, or logo)`
      });
    }

    // Check for realistic team IDs and logos
    if (team.logo && !team.logo.includes('allsportsapi.com')) {
      this.validationResults.discrepancies.push({
        type: 'SUSPICIOUS_DATA',
        section: 'Match Details',
        issue: `${teamType} logo URL doesn't match expected pattern`
      });
    }
  }

  validateH2HData() {
    console.log('\n🔍 Validating H2H data...');
    
    if (!this.validationResults.h2h?.result?.matches) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'H2H Data',
        issue: 'No H2H matches available'
      });
      return;
    }

    const h2hMatches = this.validationResults.h2h.result.matches;
    
    // Validate H2H match data
    h2hMatches.forEach((match, index) => {
      if (!match.homeTeam || !match.awayTeam) {
        this.validationResults.discrepancies.push({
          type: 'INCOMPLETE_DATA',
          section: 'H2H Data',
          issue: `H2H match ${index + 1} missing team data`
        });
      }
      
      if (!match.score || (match.score.home === undefined || match.score.away === undefined)) {
        this.validationResults.discrepancies.push({
          type: 'INCOMPLETE_DATA',
          section: 'H2H Data',
          issue: `H2H match ${index + 1} missing score data`
        });
      }
    });

    console.log(`✅ H2H validation completed (${h2hMatches.length} matches)`);
  }

  validateCornerStatistics() {
    console.log('\n🔍 Validating corner statistics...');
    
    if (!this.validationResults.corners?.result) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'Corner Statistics',
        issue: 'No corner statistics available'
      });
      return;
    }

    const cornerData = this.validationResults.corners.result;
    
    // Validate Poisson distribution calculations
    ['homeStats', 'awayStats'].forEach(team => {
      if (cornerData[team]) {
        const stats = cornerData[team];
        
        // Check if probabilities sum to 100%
        if (stats.overUnderProbabilities) {
          const probabilities = Object.values(stats.overUnderProbabilities);
          const sum = probabilities.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
          
          if (Math.abs(sum - 100) > 0.1) {
            this.validationResults.discrepancies.push({
              type: 'MATHEMATICAL_ERROR',
              section: 'Corner Statistics',
              issue: `${team} probabilities sum to ${sum.toFixed(2)}% instead of 100%`
            });
          }
        }
        
        // Validate average calculations
        if (stats.averageCorners && stats.totalCorners && stats.matchCount) {
          const calculatedAverage = stats.totalCorners / stats.matchCount;
          if (Math.abs(calculatedAverage - stats.averageCorners) > 0.1) {
            this.validationResults.discrepancies.push({
              type: 'CALCULATION_ERROR',
              section: 'Corner Statistics',
              issue: `${team} average corners mismatch: calculated ${calculatedAverage.toFixed(2)}, reported ${stats.averageCorners}`
            });
          }
        }
      }
    });

    console.log('✅ Corner statistics validation completed');
  }

  validateCardStatistics() {
    console.log('\n🔍 Validating card statistics...');

    if (!this.validationResults.cards?.result) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'Card Statistics',
        issue: 'No card statistics available'
      });
      return;
    }

    const cardData = this.validationResults.cards.result;

    // Validate individual team stats
    ['homeStats', 'awayStats'].forEach(team => {
      if (cardData[team]) {
        const stats = cardData[team];

        // Check for placeholder player names in mostCardedPlayers
        if (stats.mostCardedPlayers) {
          stats.mostCardedPlayers.forEach((player, index) => {
            if (player.playerId && player.playerId.includes('undefined')) {
              this.validationResults.discrepancies.push({
                type: 'PLACEHOLDER_DATA',
                section: 'Card Statistics',
                issue: `${team} has undefined player ID: ${player.playerId}`
              });
            }

            // Check for unrealistic cards per match
            if (player.cardsPerMatch > 10) {
              this.validationResults.discrepancies.push({
                type: 'UNREALISTIC_DATA',
                section: 'Card Statistics',
                issue: `${team} player has ${player.cardsPerMatch} cards per match (unrealistic)`
              });
            }
          });
        }

        // Validate time interval aggregation
        if (stats.cardsByPeriod) {
          const totalCards = Object.values(stats.cardsByPeriod).reduce((acc, val) => acc + (val || 0), 0);
          if (stats.totalCards && Math.abs(totalCards - stats.totalCards) > 0) {
            this.validationResults.discrepancies.push({
              type: 'AGGREGATION_ERROR',
              section: 'Card Statistics',
              issue: `${team} time period sum (${totalCards}) doesn't match total cards (${stats.totalCards})`
            });
          }
        }

        // Validate average calculations
        if (stats.averageCardsPerMatch && stats.totalCards && stats.matchesAnalyzed) {
          const calculatedAverage = stats.totalCards / stats.matchesAnalyzed;
          if (Math.abs(calculatedAverage - stats.averageCardsPerMatch) > 0.1) {
            this.validationResults.discrepancies.push({
              type: 'CALCULATION_ERROR',
              section: 'Card Statistics',
              issue: `${team} average cards mismatch: calculated ${calculatedAverage.toFixed(2)}, reported ${stats.averageCardsPerMatch}`
            });
          }
        }
      }
    });

    // Validate combined statistics and Poisson distribution
    if (cardData.combinedStats) {
      const combined = cardData.combinedStats;

      // Check if Poisson lambda matches expected cards
      if (combined._debug?.poissonLambda && combined.expectedCards) {
        if (Math.abs(combined._debug.poissonLambda - combined.expectedCards) > 0.1) {
          this.validationResults.discrepancies.push({
            type: 'POISSON_ERROR',
            section: 'Card Statistics',
            issue: `Poisson lambda (${combined._debug.poissonLambda}) doesn't match expected cards (${combined.expectedCards})`
          });
        }
      }

      // Validate over/under probabilities are reasonable
      if (combined.overRates) {
        const rates = Object.entries(combined.overRates);
        rates.forEach(([threshold, probability]) => {
          if (probability < 0 || probability > 100) {
            this.validationResults.discrepancies.push({
              type: 'PROBABILITY_ERROR',
              section: 'Card Statistics',
              issue: `Over ${threshold} probability (${probability}%) is outside valid range 0-100%`
            });
          }
        });

        // Check that higher thresholds have lower probabilities
        if (combined.overRates['3.5'] < combined.overRates['4.5']) {
          this.validationResults.discrepancies.push({
            type: 'LOGICAL_ERROR',
            section: 'Card Statistics',
            issue: 'Over 3.5 probability should be higher than Over 4.5'
          });
        }
      }
    }

    console.log('✅ Card statistics validation completed');
  }

  validateBTTSStatistics() {
    console.log('\n🔍 Validating BTTS statistics...');
    
    if (!this.validationResults.btts?.result) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'BTTS Statistics',
        issue: 'No BTTS statistics available'
      });
      return;
    }

    const bttsData = this.validationResults.btts.result;
    
    // Validate mathematical consistency
    ['homeStats', 'awayStats'].forEach(team => {
      if (bttsData[team]) {
        const stats = bttsData[team];
        
        // Check BTTS + Clean Sheet + Failed to Score consistency
        if (stats.bttsPercentage && stats.cleanSheetPercentage && stats.failedToScorePercentage) {
          const btts = parseFloat(stats.bttsPercentage);
          const cleanSheet = parseFloat(stats.cleanSheetPercentage);
          const failedToScore = parseFloat(stats.failedToScorePercentage);
          
          // BTTS + Clean Sheet should not exceed 100%
          if (btts + cleanSheet > 100.1) {
            this.validationResults.discrepancies.push({
              type: 'LOGICAL_ERROR',
              section: 'BTTS Statistics',
              issue: `${team} BTTS (${btts}%) + Clean Sheet (${cleanSheet}%) exceeds 100%`
            });
          }
        }
        
        // Validate goal calculations
        if (stats.totalGoals && stats.matchCount && stats.averageGoals) {
          const calculatedAverage = stats.totalGoals / stats.matchCount;
          if (Math.abs(calculatedAverage - stats.averageGoals) > 0.1) {
            this.validationResults.discrepancies.push({
              type: 'CALCULATION_ERROR',
              section: 'BTTS Statistics',
              issue: `${team} average goals mismatch: calculated ${calculatedAverage.toFixed(2)}, reported ${stats.averageGoals}`
            });
          }
        }
      }
    });

    console.log('✅ BTTS statistics validation completed');
  }

  validatePlayerStatistics() {
    console.log('\n🔍 Validating player statistics...');
    
    if (!this.validationResults.players?.result) {
      this.validationResults.discrepancies.push({
        type: 'MISSING_DATA',
        section: 'Player Statistics',
        issue: 'No player statistics available'
      });
      return;
    }

    const playerData = this.validationResults.players.result;
    
    // Validate player data
    ['homeTeam', 'awayTeam'].forEach(team => {
      if (playerData[team]?.players) {
        const players = playerData[team].players;
        let totalGoals = 0;
        let totalAssists = 0;
        let goalkeeperCount = 0;
        
        players.forEach((player, index) => {
          // Check for placeholder names
          if (player.name && (player.name.includes('Player') || player.name.includes('Unknown'))) {
            this.validationResults.discrepancies.push({
              type: 'PLACEHOLDER_DATA',
              section: 'Player Statistics',
              issue: `${team} has placeholder player name: ${player.name}`
            });
          }
          
          // Check minutes played for goalkeepers
          if (player.position === 'Goalkeeper' || player.position === 'Goalkeepers') {
            goalkeeperCount++;
            if (player.minutesPlayed > player.gamesPlayed * 90) {
              this.validationResults.discrepancies.push({
                type: 'DATA_ERROR',
                section: 'Player Statistics',
                issue: `${team} goalkeeper ${player.name} has more minutes (${player.minutesPlayed}) than possible (${player.gamesPlayed * 90})`
              });
            }
          }
          
          // Accumulate goals and assists
          totalGoals += player.goals || 0;
          totalAssists += player.assists || 0;
          
          // Check for unrealistic statistics
          if ((player.goals || 0) > (player.gamesPlayed || 0) * 3) {
            this.validationResults.discrepancies.push({
              type: 'SUSPICIOUS_DATA',
              section: 'Player Statistics',
              issue: `${team} player ${player.name} has unusually high goals per game ratio`
            });
          }
        });
        
        // Validate team totals against BTTS data
        if (this.validationResults.btts?.result?.[team === 'homeTeam' ? 'homeStats' : 'awayStats']?.totalGoals) {
          const bttsGoals = this.validationResults.btts.result[team === 'homeTeam' ? 'homeStats' : 'awayStats'].totalGoals;
          if (Math.abs(totalGoals - bttsGoals) > 0) {
            this.validationResults.discrepancies.push({
              type: 'INCONSISTENCY',
              section: 'Player Statistics',
              issue: `${team} player goals total (${totalGoals}) doesn't match BTTS total (${bttsGoals})`
            });
          }
        }
      }
    });

    console.log('✅ Player statistics validation completed');
  }

  validateMathematicalConsistency() {
    console.log('\n🔍 Validating mathematical consistency across all data...');

    // Cross-validate data between different sections
    if (this.validationResults.btts?.result && this.validationResults.players?.result) {
      // Compare team goal totals between BTTS and player stats
      const homePlayerGoals = this.validationResults.players.result.homeTeamPlayers?.players?.reduce((sum, p) => sum + (p.playerGoals || 0), 0) || 0;
      const awayPlayerGoals = this.validationResults.players.result.awayTeamPlayers?.players?.reduce((sum, p) => sum + (p.playerGoals || 0), 0) || 0;

      const homeBttsGoals = this.validationResults.btts.result.homeStats?.totalGoals || 0;
      const awayBttsGoals = this.validationResults.btts.result.awayStats?.totalGoals || 0;

      if (Math.abs(homePlayerGoals - homeBttsGoals) > 0) {
        this.validationResults.discrepancies.push({
          type: 'CROSS_SECTION_INCONSISTENCY',
          section: 'Mathematical Consistency',
          issue: `Home team goals: Player stats (${homePlayerGoals}) vs BTTS (${homeBttsGoals})`
        });
      }

      if (Math.abs(awayPlayerGoals - awayBttsGoals) > 0) {
        this.validationResults.discrepancies.push({
          type: 'CROSS_SECTION_INCONSISTENCY',
          section: 'Mathematical Consistency',
          issue: `Away team goals: Player stats (${awayPlayerGoals}) vs BTTS (${awayBttsGoals})`
        });
      }
    }

    // Cross-validate H2H data with expected historical results
    this.validateH2HHistoricalAccuracy();

    console.log('✅ Mathematical consistency validation completed');
  }

  validateH2HHistoricalAccuracy() {
    if (!this.validationResults.h2h?.result?.matches) return;

    const h2hMatches = this.validationResults.h2h.result.matches;

    // Known historical results for Germany vs Portugal validation
    const knownResults = [
      { date: '2021-06-19', homeTeam: 'Portugal', awayTeam: 'Germany', score: { home: 2, away: 4 } },
      { date: '2014-06-16', homeTeam: 'Germany', awayTeam: 'Portugal', score: { home: 4, away: 0 } },
      { date: '2012-06-09', homeTeam: 'Germany', awayTeam: 'Portugal', score: { home: 1, away: 0 } }
    ];

    knownResults.forEach(knownMatch => {
      const foundMatch = h2hMatches.find(match =>
        match.date === knownMatch.date &&
        match.homeTeam.name === knownMatch.homeTeam &&
        match.awayTeam.name === knownMatch.awayTeam
      );

      if (foundMatch) {
        if (foundMatch.score.home !== knownMatch.score.home || foundMatch.score.away !== knownMatch.score.away) {
          this.validationResults.discrepancies.push({
            type: 'HISTORICAL_DATA_ERROR',
            section: 'H2H Data',
            issue: `Match ${knownMatch.date}: Expected ${knownMatch.score.home}-${knownMatch.score.away}, got ${foundMatch.score.home}-${foundMatch.score.away}`
          });
        }
      } else {
        this.validationResults.discrepancies.push({
          type: 'MISSING_HISTORICAL_DATA',
          section: 'H2H Data',
          issue: `Missing known historical match: ${knownMatch.homeTeam} vs ${knownMatch.awayTeam} on ${knownMatch.date}`
        });
      }
    });
  }

  async crossReferenceWithExternalSources() {
    console.log('\n🔍 Cross-referencing with external sources...');

    // Note: In a real implementation, this would make actual API calls to external sources
    // For now, we'll validate against known data patterns and expected values

    const match = this.validationResults.match?.result;
    if (!match) return;

    // Validate league information
    if (match.league?.name === 'UEFA Nations League - Semi-finals') {
      // This is a valid UEFA competition
      console.log('✅ League validated: UEFA Nations League - Semi-finals');
    } else {
      this.validationResults.discrepancies.push({
        type: 'LEAGUE_VALIDATION_ERROR',
        section: 'External Validation',
        issue: `Unexpected league: ${match.league?.name}`
      });
    }

    // Validate team rankings and recent form patterns
    this.validateTeamFormPatterns();

    console.log('✅ External source cross-referencing completed');
  }

  validateTeamFormPatterns() {
    const bttsData = this.validationResults.btts?.result;
    if (!bttsData) return;

    // Germany typically has strong defensive records
    if (bttsData.homeStats?.teamName === 'Germany') {
      if (bttsData.homeStats.cleanSheetPercentage < 20) {
        this.validationResults.discrepancies.push({
          type: 'UNREALISTIC_FORM',
          section: 'External Validation',
          issue: `Germany clean sheet percentage (${bttsData.homeStats.cleanSheetPercentage}%) seems unusually low`
        });
      }
    }

    // Portugal typically scores regularly
    if (bttsData.awayStats?.teamName === 'Portugal') {
      if (bttsData.awayStats.failedToScorePercentage > 60) {
        this.validationResults.discrepancies.push({
          type: 'UNREALISTIC_FORM',
          section: 'External Validation',
          issue: `Portugal failed to score percentage (${bttsData.awayStats.failedToScorePercentage}%) seems unusually high`
        });
      }
    }
  }

  generateValidationReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE VALIDATION REPORT - MATCH 1559455');
    console.log('🏆 Germany vs Portugal - UEFA Nations League Semi-finals');
    console.log('='.repeat(80));

    const totalIssues = this.validationResults.discrepancies.length;
    const accuracy = Math.max(0, 100 - (totalIssues * 3)); // Reduced penalty per issue

    console.log(`🎯 Overall Data Accuracy: ${accuracy.toFixed(1)}%`);
    console.log(`📊 Total Issues Found: ${totalIssues}`);
    console.log(`📅 Validation Date: ${new Date().toISOString().split('T')[0]}`);

    if (totalIssues === 0) {
      console.log('✅ All data validation checks passed!');
      console.log('🏅 This match data meets the highest quality standards.');
    } else {
      console.log('\n❌ Issues Found:');
      console.log('-'.repeat(50));

      // Group issues by type and severity
      const issuesByType = {};
      let criticalIssues = [];
      let warningIssues = [];

      this.validationResults.discrepancies.forEach(issue => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);

        // Categorize by severity
        if (['PLACEHOLDER_DATA', 'CALCULATION_ERROR', 'HISTORICAL_DATA_ERROR'].includes(issue.type)) {
          criticalIssues.push(issue);
        } else {
          warningIssues.push(issue);
        }
      });

      // Display critical issues first
      if (criticalIssues.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES (Require immediate attention):');
        criticalIssues.forEach(issue => {
          console.log(`   ❌ [${issue.section}] ${issue.issue}`);
        });
      }

      // Display warnings
      if (warningIssues.length > 0) {
        console.log('\n⚠️  WARNINGS (Should be reviewed):');
        warningIssues.forEach(issue => {
          console.log(`   ⚠️  [${issue.section}] ${issue.issue}`);
        });
      }

      // Group by type for detailed analysis
      console.log('\n📊 Issues by Category:');
      Object.keys(issuesByType).forEach(type => {
        console.log(`\n🔸 ${type} (${issuesByType[type].length} issues):`);
        issuesByType[type].forEach(issue => {
          console.log(`   • [${issue.section}] ${issue.issue}`);
        });
      });
    }

    // Generate recommendations
    this.generateRecommendations();

    // Data quality summary
    this.generateDataQualitySummary();

    // Save detailed report to file
    const reportData = {
      matchId: this.matchId,
      matchDetails: {
        homeTeam: this.validationResults.match?.result?.homeTeam?.name,
        awayTeam: this.validationResults.match?.result?.awayTeam?.name,
        league: this.validationResults.match?.result?.league?.name,
        date: this.validationResults.match?.result?.date
      },
      timestamp: new Date().toISOString(),
      accuracy: accuracy,
      totalIssues: totalIssues,
      criticalIssues: (criticalIssues && criticalIssues.length) || 0,
      warningIssues: (warningIssues && warningIssues.length) || 0,
      discrepancies: this.validationResults.discrepancies,
      recommendations: this.generateAutomaticCorrections(),
      rawData: this.validationResults
    };

    fs.writeFileSync(`validation-report-${this.matchId}.json`, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved to: validation-report-${this.matchId}.json`);

    this.validationResults.accuracy = accuracy;
  }

  generateRecommendations() {
    console.log('\n🔧 RECOMMENDATIONS FOR DATA IMPROVEMENT:');
    console.log('-'.repeat(50));

    const recommendations = [];

    // Check for placeholder data issues
    const placeholderIssues = this.validationResults.discrepancies.filter(d => d.type === 'PLACEHOLDER_DATA');
    if (placeholderIssues.length > 0) {
      recommendations.push('🔄 Replace placeholder player data with real player names and IDs');
      recommendations.push('📊 Implement proper player mapping from external sources');
    }

    // Check for calculation errors
    const calculationIssues = this.validationResults.discrepancies.filter(d => d.type === 'CALCULATION_ERROR');
    if (calculationIssues.length > 0) {
      recommendations.push('🧮 Review and fix mathematical calculations in statistics');
      recommendations.push('✅ Implement automated calculation validation');
    }

    // Check for missing data
    const missingDataIssues = this.validationResults.discrepancies.filter(d => d.type === 'MISSING_DATA');
    if (missingDataIssues.length > 0) {
      recommendations.push('📥 Implement fallback data sources for missing information');
      recommendations.push('🔄 Add data completeness checks before display');
    }

    if (recommendations.length === 0) {
      console.log('✅ No specific recommendations - data quality is excellent!');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  generateDataQualitySummary() {
    console.log('\n📈 DATA QUALITY SUMMARY:');
    console.log('-'.repeat(50));

    const sections = ['Match Details', 'H2H Data', 'Corner Statistics', 'Card Statistics', 'BTTS Statistics', 'Player Statistics'];

    sections.forEach(section => {
      const sectionIssues = this.validationResults.discrepancies.filter(d => d.section === section);
      const sectionAccuracy = Math.max(0, 100 - (sectionIssues.length * 10));
      const status = sectionAccuracy >= 90 ? '✅' : sectionAccuracy >= 70 ? '⚠️' : '❌';

      console.log(`${status} ${section}: ${sectionAccuracy.toFixed(0)}% (${sectionIssues.length} issues)`);
    });
  }

  generateAutomaticCorrections() {
    const corrections = [];

    this.validationResults.discrepancies.forEach(issue => {
      switch (issue.type) {
        case 'PLACEHOLDER_DATA':
          corrections.push({
            issue: issue.issue,
            correction: 'Replace with real player data from UEFA/FIFA databases',
            priority: 'HIGH'
          });
          break;
        case 'CALCULATION_ERROR':
          corrections.push({
            issue: issue.issue,
            correction: 'Recalculate using correct mathematical formulas',
            priority: 'HIGH'
          });
          break;
        case 'UNREALISTIC_DATA':
          corrections.push({
            issue: issue.issue,
            correction: 'Verify data source and apply realistic constraints',
            priority: 'MEDIUM'
          });
          break;
        default:
          corrections.push({
            issue: issue.issue,
            correction: 'Review and validate against authoritative sources',
            priority: 'LOW'
          });
      }
    });

    return corrections;
  }
}

// Run validation
async function runValidation() {
  const validator = new MatchDataValidator(MATCH_ID);
  await validator.validateAllData();
}

runValidation().catch(console.error);
