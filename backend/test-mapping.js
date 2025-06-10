const MappingNew = require('./src/services/MappingNew');
const logger = require('./src/utils/logger');

async function testMappingSystem() {
  try {
    console.log('🧪 Testing Universal Mapping System...');
    
    // Initialize the system
    console.log('1. Initializing mapping system...');
    await MappingNew.initialize();
    console.log('✅ Mapping system initialized');
    
    // Test getting statistics
    console.log('\n2. Getting system statistics...');
    const stats = MappingNew.getStatistics();
    console.log('📊 Current Statistics:');
    console.log(`   Teams: ${stats.teams.total} (${stats.teams.complete} complete)`);
    console.log(`   Leagues: ${stats.leagues.total} (${stats.leagues.complete} complete)`);
    console.log(`   Matches: ${stats.matches.total} (${stats.matches.merged} merged)`);
    
    // Test finding a team
    console.log('\n3. Testing team lookup...');
    const testTeamId = '96'; // Example team ID
    const team = MappingNew.findTeam(testTeamId);
    if (team) {
      console.log(`✅ Found team: ${team.name} (${team.country})`);
      console.log(`   AllSports ID: ${team.allSports.id}`);
      console.log(`   API Football ID: ${team.apiFootball.id}`);
      console.log(`   Confidence: ${team.confidence}`);
    } else {
      console.log(`❌ Team not found for ID: ${testTeamId}`);
    }
    
    // Test getting match data
    console.log('\n4. Testing match data retrieval...');
    const testMatchId = '1234567'; // Example match ID
    try {
      const matchData = await MappingNew.getCompleteMatchData(testMatchId);
      if (matchData) {
        console.log(`✅ Found match: ${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}`);
        console.log(`   Sources: ${Object.keys(matchData.sources || {}).join(', ')}`);
        console.log(`   Confidence: ${matchData.confidence}`);
        console.log(`   Status: ${matchData.status}`);
      } else {
        console.log(`❌ Match not found for ID: ${testMatchId}`);
      }
    } catch (error) {
      console.log(`❌ Error getting match data: ${error.message}`);
    }
    
    // Test API calls
    console.log('\n5. Testing API connectivity...');
    try {
      // Test AllSports API
      const allSportsTest = await MappingNew.syncManager.apiCall('allsports', '', {
        met: 'Leagues'
      });
      
      if (allSportsTest?.success === 1) {
        console.log(`✅ AllSports API: Connected (${allSportsTest.result?.length || 0} leagues)`);
      } else {
        console.log('❌ AllSports API: Failed to connect');
      }
    } catch (error) {
      console.log(`❌ AllSports API Error: ${error.message}`);
    }
    
    try {
      // Test API Football
      const apiFootballTest = await MappingNew.syncManager.apiCall('apifootball', '/leagues', {});
      
      if (apiFootballTest?.response) {
        console.log(`✅ API Football: Connected (${apiFootballTest.response?.length || 0} leagues)`);
      } else {
        console.log('❌ API Football: Failed to connect');
      }
    } catch (error) {
      console.log(`❌ API Football Error: ${error.message}`);
    }
    
    // Test small match sync
    console.log('\n6. Testing small match sync (last 3 days)...');
    try {
      const syncResult = await MappingNew.syncMatches({
        from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        to: new Date(), // today
        forceUpdate: false
      });
      
      console.log(`✅ Match sync completed:`);
      console.log(`   Duration: ${Math.round(syncResult.stats.duration / 1000)}s`);
      console.log(`   Fetched: ${syncResult.stats.matches.fetched} matches`);
      console.log(`   Mapped: ${syncResult.stats.matches.mapped} matches`);
      console.log(`   Errors: ${syncResult.errors.length}`);
      
      if (syncResult.errors.length > 0) {
        console.log('   Error details:');
        syncResult.errors.forEach(error => {
          console.log(`     - ${error.type}: ${error.message}`);
        });
      }
    } catch (error) {
      console.log(`❌ Match sync failed: ${error.message}`);
    }
    
    // Final statistics
    console.log('\n7. Final system statistics...');
    const finalStats = MappingNew.getStatistics();
    console.log('📊 Updated Statistics:');
    console.log(`   Teams: ${finalStats.teams.total} (${finalStats.teams.complete} complete)`);
    console.log(`   Leagues: ${finalStats.leagues.total} (${finalStats.leagues.complete} complete)`);
    console.log(`   Matches: ${finalStats.matches.total} (${finalStats.matches.merged} merged)`);
    console.log(`   API Usage: AllSports=${finalStats.apiUsage.allSportsCallsToday}, API-Football=${finalStats.apiUsage.apiFootballCallsToday}/${finalStats.apiUsage.apiFootballDailyLimit}`);
    
    console.log('\n✅ Mapping system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Mapping system test failed:', error.message);
    logger.error('Mapping test script failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testMappingSystem().catch(console.error);
}

module.exports = { testMappingSystem };
