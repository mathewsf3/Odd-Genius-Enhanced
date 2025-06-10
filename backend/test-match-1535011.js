const MappingNew = require('./src/services/MappingNew');

async function testMatch1535011() {
  try {
    console.log('🔍 Testing match 1535011 in unified system...');

    // Initialize the system
    await MappingNew.initialize();
    console.log('✅ Unified system initialized');

    // Get system statistics
    const stats = MappingNew.getStatistics();
    console.log('📊 System stats:', {
      teams: stats.teams.total,
      matches: stats.matches.total,
      lastSync: stats.sync.lastIncrementalSync
    });

    // Try to find match 1535011
    console.log('\n🔍 Looking for match 1535011...');

    // Method 1: Try getCompleteMatchData
    console.log('\n🔍 Trying getCompleteMatchData...');
    const completeData = await MappingNew.getCompleteMatchData('1535011');
    console.log('getCompleteMatchData result:', completeData ? '✅ Found' : '❌ Not found');

    if (completeData) {
      console.log('📋 Match details:', {
        id: completeData.id,
        homeTeam: completeData.merged?.homeTeam?.name || completeData.allSports?.homeTeam?.name,
        awayTeam: completeData.merged?.awayTeam?.name || completeData.allSports?.awayTeam?.name,
        date: completeData.merged?.date || completeData.allSports?.date,
        status: completeData.merged?.status || completeData.allSports?.status,
        sources: Object.keys(completeData).filter(key => key !== 'merged' && completeData[key])
      });
    }

    // Method 2: Try direct API call as fallback
    console.log('\n🔍 Testing direct API fallback...');
    try {
      const allSportsApiService = require('./src/services/allSportsApiService');
      const directMatch = await allSportsApiService.getMatchStats('1535011');
      console.log('Direct AllSports API call:', directMatch ? '✅ Found' : '❌ Not found');

      if (directMatch) {
        console.log('📋 Direct API match details:', {
          id: directMatch.id,
          homeTeam: directMatch.homeTeam?.name,
          awayTeam: directMatch.awayTeam?.name,
          date: directMatch.date,
          status: directMatch.status
        });
      }
    } catch (error) {
      console.log('❌ Direct API call failed:', error.message);
    }

    console.log('\n🏁 Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testMatch1535011().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
