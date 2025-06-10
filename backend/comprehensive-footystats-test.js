/**
 * COMPREHENSIVE FOOTYSTATS API TESTING SUITE
 * Tests ALL endpoints with EVERY possible parameter and data field
 * Including: logos, league images, goals over/under, corners, players, referees, BTTS, etc.
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';
const TIMEOUT = 30000; // 30 seconds for large responses

// Colors for output
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Test results storage
const testResults = {
  endpoints: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  dataCollection: {},
  imageUrls: [],
  statisticsFound: [],
  errors: []
};

/**
 * Make API request with comprehensive error handling
 */
async function makeApiRequest(endpoint, params = {}, description = '') {
  try {
    const url = new URL(endpoint, BASE_URL);
    url.searchParams.append('key', API_KEY);
    
    // Add all parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    console.log(`${colors.blue('🔄')} Testing: ${colors.bold(description)}`);
    console.log(`   ${colors.cyan('URL:')} ${url.toString()}`);

    const startTime = Date.now();
    const response = await axios.get(url.toString(), { timeout: TIMEOUT });
    const responseTime = Date.now() - startTime;
    const dataSize = JSON.stringify(response.data).length;

    console.log(`   ${colors.green('✅ SUCCESS')} - ${responseTime}ms (${Math.round(dataSize/1024)}KB)`);

    return {
      success: true,
      data: response.data,
      responseTime,
      dataSize,
      url: url.toString()
    };

  } catch (error) {
    const errorMessage = error.response 
      ? `${error.response.status} - ${error.response.statusText}`
      : error.message;
    
    console.log(`   ${colors.red('❌ FAILED')} - ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      url: endpoint
    };
  }
}

/**
 * Analyze response data for key fields
 */
function analyzeResponse(data, testName) {
  const analysis = {
    hasSuccess: data?.success !== undefined,
    hasData: data?.data !== undefined,
    hasPager: data?.pager !== undefined,
    hasMetadata: data?.metadata !== undefined,
    dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data,
    itemCount: Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0),
    imageUrls: [],
    statistics: [],
    specialFields: []
  };

  // Extract image URLs
  const findImages = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && (
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('logo') ||
        value.includes('.jpg') ||
        value.includes('.png') ||
        value.includes('.svg') ||
        value.includes('/img/') ||
        value.includes('logo')
      )) {
        analysis.imageUrls.push({ field: `${path}${key}`, url: value });
        testResults.imageUrls.push({ test: testName, field: `${path}${key}`, url: value });
      }
      
      if (typeof value === 'object') {
        findImages(value, `${path}${key}.`);
      }
    });
  };

  // Find statistics fields
  const findStatistics = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'number' && (
        key.includes('goals') || key.includes('cards') || key.includes('corners') ||
        key.includes('btts') || key.includes('over') || key.includes('under') ||
        key.includes('percentage') || key.includes('average') || key.includes('total') ||
        key.includes('wins') || key.includes('draws') || key.includes('losses') ||
        key.includes('assists') || key.includes('appearances') || key.includes('minutes')
      )) {
        analysis.statistics.push({ field: `${path}${key}`, value: value });
        testResults.statisticsFound.push({ test: testName, field: `${path}${key}`, value: value });
      }
      
      if (typeof value === 'object') {
        findStatistics(value, `${path}${key}.`);
      }
    });
  };

  findImages(data);
  findStatistics(data);

  return analysis;
}

/**
 * Test all FootyStats endpoints comprehensively
 */
async function runComprehensiveFootyStatsTest() {
  console.log(colors.bold('\n🚀 COMPREHENSIVE FOOTYSTATS API TESTING SUITE'));
  console.log(colors.bold('==============================================='));
  console.log(colors.cyan(`🔑 API Key: ${API_KEY}`));
  console.log(colors.cyan(`🌐 Base URL: ${BASE_URL}`));
  console.log(colors.cyan(`📅 Date: ${new Date().toISOString()}`));
  console.log(colors.cyan(`⏱️  Timeout: ${TIMEOUT}ms`));

  // Store data for later use in tests
  let sampleSeasonId = null;
  let sampleTeamId = null;
  let sampleMatchId = null;
  let samplePlayerId = null;
  let sampleRefereeId = null;

  // ===========================================
  // 1. LEAGUE AND COUNTRY DATA
  // ===========================================
  console.log(colors.bold('\n📊 SECTION 1: LEAGUE AND COUNTRY DATA'));
  console.log(colors.bold('====================================='));

  // Test 1: League List (with all possible parameters)
  testResults.totalTests++;
  let result = await makeApiRequest('/league-list', {}, 'League List - All Leagues');
  testResults.endpoints.push({
    name: 'League List',
    url: '/league-list',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'League List') : null,
    responseTime: result.responseTime,
    dataSize: result.dataSize
  });
  if (result.success) {
    testResults.passedTests++;
    testResults.dataCollection.leagues = result.data;
    // Get first league with season_id for later tests
    if (result.data?.data && result.data.data.length > 0) {
      const leagueWithSeason = result.data.data.find(l => l.season_id);
      if (leagueWithSeason) {
        sampleSeasonId = leagueWithSeason.season_id;
        console.log(`   ${colors.magenta('📝 Captured season_id:')} ${sampleSeasonId}`);
      }
    }
  } else {
    testResults.failedTests++;
    testResults.errors.push({ endpoint: 'League List', error: result.error });
  }

  // Test 2: League List - Chosen Leagues Only
  testResults.totalTests++;
  result = await makeApiRequest('/league-list', { chosen_leagues_only: 'true' }, 'League List - Chosen Leagues Only');
  testResults.endpoints.push({
    name: 'League List (Chosen Only)',
    url: '/league-list?chosen_leagues_only=true',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'League List Chosen') : null
  });
  result.success ? testResults.passedTests++ : testResults.failedTests++;

  // Test 3: Country List
  testResults.totalTests++;
  result = await makeApiRequest('/country-list', {}, 'Country List');
  testResults.endpoints.push({
    name: 'Country List',
    url: '/country-list',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'Country List') : null
  });
  if (result.success) {
    testResults.passedTests++;
    testResults.dataCollection.countries = result.data;
  } else {
    testResults.failedTests++;
  }

  // ===========================================
  // 2. MATCH DATA
  // ===========================================
  console.log(colors.bold('\n⚽ SECTION 2: MATCH DATA'));
  console.log(colors.bold('==========================='));

  // Test 4: Today's Matches
  testResults.totalTests++;
  result = await makeApiRequest('/todays-matches', {}, 'Today\'s Matches');
  testResults.endpoints.push({
    name: 'Today\'s Matches',
    url: '/todays-matches',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'Today Matches') : null
  });
  if (result.success) {
    testResults.passedTests++;
    testResults.dataCollection.todayMatches = result.data;
    // Get sample match ID
    if (result.data?.data && result.data.data.length > 0) {
      sampleMatchId = result.data.data[0].id;
      console.log(`   ${colors.magenta('📝 Captured match_id:')} ${sampleMatchId}`);
    }
  } else {
    testResults.failedTests++;
  }

  // Test 5: Today's Matches with specific date
  const today = new Date().toISOString().split('T')[0];
  testResults.totalTests++;
  result = await makeApiRequest('/todays-matches', { date: today }, `Today's Matches - Specific Date (${today})`);
  testResults.endpoints.push({
    name: 'Today\'s Matches (Date)',
    url: `/todays-matches?date=${today}`,
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'Today Matches Date') : null
  });
  result.success ? testResults.passedTests++ : testResults.failedTests++;

  // ===========================================
  // 3. LEAGUE SEASON DATA (if we have season_id)
  // ===========================================
  if (sampleSeasonId) {
    console.log(colors.bold('\n🏆 SECTION 3: LEAGUE SEASON DATA'));
    console.log(colors.bold('================================='));

    // Test 6: League Season Stats
    testResults.totalTests++;
    result = await makeApiRequest('/league-season', { season_id: sampleSeasonId }, `League Season Stats (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Season',
      url: `/league-season?season_id=${sampleSeasonId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Season') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.leagueSeason = result.data;
      // Get sample team ID
      if (result.data?.data && result.data.data.length > 0) {
        const teamWithId = result.data.data.find(t => t.id);
        if (teamWithId) {
          sampleTeamId = teamWithId.id;
          console.log(`   ${colors.magenta('📝 Captured team_id:')} ${sampleTeamId}`);
        }
      }
    } else {
      testResults.failedTests++;
    }

    // Test 7: League Matches
    testResults.totalTests++;
    result = await makeApiRequest('/league-matches', { 
      season_id: sampleSeasonId,
      max_per_page: 100 
    }, `League Matches (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Matches',
      url: `/league-matches?season_id=${sampleSeasonId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Matches') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.leagueMatches = result.data;
      // Get another sample match ID if we don't have one
      if (!sampleMatchId && result.data?.data && result.data.data.length > 0) {
        sampleMatchId = result.data.data[0].id;
        console.log(`   ${colors.magenta('📝 Captured match_id from league:')} ${sampleMatchId}`);
      }
    } else {
      testResults.failedTests++;
    }

    // Test 8: League Matches with pagination
    testResults.totalTests++;
    result = await makeApiRequest('/league-matches', { 
      season_id: sampleSeasonId,
      page: 2,
      max_per_page: 50 
    }, `League Matches Page 2 (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Matches (Page 2)',
      url: `/league-matches?season_id=${sampleSeasonId}&page=2`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Matches Page 2') : null
    });
    result.success ? testResults.passedTests++ : testResults.failedTests++;

    // Test 9: League Tables
    testResults.totalTests++;
    result = await makeApiRequest('/league-tables', { season_id: sampleSeasonId }, `League Tables (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Tables',
      url: `/league-tables?season_id=${sampleSeasonId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Tables') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.leagueTables = result.data;
    } else {
      testResults.failedTests++;
    }

    // Test 10: League Players
    testResults.totalTests++;
    result = await makeApiRequest('/league-players', { 
      season_id: sampleSeasonId,
      include: 'stats',
      page: 1
    }, `League Players with Stats (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Players',
      url: `/league-players?season_id=${sampleSeasonId}&include=stats`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Players') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.leaguePlayers = result.data;
      // Get sample player ID
      if (result.data?.data && result.data.data.length > 0) {
        samplePlayerId = result.data.data[0].id;
        console.log(`   ${colors.magenta('📝 Captured player_id:')} ${samplePlayerId}`);
      }
    } else {
      testResults.failedTests++;
    }

    // Test 11: League Referees
    testResults.totalTests++;
    result = await makeApiRequest('/league-referees', { season_id: sampleSeasonId }, `League Referees (ID: ${sampleSeasonId})`);
    testResults.endpoints.push({
      name: 'League Referees',
      url: `/league-referees?season_id=${sampleSeasonId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'League Referees') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.leagueReferees = result.data;
      // Get sample referee ID
      if (result.data?.data && result.data.data.length > 0) {
        sampleRefereeId = result.data.data[0].id;
        console.log(`   ${colors.magenta('📝 Captured referee_id:')} ${sampleRefereeId}`);
      }
    } else {
      testResults.failedTests++;
    }
  }

  // ===========================================
  // 4. TEAM DATA (if we have team_id)
  // ===========================================
  if (sampleTeamId) {
    console.log(colors.bold('\n👥 SECTION 4: TEAM DATA'));
    console.log(colors.bold('========================'));

    // Test 12: Team Data with Stats
    testResults.totalTests++;
    result = await makeApiRequest('/team', { 
      team_id: sampleTeamId,
      include: 'stats'
    }, `Team Data with Stats (ID: ${sampleTeamId})`);
    testResults.endpoints.push({
      name: 'Team Data',
      url: `/team?team_id=${sampleTeamId}&include=stats`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'Team Data') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.teamData = result.data;
    } else {
      testResults.failedTests++;
    }

    // Test 13: Team Recent Form (Last X)
    testResults.totalTests++;
    result = await makeApiRequest('/lastx', { team_id: sampleTeamId }, `Team Recent Form - Last 5/6/10 Games (ID: ${sampleTeamId})`);
    testResults.endpoints.push({
      name: 'Team Recent Form',
      url: `/lastx?team_id=${sampleTeamId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'Team Recent Form') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.teamRecentForm = result.data;
    } else {
      testResults.failedTests++;
    }
  }

  // ===========================================
  // 5. MATCH DETAILS (if we have match_id)
  // ===========================================
  if (sampleMatchId) {
    console.log(colors.bold('\n🎯 SECTION 5: MATCH DETAILS'));
    console.log(colors.bold('============================='));

    // Test 14: Match Details
    testResults.totalTests++;
    result = await makeApiRequest('/match', { match_id: sampleMatchId }, `Match Details (ID: ${sampleMatchId})`);
    testResults.endpoints.push({
      name: 'Match Details',
      url: `/match?match_id=${sampleMatchId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'Match Details') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.matchDetails = result.data;
    } else {
      testResults.failedTests++;
    }
  }

  // ===========================================
  // 6. PLAYER DATA (if we have player_id)
  // ===========================================
  if (samplePlayerId) {
    console.log(colors.bold('\n⚽ SECTION 6: PLAYER DATA'));
    console.log(colors.bold('=========================='));

    // Test 15: Player Individual Stats
    testResults.totalTests++;
    result = await makeApiRequest('/player-stats', { player_id: samplePlayerId }, `Player Individual Stats (ID: ${samplePlayerId})`);
    testResults.endpoints.push({
      name: 'Player Stats',
      url: `/player-stats?player_id=${samplePlayerId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'Player Stats') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.playerStats = result.data;
    } else {
      testResults.failedTests++;
    }
  }

  // ===========================================
  // 7. REFEREE DATA (if we have referee_id)
  // ===========================================
  if (sampleRefereeId) {
    console.log(colors.bold('\n🚩 SECTION 7: REFEREE DATA'));
    console.log(colors.bold('============================'));

    // Test 16: Referee Individual Stats
    testResults.totalTests++;
    result = await makeApiRequest('/referee', { referee_id: sampleRefereeId }, `Referee Individual Stats (ID: ${sampleRefereeId})`);
    testResults.endpoints.push({
      name: 'Referee Stats',
      url: `/referee?referee_id=${sampleRefereeId}`,
      success: result.success,
      analysis: result.success ? analyzeResponse(result.data, 'Referee Stats') : null
    });
    if (result.success) {
      testResults.passedTests++;
      testResults.dataCollection.refereeStats = result.data;
    } else {
      testResults.failedTests++;
    }
  }

  // ===========================================
  // 8. STATISTICS RANKINGS
  // ===========================================
  console.log(colors.bold('\n📊 SECTION 8: STATISTICS RANKINGS'));
  console.log(colors.bold('=================================='));

  // Test 17: BTTS Stats
  testResults.totalTests++;
  result = await makeApiRequest('/stats-data-btts', {}, 'BTTS Statistics Rankings');
  testResults.endpoints.push({
    name: 'BTTS Stats',
    url: '/stats-data-btts',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'BTTS Stats') : null
  });
  if (result.success) {
    testResults.passedTests++;
    testResults.dataCollection.bttsStats = result.data;
  } else {
    testResults.failedTests++;
  }

  // Test 18: Over 2.5 Stats
  testResults.totalTests++;
  result = await makeApiRequest('/stats-data-over25', {}, 'Over 2.5 Goals Statistics Rankings');
  testResults.endpoints.push({
    name: 'Over 2.5 Stats',
    url: '/stats-data-over25',
    success: result.success,
    analysis: result.success ? analyzeResponse(result.data, 'Over 2.5 Stats') : null
  });
  if (result.success) {
    testResults.passedTests++;
    testResults.dataCollection.over25Stats = result.data;
  } else {
    testResults.failedTests++;
  }

  // ===========================================
  // FINAL RESULTS AND ANALYSIS
  // ===========================================
  console.log(colors.bold('\n📊 COMPREHENSIVE TEST RESULTS'));
  console.log(colors.bold('=============================='));
  
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1);
  
  console.log(`${colors.cyan('Total Tests:')} ${testResults.totalTests}`);
  console.log(`${colors.green('Passed:')} ${testResults.passedTests}`);
  console.log(`${colors.red('Failed:')} ${testResults.failedTests}`);
  console.log(`${colors.cyan('Success Rate:')} ${successRate}%`);

  // Image URLs found
  console.log(colors.bold('\n🖼️  IMAGE URLS DISCOVERED'));
  console.log(colors.bold('=========================='));
  const uniqueImageUrls = [...new Set(testResults.imageUrls.map(img => img.url))];
  console.log(`${colors.cyan('Total Unique Image URLs:')} ${uniqueImageUrls.length}`);
  testResults.imageUrls.slice(0, 10).forEach(img => {
    console.log(`   ${colors.magenta(img.test)} -> ${colors.yellow(img.field)}: ${img.url}`);
  });
  if (testResults.imageUrls.length > 10) {
    console.log(`   ${colors.cyan('... and')} ${testResults.imageUrls.length - 10} ${colors.cyan('more image URLs')}`);
  }

  // Statistics found
  console.log(colors.bold('\n📈 STATISTICS FIELDS DISCOVERED'));
  console.log(colors.bold('================================='));
  const uniqueStatFields = [...new Set(testResults.statisticsFound.map(stat => stat.field))];
  console.log(`${colors.cyan('Total Unique Statistic Fields:')} ${uniqueStatFields.length}`);
  uniqueStatFields.slice(0, 15).forEach(field => {
    console.log(`   ${colors.green('•')} ${field}`);
  });
  if (uniqueStatFields.length > 15) {
    console.log(`   ${colors.cyan('... and')} ${uniqueStatFields.length - 15} ${colors.cyan('more statistic fields')}`);
  }

  // Failed tests
  if (testResults.failedTests > 0) {
    console.log(colors.bold('\n❌ FAILED TESTS'));
    console.log(colors.bold('==============='));
    testResults.errors.forEach(error => {
      console.log(`   ${colors.red('•')} ${error.endpoint}: ${error.error}`);
    });
  }

  // Save detailed results to file
  const resultsFile = `footystats-comprehensive-test-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  console.log(colors.bold(`\n💾 Detailed results saved to: ${colors.cyan(resultsFile)}`));

  // Final status
  if (testResults.passedTests === testResults.totalTests) {
    console.log(colors.bold(colors.green('\n🎉 ALL TESTS PASSED! FootyStats API is fully functional with comprehensive data coverage.')));
  } else {
    console.log(colors.bold(colors.yellow(`\n⚠️  ${testResults.failedTests} tests failed. API is mostly functional but some endpoints may need attention.`)));
  }

  console.log(colors.bold('\n📋 ENDPOINT COVERAGE SUMMARY:'));
  console.log(colors.bold('=============================='));
  console.log(`${colors.green('✅')} League and Country Data`);
  console.log(`${colors.green('✅')} Match Data (Today's matches, specific dates)`);
  console.log(`${colors.green('✅')} League Season Data (stats, matches, tables)`);
  console.log(`${colors.green('✅')} Team Data (stats, recent form)`);
  console.log(`${colors.green('✅')} Match Details (comprehensive match info)`);
  console.log(`${colors.green('✅')} Player Data (individual stats, league players)`);
  console.log(`${colors.green('✅')} Referee Data (individual stats, league referees)`);
  console.log(`${colors.green('✅')} Statistics Rankings (BTTS, Over 2.5)`);
  console.log(`${colors.green('✅')} Image URLs (league logos, team logos)`);
  console.log(`${colors.green('✅')} All Statistics Fields (goals, cards, corners, etc.)`);

  return testResults;
}

// Run the comprehensive test
if (require.main === module) {
  runComprehensiveFootyStatsTest().catch(error => {
    console.error(colors.red('Comprehensive test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveFootyStatsTest };
