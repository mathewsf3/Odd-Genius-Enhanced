const teamMappingService = require('./src/services/teamMappingService');

async function testTeamMapping() {
  try {
    console.log('🔍 Testing team mapping service...');
    
    // Test 1: Find API Football team for Brommapojkarna
    console.log('\n1. Testing team mapping for Brommapojkarna...');
    
    const mappedTeamName = await teamMappingService.findApiFootballTeam('Brommapojkarna');
    console.log('📋 Mapped team name:', mappedTeamName);
    
    // Test 2: Try different variations
    const variations = [
      'Brommapojkarna',
      'IF Brommapojkarna',
      'Bromma',
      'Djurgarden',
      'Djurgardens IF'
    ];
    
    console.log('\n2. Testing various team name mappings...');
    for (const teamName of variations) {
      try {
        const mapped = await teamMappingService.findApiFootballTeam(teamName);
        console.log(`📋 ${teamName} -> ${mapped || 'NOT FOUND'}`);
      } catch (error) {
        console.log(`❌ ${teamName} -> ERROR: ${error.message}`);
      }
    }
    
    console.log('\n🏁 Team mapping test completed');
    
  } catch (error) {
    console.error('❌ Team mapping test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testTeamMapping().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
