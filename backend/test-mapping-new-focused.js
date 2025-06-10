const MappingNew = require('./src/services/MappingNew');
const logger = require('./src/utils/logger');

/**
 * 🎯 FOCUSED TEST OF NEW UNIVERSAL SYNC ENGINE
 * 
 * This test focuses on getting teams synced and working properly
 */

async function testNewMappingFocused() {
  console.log('🎯 FOCUSED TEST - NEW UNIVERSAL SYNC ENGINE');
  console.log('═'.repeat(60));
  console.log('🚀 Testing team synchronization specifically\n');

  try {
    const startTime = Date.now();

    // Step 1: Initialize
    console.log('1️⃣ INITIALIZING...');
    await MappingNew.initialize();
    console.log('✅ System initialized\n');

    // Step 2: Test with a very focused sync - just one major league
    console.log('2️⃣ TESTING FOCUSED SYNC (Premier League Only)...');
    console.log('─'.repeat(40));
    
    const focusedOptions = {
      countries: ['England'], // Just England
      leagueTypes: ['league'] // Only main leagues
    };
    
    console.log('🔄 Starting focused sync...');
    const syncResult = await MappingNew.fullSync(focusedOptions);
    
    console.log('📊 Focused Sync Results:');
    console.log(`   Duration: ${Math.round(syncResult.stats.duration / 1000)}s`);
    console.log(`   Leagues: ${syncResult.stats.leagues.mapped}`);
    console.log(`   Teams: ${syncResult.stats.teams.mapped}`);
    console.log(`   Errors: ${syncResult.errors.length}`);
    
    if (syncResult.errors.length > 0) {
      console.log('⚠️  First 3 errors:');
      syncResult.errors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.type}: ${error.message}`);
      });
    }
    console.log('');

    // Step 3: Check what we got
    console.log('3️⃣ ANALYZING RESULTS...');
    console.log('─'.repeat(40));
    
    const stats = MappingNew.getStatistics();
    console.log('📊 Current System State:');
    console.log(`   Total Teams: ${stats.teams.total}`);
    console.log(`   Complete Mappings: ${stats.teams.complete}`);
    console.log(`   AllSports Only: ${stats.teams.allSportsOnly}`);
    console.log(`   API Football Only: ${stats.teams.apiFootballOnly}`);
    console.log(`   Total Leagues: ${stats.leagues.total}`);
    console.log(`   Countries: ${stats.leagues.countries}`);
    console.log('');

    // Step 4: Test team lookup if we have teams
    if (stats.teams.total > 0) {
      console.log('4️⃣ TESTING TEAM LOOKUPS...');
      console.log('─'.repeat(40));
      
      // Get first few teams to test
      const allTeams = Array.from(MappingNew.syncManager.teams.values()).slice(0, 5);
      
      console.log('🔍 Testing lookups for synced teams:');
      allTeams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.name}:`);
        console.log(`   Universal ID: ${team.id}`);
        console.log(`   AllSports: ${team.allSports.id || 'None'}`);
        console.log(`   API Football: ${team.apiFootball.id || 'None'}`);
        console.log(`   Complete: ${team.hasCompleteData() ? 'Yes' : 'No'}`);
        console.log(`   Confidence: ${(team.confidence * 100).toFixed(1)}%`);
        console.log('');
      });
      
      // Test lookup by name
      if (allTeams.length > 0) {
        const testTeam = allTeams[0];
        console.log(`🎯 Testing name lookup for: "${testTeam.name}"`);
        const foundTeam = MappingNew.findTeam(testTeam.name);
        console.log(`   Found: ${foundTeam ? 'Yes' : 'No'}`);
        if (foundTeam) {
          console.log(`   ID Match: ${foundTeam.id === testTeam.id ? 'Yes' : 'No'}`);
        }
        console.log('');
      }
    } else {
      console.log('4️⃣ NO TEAMS TO TEST - INVESTIGATING...');
      console.log('─'.repeat(40));
      
      // Let's see what leagues we have
      const allLeagues = Array.from(MappingNew.syncManager.leagues.values()).slice(0, 5);
      console.log('📋 Sample leagues synced:');
      allLeagues.forEach((league, index) => {
        console.log(`${index + 1}. ${league.name} (${league.country})`);
        console.log(`   AllSports ID: ${league.allSports.id || 'None'}`);
        console.log(`   API Football ID: ${league.apiFootball.id || 'None'}`);
        console.log('');
      });
      
      // Try to manually sync teams for one league
      if (allLeagues.length > 0) {
        const testLeague = allLeagues.find(l => l.allSports.id || l.apiFootball.id);
        if (testLeague) {
          console.log(`🔧 Manually testing team sync for: ${testLeague.name}`);
          try {
            await MappingNew.syncManager.syncLeagueTeams(testLeague, { stats: { teams: { mapped: 0 } }, errors: [] });
            const newStats = MappingNew.getStatistics();
            console.log(`   Teams after manual sync: ${newStats.teams.total}`);
          } catch (error) {
            console.log(`   Manual sync error: ${error.message}`);
          }
        }
      }
      console.log('');
    }

    // Step 5: Test match data retrieval
    console.log('5️⃣ TESTING MATCH DATA...');
    console.log('─'.repeat(40));
    
    try {
      console.log('🎯 Testing match data retrieval...');
      const matchData = await MappingNew.getMatchData('1548612');
      
      if (matchData) {
        console.log('✅ Match data retrieved:');
        console.log(`   Source: ${matchData.source}`);
        console.log(`   Home: ${matchData.homeTeam?.name || 'Unknown'}`);
        console.log(`   Away: ${matchData.awayTeam?.name || 'Unknown'}`);
        console.log(`   Status: ${matchData.status || 'Unknown'}`);
      } else {
        console.log('❌ No match data found');
      }
    } catch (error) {
      console.log(`❌ Match data error: ${error.message}`);
    }
    console.log('');

    // Step 6: Summary
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log('6️⃣ FOCUSED TEST SUMMARY...');
    console.log('─'.repeat(40));
    console.log(`⏱️  Total Test Time: ${totalTime}s`);
    console.log(`📊 Final Team Count: ${stats.teams.total}`);
    console.log(`🏆 Final League Count: ${stats.leagues.total}`);
    console.log(`🌎 Countries Covered: ${stats.leagues.countries}`);
    console.log('');
    
    if (stats.teams.total > 0) {
      console.log('🎉 SUCCESS: Teams were synced successfully!');
      console.log('✅ New Universal Sync Engine is working correctly');
    } else {
      console.log('⚠️  PARTIAL SUCCESS: Leagues synced but no teams');
      console.log('🔧 This indicates API issues or missing team sync logic');
    }
    
    console.log('');
    console.log('🚀 NEXT STEPS:');
    if (stats.teams.total > 0) {
      console.log('   • Scale up to more countries/leagues');
      console.log('   • Test corner statistics integration');
      console.log('   • Set up automated sync jobs');
      console.log('   • Migrate existing services');
    } else {
      console.log('   • Debug AllSports API team fetching');
      console.log('   • Check API rate limits and errors');
      console.log('   • Verify team sync logic');
      console.log('   • Test with API Football only');
    }

    return {
      success: true,
      stats,
      syncResult,
      duration: totalTime
    };

  } catch (error) {
    console.error('❌ FOCUSED TEST FAILED:');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the focused test
if (require.main === module) {
  testNewMappingFocused()
    .then(result => {
      if (result.success) {
        console.log(`\n✅ FOCUSED TEST COMPLETED!`);
        console.log(`📊 Teams: ${result.stats.teams.total}, Leagues: ${result.stats.leagues.total}`);
        console.log(`⏱️  Duration: ${result.duration}s`);
        process.exit(0);
      } else {
        console.log(`\n❌ FOCUSED TEST FAILED: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testNewMappingFocused };
