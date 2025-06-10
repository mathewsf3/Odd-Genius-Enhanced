const axios = require('axios');

/**
 * Test our current API endpoints for both problematic matches
 * to understand what data is being returned vs what should be shown
 */

async function testCurrentEndpoints() {
  console.log('🔍 TESTING CURRENT API ENDPOINTS');
  console.log('================================');
  console.log('🎯 Testing matches: 1499505 (Reserve) & 1512298 (Women\'s)');
  console.log('================================');

  const matches = [
    { id: '1499505', name: 'Oran U21 vs USM Alger U21 (Reserve League)' },
    { id: '1512298', name: 'Austria W vs Germany W (UEFA Women\'s)' }
  ];

  for (const match of matches) {
    console.log(`\n📊 TESTING MATCH ${match.id}: ${match.name}`);
    console.log('=' .repeat(60));

    // Test Match Details
    try {
      console.log('\n🔍 Match Details:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}`, { timeout: 10000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ Match Found: ${result.homeTeam?.name} vs ${result.awayTeam?.name}`);
        console.log(`   📅 Date: ${result.date}`);
        console.log(`   ⚽ Score: ${result.score}`);
        console.log(`   🏆 League: ${result.league?.name}`);
        console.log(`   🆔 Match ID: ${result.id}`);
      } else {
        console.log('❌ No match data returned');
      }
    } catch (error) {
      console.log(`❌ Match Details Error: ${error.response?.status || error.message}`);
    }

    // Test BTTS
    try {
      console.log('\n⚽ BTTS Statistics:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}/btts?matches=10`, { timeout: 15000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ BTTS Data Available:`);
        console.log(`   📊 BTTS Percentage: ${result.bttsPercentage || 0}%`);
        console.log(`   🏠 Home Goals: ${result.homeStats?.totalGoals || 0}`);
        console.log(`   🚌 Away Goals: ${result.awayStats?.totalGoals || 0}`);
        console.log(`   📈 Validation: ${response.data.validated || response.data.goalsSynchronized || 'No'}`);
      } else {
        console.log('❌ No BTTS data returned');
      }
    } catch (error) {
      console.log(`❌ BTTS Error: ${error.response?.status || error.message}`);
    }

    // Test Cards
    try {
      console.log('\n🟨 Card Statistics:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}/cards?matches=10`, { timeout: 15000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ Card Data Available:`);
        console.log(`   📊 Expected Cards: ${result.expectedCards || 0}`);
        console.log(`   📈 Over 3.5 Rate: ${result.over35Rate || 0}%`);
        console.log(`   🔧 Validation: ${response.data.validated || response.data.dataFixed || 'No'}`);
      } else {
        console.log('❌ No card data returned');
      }
    } catch (error) {
      console.log(`❌ Cards Error: ${error.response?.status || error.message}`);
    }

    // Test Corners
    try {
      console.log('\n📐 Corner Statistics:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}/corners?matches=10`, { timeout: 15000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ Corner Data Available:`);
        console.log(`   📊 Expected Corners: ${result.expectedCorners || 0}`);
        console.log(`   📈 Over 9.5 Rate: ${result.over95Rate || 0}%`);
        console.log(`   🔧 Validation: ${response.data.validated || 'No'}`);
      } else {
        console.log('❌ No corner data returned');
      }
    } catch (error) {
      console.log(`❌ Corners Error: ${error.response?.status || error.message}`);
    }

    // Test Players
    try {
      console.log('\n👥 Player Statistics:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}/players?matches=10`, { timeout: 20000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ Player Data Available:`);
        const homePlayerCount = result.homeTeamPlayers?.players?.length || 0;
        const awayPlayerCount = result.awayTeamPlayers?.players?.length || 0;
        console.log(`   👥 Home Players: ${homePlayerCount}`);
        console.log(`   👥 Away Players: ${awayPlayerCount}`);
        console.log(`   🔧 Validation: ${response.data.validated || response.data.playersFixed || 'No'}`);
      } else {
        console.log('❌ No player data returned');
      }
    } catch (error) {
      console.log(`❌ Players Error: ${error.response?.status || error.message}`);
    }

    // Test H2H
    try {
      console.log('\n🤝 Head-to-Head:');
      const response = await axios.get(`http://localhost:5000/api/matches/${match.id}/h2h?matches=10`, { timeout: 15000 });
      const result = response.data.result;
      
      if (result) {
        console.log(`✅ H2H Data Available:`);
        console.log(`   📊 Total Matches: ${result.totalMatches || 0}`);
        console.log(`   🏠 Home Wins: ${result.homeWins || 0}`);
        console.log(`   🚌 Away Wins: ${result.awayWins || 0}`);
        console.log(`   🤝 Draws: ${result.draws || 0}`);
      } else {
        console.log('❌ No H2H data returned');
      }
    } catch (error) {
      console.log(`❌ H2H Error: ${error.response?.status || error.message}`);
    }

    console.log('\n⏱️  Waiting 2 seconds before next match...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary and Recommendations
  console.log('\n' + '='.repeat(70));
  console.log('📋 CURRENT API ENDPOINT ANALYSIS');
  console.log('='.repeat(70));
  
  console.log('\n🔍 PATTERN IDENTIFIED:');
  console.log('1. Match details are generally available');
  console.log('2. BTTS data may be available (depends on historical data)');
  console.log('3. Cards/Corners/Players often missing for certain league types');
  console.log('4. Reserve leagues and some women\'s matches have limited data');
  
  console.log('\n💡 IMMEDIATE SOLUTIONS NEEDED:');
  console.log('1. Detect when detailed data is missing');
  console.log('2. Show "Limited Data Available" message with context');
  console.log('3. Display available data prominently');
  console.log('4. Apply intelligent estimation for missing statistics');
  console.log('5. Improve user experience for data-limited matches');
  
  console.log('\n🚀 IMPLEMENTATION PRIORITIES:');
  console.log('1. Frontend: Add "Limited Data" UI mode');
  console.log('2. Backend: Implement fallback estimation algorithms');
  console.log('3. UX: Show data availability indicators');
  console.log('4. Analytics: Track which matches have limited data');
  console.log('5. Enhancement: Improve data sources for affected leagues');
}

testCurrentEndpoints().catch(console.error);
