const axios = require('axios');

// Test script to verify that live matches maintain their statistical data
async function testLiveMatchStatistics() {
  console.log('🔍 Testing Live Match Statistics Fix...\n');

  try {
    // Test 1: Get a live match
    console.log('1. Fetching live matches...');
    const liveResponse = await axios.get('http://localhost:5000/api/matches/live');
    const liveMatches = liveResponse.data.result || [];

    if (liveMatches.length === 0) {
      console.log('⚠️ No live matches found. Testing with upcoming matches instead...');

      // Fallback to upcoming matches
      const upcomingResponse = await axios.get('http://localhost:5000/api/matches/upcoming');
      const upcomingMatches = upcomingResponse.data.result || [];

      if (upcomingMatches.length === 0) {
        console.log('❌ No matches found to test');
        return;
      }

      const testMatch = upcomingMatches[0];
      console.log(`✅ Using upcoming match: ${testMatch.homeTeam.name} vs ${testMatch.awayTeam.name} (ID: ${testMatch.id})`);
      await testMatchStatistics(testMatch.id, 'upcoming');
    } else {
      const testMatch = liveMatches[0];
      console.log(`✅ Using live match: ${testMatch.homeTeam.name} vs ${testMatch.awayTeam.name} (ID: ${testMatch.id})`);
      await testMatchStatistics(testMatch.id, 'live');
    }

  } catch (error) {
    console.error('❌ Error testing live match statistics:', error.message);
  }
}

async function testMatchStatistics(matchId, matchType) {
  console.log(`\n2. Testing statistics for ${matchType} match ID: ${matchId}`);

  const tests = [
    { name: 'Corner Stats', endpoint: `/api/matches/${matchId}/corners?matches=10` },
    { name: 'Card Stats', endpoint: `/api/matches/${matchId}/cards?matches=10` },
    { name: 'BTTS Stats', endpoint: `/api/matches/${matchId}/btts?matches=10` },
    { name: 'Player Stats', endpoint: `/api/matches/${matchId}/players?matches=10` },
    { name: 'H2H Data', endpoint: `/api/matches/${matchId}/h2h` }
  ];

  for (const test of tests) {
    try {
      console.log(`\n   Testing ${test.name}...`);
      const response = await axios.get(`http://localhost:5000${test.endpoint}`);

      if (response.data.success) {
        const result = response.data.result;

        // Check if we have actual data (not empty/fallback)
        let hasData = false;
        let dataInfo = '';

        switch (test.name) {
          case 'Corner Stats':
            hasData = result.homeStats?.matchesAnalyzed > 0 || result.awayStats?.matchesAnalyzed > 0;
            dataInfo = `Home: ${result.homeStats?.matchesAnalyzed || 0} matches, Away: ${result.awayStats?.matchesAnalyzed || 0} matches`;
            break;
          case 'Card Stats':
            hasData = result.homeStats?.matchesAnalyzed > 0 || result.awayStats?.matchesAnalyzed > 0;
            dataInfo = `Home: ${result.homeStats?.matchesAnalyzed || 0} matches, Away: ${result.awayStats?.matchesAnalyzed || 0} matches`;
            break;
          case 'BTTS Stats':
            hasData = result.homeStats?.totalMatches > 0 || result.awayStats?.totalMatches > 0;
            dataInfo = `Home: ${result.homeStats?.totalMatches || 0} matches, Away: ${result.awayStats?.totalMatches || 0} matches`;
            break;
          case 'Player Stats':
            hasData = result.homeTeamPlayers?.length > 0 || result.awayTeamPlayers?.length > 0;
            dataInfo = `Home players: ${result.homeTeamPlayers?.length || 0}, Away players: ${result.awayTeamPlayers?.length || 0}`;
            break;
          case 'H2H Data':
            hasData = result.matches?.length > 0;
            dataInfo = `H2H matches: ${result.matches?.length || 0}`;
            break;
        }

        if (hasData) {
          console.log(`   ✅ ${test.name}: Data available - ${dataInfo}`);
        } else {
          console.log(`   ⚠️ ${test.name}: No data available - ${dataInfo}`);
        }
      } else {
        console.log(`   ❌ ${test.name}: API error - ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: Request failed - ${error.message}`);
    }
  }
}

// Run the test
testLiveMatchStatistics();
