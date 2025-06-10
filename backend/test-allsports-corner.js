const allSportsApiService = require('./src/services/allSportsApiService');

async function testAllSportsCorner() {
  try {
    console.log('🔍 Testing AllSports corner stats service...');
    
    // Test 1: Get corner stats for match 1535011
    console.log('\n1. Testing corner stats for match 1535011...');
    
    const cornerStats = await allSportsApiService.getCornerStats('1535011', 5, null);
    console.log('📋 Corner stats result:', cornerStats ? 'SUCCESS' : 'FAILED');
    
    if (cornerStats) {
      console.log('📊 Corner stats details:', {
        dataSource: cornerStats.dataSource,
        homeStats: cornerStats.homeStats ? 'HAS_DATA' : 'NULL',
        awayStats: cornerStats.awayStats ? 'HAS_DATA' : 'NULL',
        message: cornerStats.message,
        policy: cornerStats.policy,
        mappingStatus: cornerStats.mappingStatus
      });
      
      if (cornerStats.mappingInfo) {
        console.log('📋 Mapping info:', cornerStats.mappingInfo);
      }
    }
    
    console.log('\n🏁 AllSports corner stats test completed');
    
  } catch (error) {
    console.error('❌ AllSports corner stats test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testAllSportsCorner().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
