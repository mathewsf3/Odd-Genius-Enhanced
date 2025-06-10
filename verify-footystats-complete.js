/**
 * Comprehensive FootyStats API Verification Script
 * Tests all 16+ endpoints from API documentation to ensure complete coverage
 */

const axios = require('axios');

// FootyStats API Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.football-data-api.com',
  API_KEY: '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756',
  TIMEOUT: 15000
};

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  errors: []
};

/**
 * Make API request with error handling
 */
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const requestParams = {
      key: API_CONFIG.API_KEY,
      ...params
    };

    console.log(`🔍 Testing: ${endpoint}`);
    
    const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
      params: requestParams,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'User-Agent': 'OddGenius-FootyStats-Test/1.0',
        'Accept': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
      dataSize: JSON.stringify(response.data).length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 'NETWORK_ERROR',
      details: error.response?.data || null
    };
  }
};

/**
 * Test endpoint and record results
 */
const testEndpoint = async (name, endpoint, params = {}, description = '') => {
  console.log(`\n📡 ${name.toUpperCase()}`);
  console.log(`Description: ${description}`);
  
  const result = await makeApiRequest(endpoint, params);
  
  if (result.success) {
    console.log(`✅ SUCCESS - Status: ${result.status}, Data size: ${result.dataSize} chars`);
    testResults.passed.push({
      name,
      endpoint,
      params,
      status: result.status,
      dataSize: result.dataSize,
      description
    });
  } else {
    console.log(`❌ FAILED - Status: ${result.status}, Error: ${result.error}`);
    testResults.failed.push({
      name,
      endpoint,
      params,
      error: result.error,
      status: result.status,
      details: result.details,
      description
    });
  }
  
  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return result;
};

/**
 * Main verification function
 */
