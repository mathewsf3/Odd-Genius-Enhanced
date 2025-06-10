const apiFootballService = require('./src/services/apiFootballService');

async function testCornerStats() {
  try {
    console.log('🔍 Testing API Football corner stats service...');
    
    // Test 1: Get corner stats for Brommapojkarna
    console.log('\n1. Testing corner stats for Brommapojkarna...');
    
    const homeStats = await apiFootballService.getTeamCornerStats('Brommapojkarna', 5);
    console.log('📋 Home team stats:', homeStats ? 'SUCCESS' : 'FAILED');
    
    if (homeStats) {
      console.log('📊 Home team details:', {
        teamName: homeStats.teamName,
        averageCorners: homeStats.averageCorners,
        matchesAnalyzed: homeStats.matchesAnalyzed
      });
    }
    
    // Test 2: Get corner stats for Djurgarden
    console.log('\n2. Testing corner stats for Djurgarden...');
    
    const awayStats = await apiFootballService.getTeamCornerStats('Djurgarden', 5);
    console.log('📋 Away team stats:', awayStats ? 'SUCCESS' : 'FAILED');
    
    if (awayStats) {
      console.log('📊 Away team details:', {
        teamName: awayStats.teamName,
        averageCorners: awayStats.averageCorners,
        matchesAnalyzed: awayStats.matchesAnalyzed
      });
    }
    
    // Test 3: Get match corner stats
    console.log('\n3. Testing match corner stats...');
    
    const matchStats = await apiFootballService.getMatchCornerStats('Brommapojkarna', 'Djurgarden', 5);
    console.log('📋 Match stats:', matchStats ? 'SUCCESS' : 'FAILED');
    
    if (matchStats) {
      console.log('📊 Match details:', {
        dataSource: matchStats.dataSource,
        expectedTotal: matchStats.cornerProbabilities?.expectedTotal,
        homeAvg: matchStats.homeStats?.averageCorners,
        awayAvg: matchStats.awayStats?.averageCorners
      });
    }
    
    console.log('\n🏁 Corner stats test completed');
    
  } catch (error) {
    console.error('❌ Corner stats test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCornerStats().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
