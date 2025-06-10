const MappingNew = require('./src/services/MappingNew');

async function testMatchSync() {
  console.log('🚀 Testing Match Synchronization\n');
  
  try {
    // Initialize system
    await MappingNew.initialize();
    console.log('✅ System initialized\n');
    
    // Get initial stats
    const beforeStats = MappingNew.getStatistics();
    console.log('📊 Before sync:');
    console.log(`   Matches: ${beforeStats.matches.total}`);
    console.log(`   Merged: ${beforeStats.matches.merged}`);
    console.log(`   AllSports only: ${beforeStats.matches.allsportsOnly}`);
    console.log(`   API Football only: ${beforeStats.matches.apiFootballOnly}\n`);
    
    // Sync last 3 days of matches
    console.log('🔄 Syncing matches (last 3 days)...');
    const result = await MappingNew.syncMatches({
      from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      to: new Date(),
      forceUpdate: true
    });
    
    console.log('\n✅ Sync completed!');
    console.log(`   Duration: ${Math.round(result.stats.duration / 1000)}s`);
    console.log(`   Fetched: ${result.stats.matches.fetched}`);
    console.log(`   Mapped: ${result.stats.matches.mapped}`);
    console.log(`   Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.slice(0, 3).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.type}: ${error.message}`);
      });
    }
    
    // Get after stats
    const afterStats = MappingNew.getStatistics();
    console.log('\n📊 After sync:');
    console.log(`   Total matches: ${afterStats.matches.total}`);
    console.log(`   Merged (both APIs): ${afterStats.matches.merged}`);
    console.log(`   AllSports only: ${afterStats.matches.allsportsOnly}`);
    console.log(`   API Football only: ${afterStats.matches.apiFootballOnly}`);
    
    // Calculate improvement
    const improvement = {
      total: afterStats.matches.total - beforeStats.matches.total,
      merged: afterStats.matches.merged - beforeStats.matches.merged
    };
    
    console.log('\n📈 Improvement:');
    console.log(`   New matches added: ${improvement.total}`);
    console.log(`   New merged matches: ${improvement.merged}`);
    
    // Test finding a match
    if (afterStats.matches.total > 0) {
      console.log('\n🔍 Testing match lookup...');
      const firstMatch = Array.from(MappingNew.syncManager.matches.values())[0];
      
      console.log(`   Sample match: ${firstMatch.homeTeam?.name} vs ${firstMatch.awayTeam?.name}`);
      console.log(`   Universal ID: ${firstMatch.id}`);
      console.log(`   Date: ${firstMatch.date}`);
      console.log(`   Status: ${firstMatch.status}`);
      
      if (firstMatch.allSports?.id) {
        const found = MappingNew.findMatchByApiId(firstMatch.allSports.id, 'allsports');
        console.log(`   ✅ Found by AllSports ID (${firstMatch.allSports.id}): ${found ? 'Yes' : 'No'}`);
      }
      
      if (firstMatch.apiFootball?.id) {
        const found = MappingNew.findMatchByApiId(firstMatch.apiFootball.id, 'apifootball');
        console.log(`   ✅ Found by API Football ID (${firstMatch.apiFootball.id}): ${found ? 'Yes' : 'No'}`);
      }
    }
    
    // Test getCompleteMatchData
    if (afterStats.matches.total > 0) {
      console.log('\n🔍 Testing getCompleteMatchData...');
      const firstMatch = Array.from(MappingNew.syncManager.matches.values())[0];
      
      if (firstMatch.allSports?.id) {
        const completeData = await MappingNew.getCompleteMatchData(firstMatch.allSports.id);
        if (completeData) {
          console.log(`   ✅ Complete data retrieved for match ${firstMatch.allSports.id}`);
          console.log(`   📊 Data sources: ${Object.keys(completeData.sources || {}).join(', ')}`);
          console.log(`   🎯 Confidence: ${completeData.confidence}`);
        } else {
          console.log(`   ❌ Failed to get complete data for match ${firstMatch.allSports.id}`);
        }
      }
    }
    
    console.log('\n🎉 Match sync test completed successfully!');
    
    // Show API usage
    console.log('\n📊 API Usage:');
    console.log(`   AllSports calls: ${afterStats.apiUsage.allSportsCallsToday}`);
    console.log(`   API Football calls: ${afterStats.apiUsage.apiFootballCallsToday}/${afterStats.apiUsage.apiFootballDailyLimit}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMatchSync();