const verifyFootyStatsAPI = async () => {
  console.log('🚀 FOOTYSTATS API COMPLETE VERIFICATION');
  console.log('=' * 50);
  
  try {
    // 1. League List / Country List
    await testEndpoint(
      'league-list',
      '/league-list',
      {},
      'Get all available leagues and seasons with IDs'
    );
    
    await testEndpoint(
      'league-list-chosen',
      '/league-list',
      { chosen_leagues_only: true },
      'Get only subscribed leagues'
    );
    
    await testEndpoint(
      'country-list',
      '/country-list',
      {},
      'Get all supported countries with ISO codes'
    );

    // 2. Today's Matches / League Matches
    await testEndpoint(
      'todays-matches',
      '/todays-matches',
      {},
      'Get matches for today with comprehensive stats'
    );
    
    await testEndpoint(
      'matches-by-date',
      '/todays-matches',
      { date: '2024-12-15' },
      'Get matches for specific date'
    );

    // Get a sample season ID for further tests
    const leagueResult = await makeApiRequest('/league-list', { chosen_leagues_only: true });
    let sampleSeasonId = null;
    
    if (leagueResult.success && leagueResult.data && leagueResult.data.length > 0) {
      // Find a season with proper ID
      for (const league of leagueResult.data) {
        if (league.season && league.season.id) {
          sampleSeasonId = league.season.id;
          console.log(`📝 Using sample season ID: ${sampleSeasonId} (${league.name})`);
          break;
        }
      }
    }

    if (sampleSeasonId) {
      // 3. League Stats/Teams / League Tables
      await testEndpoint(
        'league-season',
        '/league-season',
        { season_id: sampleSeasonId },
        'Get comprehensive league statistics and all teams'
      );
      
      await testEndpoint(
        'league-teams',
        '/league-teams',
        { season_id: sampleSeasonId, include: 'stats' },
        'Get teams for specific league with statistics'
      );
      
      await testEndpoint(
        'league-tables',
        '/league-tables',
        { season_id: sampleSeasonId },
        'Get league standings/classification tables'
      );
      
      await testEndpoint(
        'league-matches',
        '/league-matches',
        { season_id: sampleSeasonId, max_per_page: 100 },
        'Get all matches for specific league/season'
      );

      // 4. League Players / Player individual
      await testEndpoint(
        'league-players',
        '/league-players',
        { season_id: sampleSeasonId, include: 'stats', page: 1 },
        'Get all players in league with statistics'
      );

      // 5. League Referees / Referee individual  
      await testEndpoint(
        'league-referees',
        '/league-referees',
        { season_id: sampleSeasonId },
        'Get all referees in league with statistics'
      );

      // Get sample team ID and player ID for individual tests
      const teamsResult = await makeApiRequest('/league-teams', { 
        season_id: sampleSeasonId, 
        include: 'stats' 
      });
      
      let sampleTeamId = null;
      if (teamsResult.success && teamsResult.data && teamsResult.data.length > 0) {
        sampleTeamId = teamsResult.data[0].id;
        console.log(`📝 Using sample team ID: ${sampleTeamId}`);
      }

      if (sampleTeamId) {
        // 6. Team individual stats / Team Last X
        await testEndpoint(
          'team-stats',
          '/team',
          { team_id: sampleTeamId, include: 'stats' },
          'Get individual team statistics'
        );
        
        await testEndpoint(
          'team-lastx',
          '/lastx',
          { team_id: sampleTeamId },
          'Get team form - last 5, 6, 10 matches statistics'
        );
      }

      // Get sample player ID
      const playersResult = await makeApiRequest('/league-players', { 
        season_id: sampleSeasonId, 
        include: 'stats',
        page: 1
      });
      
      let samplePlayerId = null;
      if (playersResult.success && playersResult.data && playersResult.data.length > 0) {
        samplePlayerId = playersResult.data[0].id;
        console.log(`📝 Using sample player ID: ${samplePlayerId}`);
      }

      if (samplePlayerId) {
        await testEndpoint(
          'player-stats',
          '/player-stats',
          { player_id: samplePlayerId },
          'Get individual player career statistics'
        );
      }

      // Get sample referee ID
      const refereesResult = await makeApiRequest('/league-referees', { 
        season_id: sampleSeasonId 
      });
      
      let sampleRefereeId = null;
      if (refereesResult.success && refereesResult.data && refereesResult.data.length > 0) {
        sampleRefereeId = refereesResult.data[0].id;
        console.log(`📝 Using sample referee ID: ${sampleRefereeId}`);
      }

      if (sampleRefereeId) {
        await testEndpoint(
          'referee-stats',
          '/referee',
          { referee_id: sampleRefereeId },
          'Get individual referee career statistics'
        );
      }

      // Get sample match ID for detailed match test
      const matchesResult = await makeApiRequest('/league-matches', { 
        season_id: sampleSeasonId,
        max_per_page: 10
      });
      
      let sampleMatchId = null;
      if (matchesResult.success && matchesResult.data && matchesResult.data.length > 0) {
        // Find a completed match
        for (const match of matchesResult.data) {
          if (match.id && match.status === 'complete') {
            sampleMatchId = match.id;
            console.log(`📝 Using sample match ID: ${sampleMatchId}`);
            break;
          }
        }
      }

      if (sampleMatchId) {
        // 7. Match Details with lineups/H2H
        await testEndpoint(
          'match-details',
          '/match',
          { match_id: sampleMatchId },
          'Get detailed match info with lineups, H2H, trends'
        );
      }
    }

    // 8. BTTS Stats / Over 2.5 Stats
    await testEndpoint(
      'btts-stats',
      '/stats-data-btts',
      {},
      'Get Both Teams To Score statistics rankings'
    );
    
    await testEndpoint(
      'over25-stats',
      '/stats-data-over25',
      {},
      'Get Over 2.5 goals statistics rankings'
    );

  } catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    testResults.errors.push(error.message);
  }

  // Print comprehensive results
  console.log('\n' + '='.repeat(60));
  console.log('📊 FOOTYSTATS API VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ PASSED ENDPOINTS: ${testResults.passed.length}`);
  testResults.passed.forEach(test => {
    console.log(`  ✓ ${test.name} - ${test.description}`);
  });
  
  console.log(`\n❌ FAILED ENDPOINTS: ${testResults.failed.length}`);
  testResults.failed.forEach(test => {
    console.log(`  ✗ ${test.name} - ${test.error} (Status: ${test.status})`);
  });
  
  if (testResults.errors.length > 0) {
    console.log(`\n🚨 SYSTEM ERRORS: ${testResults.errors.length}`);
    testResults.errors.forEach(error => {
      console.log(`  ! ${error}`);
    });
  }

  console.log('\n📈 COVERAGE SUMMARY:');
  const totalTests = testResults.passed.length + testResults.failed.length;
  const successRate = totalTests > 0 ? (testResults.passed.length / totalTests * 100).toFixed(1) : 0;
  console.log(`  Total endpoints tested: ${totalTests}`);
  console.log(`  Success rate: ${successRate}%`);
  
  // Verify all 16+ documented endpoints are covered
  const expectedEndpoints = [
    'league-list', 'country-list', 'todays-matches', 'league-season',
    'league-teams', 'league-tables', 'league-matches', 'league-players',
    'player-stats', 'league-referees', 'referee-stats', 'team-stats',
    'team-lastx', 'match-details', 'btts-stats', 'over25-stats'
  ];
  
  const testedEndpoints = [...testResults.passed, ...testResults.failed].map(t => t.name);
  const missingEndpoints = expectedEndpoints.filter(e => !testedEndpoints.includes(e));
  
  if (missingEndpoints.length === 0) {
    console.log('\n🎉 ALL DOCUMENTED ENDPOINTS COVERED!');
  } else {
    console.log(`\n⚠️  Missing endpoints: ${missingEndpoints.join(', ')}`);
  }

  return {
    totalTests,
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    errors: testResults.errors.length,
    successRate: parseFloat(successRate),
    allEndpointsCovered: missingEndpoints.length === 0
  };
};

// Run verification
if (require.main === module) {
  verifyFootyStatsAPI()
    .then(results => {
      console.log('\n✨ Verification completed');
      process.exit(results.failed === 0 && results.errors === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyFootyStatsAPI, testResults };
