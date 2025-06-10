const axios = require('axios');

/**
 * Test data availability from both APIs for match 1499505
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function testAPIDataAvailability() {
  console.log('🔍 TESTING API DATA AVAILABILITY FOR MATCH 1499505');
  console.log('=' .repeat(70));
  
  const results = {
    allSports: {},
    apiFootball: {},
    ourAPI: {}
  };

  // Test 1: AllSportsAPI - Match Details
  console.log('\n📊 Testing AllSportsAPI - Match Details...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        matchId: '1499505'
      },
      timeout: 15000
    });
    
    results.allSports.matchDetails = {
      success: true,
      data: response.data?.result?.[0] || response.data,
      hasData: !!response.data?.result?.[0]
    };
    
    console.log('✅ AllSportsAPI Match Details:', results.allSports.matchDetails.hasData ? 'Available' : 'No Data');
    if (results.allSports.matchDetails.hasData) {
      const match = results.allSports.matchDetails.data;
      console.log(`   📋 Match: ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`   📅 Date: ${match.event_date}`);
      console.log(`   🏆 League: ${match.league_name}`);
      console.log(`   ⚽ Score: ${match.event_final_result || 'N/A'}`);
    }
  } catch (error) {
    results.allSports.matchDetails = { success: false, error: error.message };
    console.log('❌ AllSportsAPI Match Details:', error.message);
  }

  // Test 2: AllSportsAPI - Match with Player Stats
  console.log('\n👥 Testing AllSportsAPI - Player Statistics...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        matchId: '1499505',
        withPlayerStats: 1
      },
      timeout: 15000
    });
    
    results.allSports.playerStats = {
      success: true,
      data: response.data?.result?.[0] || response.data,
      hasPlayerData: !!(response.data?.result?.[0]?.players_home_lineup || response.data?.result?.[0]?.players_away_lineup)
    };
    
    console.log('✅ AllSportsAPI Player Stats:', results.allSports.playerStats.hasPlayerData ? 'Available' : 'No Player Data');
    if (results.allSports.playerStats.hasPlayerData) {
      const match = results.allSports.playerStats.data;
      const homePlayers = match.players_home_lineup?.length || 0;
      const awayPlayers = match.players_away_lineup?.length || 0;
      console.log(`   👥 Home Players: ${homePlayers}`);
      console.log(`   👥 Away Players: ${awayPlayers}`);
    }
  } catch (error) {
    results.allSports.playerStats = { success: false, error: error.message };
    console.log('❌ AllSportsAPI Player Stats:', error.message);
  }

  // Test 3: AllSportsAPI - Team Fixtures for Historical Data
  console.log('\n📈 Testing AllSportsAPI - Team Historical Data...');
  try {
    // Get team IDs from match details
    const homeTeamId = results.allSports.matchDetails.data?.event_home_team_id;
    const awayTeamId = results.allSports.matchDetails.data?.event_away_team_id;
    
    if (homeTeamId) {
      const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: ALLSPORTS_API_KEY,
          teamId: homeTeamId,
          from: '2024-01-01',
          to: '2025-06-03'
        },
        timeout: 15000
      });
      
      results.allSports.teamHistory = {
        success: true,
        homeTeamMatches: response.data?.result?.length || 0,
        hasHistoricalData: (response.data?.result?.length || 0) > 0
      };
      
      console.log(`✅ AllSportsAPI Team History: ${results.allSports.teamHistory.homeTeamMatches} matches found`);
    } else {
      console.log('⚠️  No team ID available for historical data');
    }
  } catch (error) {
    results.allSports.teamHistory = { success: false, error: error.message };
    console.log('❌ AllSportsAPI Team History:', error.message);
  }

  // Test 4: API-Football - Match Details (if we have mapping)
  console.log('\n🔄 Testing API-Football - Match Details...');
  try {
    // API-Football uses different match IDs, so this might not work directly
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        id: '1499505' // This likely won't work as API-Football uses different IDs
      },
      timeout: 15000
    });
    
    results.apiFootball.matchDetails = {
      success: true,
      data: response.data?.response?.[0],
      hasData: !!response.data?.response?.[0]
    };
    
    console.log('✅ API-Football Match Details:', results.apiFootball.matchDetails.hasData ? 'Available' : 'No Data');
  } catch (error) {
    results.apiFootball.matchDetails = { success: false, error: error.message };
    console.log('❌ API-Football Match Details:', error.response?.status || error.message);
  }

  // Test 5: Our API - All Endpoints
  console.log('\n🏠 Testing Our API - All Endpoints...');
  
  // Match Details
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505', { timeout: 10000 });
    results.ourAPI.matchDetails = {
      success: true,
      data: response.data.result,
      hasData: !!response.data.result
    };
    console.log('✅ Our API Match Details:', results.ourAPI.matchDetails.hasData ? 'Available' : 'No Data');
  } catch (error) {
    results.ourAPI.matchDetails = { success: false, error: error.message };
    console.log('❌ Our API Match Details:', error.message);
  }

  // Card Statistics
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505/cards?matches=5', { timeout: 15000 });
    results.ourAPI.cardStats = {
      success: true,
      data: response.data.result,
      hasData: !!response.data.result
    };
    console.log('✅ Our API Card Stats:', results.ourAPI.cardStats.hasData ? 'Available' : 'No Data');
  } catch (error) {
    results.ourAPI.cardStats = { success: false, error: error.message };
    console.log('❌ Our API Card Stats:', error.message);
  }

  // BTTS Statistics
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505/btts?matches=5', { timeout: 15000 });
    results.ourAPI.bttsStats = {
      success: true,
      data: response.data.result,
      hasData: !!response.data.result
    };
    console.log('✅ Our API BTTS Stats:', results.ourAPI.bttsStats.hasData ? 'Available' : 'No Data');
  } catch (error) {
    results.ourAPI.bttsStats = { success: false, error: error.message };
    console.log('❌ Our API BTTS Stats:', error.message);
  }

  // Player Statistics
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505/players?matches=5', { timeout: 20000 });
    results.ourAPI.playerStats = {
      success: true,
      data: response.data.result,
      hasData: !!response.data.result
    };
    console.log('✅ Our API Player Stats:', results.ourAPI.playerStats.hasData ? 'Available' : 'No Data');
  } catch (error) {
    results.ourAPI.playerStats = { success: false, error: error.message };
    console.log('❌ Our API Player Stats:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 DATA AVAILABILITY SUMMARY');
  console.log('='.repeat(70));

  console.log('\n🔍 AllSportsAPI:');
  console.log(`   📊 Match Details: ${results.allSports.matchDetails?.success ? '✅' : '❌'}`);
  console.log(`   👥 Player Stats: ${results.allSports.playerStats?.success ? '✅' : '❌'}`);
  console.log(`   📈 Team History: ${results.allSports.teamHistory?.success ? '✅' : '❌'}`);

  console.log('\n🔄 API-Football:');
  console.log(`   📊 Match Details: ${results.apiFootball.matchDetails?.success ? '✅' : '❌'}`);

  console.log('\n🏠 Our API:');
  console.log(`   📊 Match Details: ${results.ourAPI.matchDetails?.success ? '✅' : '❌'}`);
  console.log(`   🟨 Card Stats: ${results.ourAPI.cardStats?.success ? '✅' : '❌'}`);
  console.log(`   ⚽ BTTS Stats: ${results.ourAPI.bttsStats?.success ? '✅' : '❌'}`);
  console.log(`   👥 Player Stats: ${results.ourAPI.playerStats?.success ? '✅' : '❌'}`);

  console.log('\n🎯 KEY FINDINGS:');
  if (results.allSports.matchDetails?.hasData) {
    console.log('✅ AllSportsAPI has match data - this is our primary source');
  } else {
    console.log('❌ AllSportsAPI has no match data - this could be the issue');
  }

  if (results.allSports.playerStats?.hasPlayerData) {
    console.log('✅ Player statistics are available from AllSportsAPI');
  } else {
    console.log('❌ No player statistics available from AllSportsAPI');
  }

  if (results.allSports.teamHistory?.hasHistoricalData) {
    console.log(`✅ Historical data available: ${results.allSports.teamHistory.homeTeamMatches} matches`);
  } else {
    console.log('❌ Limited historical data available');
  }

  // Save detailed results
  require('fs').writeFileSync('api-data-test-results-1499505.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: api-data-test-results-1499505.json');

  return results;
}

testAPIDataAvailability().catch(console.error);
