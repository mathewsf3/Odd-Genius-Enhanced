const teamMappingService = require('./src/services/teamMappingService');

async function testMappingLookup() {
  console.log('🧪 Testing Universal Team Mapping Lookup...\n');

  try {
    // Test the new universal system
    console.log('1️⃣ Testing findApiFootballTeam function...');
    
    const testTeams = [
      'Manchester United',
      'Real Madrid',
      'Barcelona',
      'Bayern Munich',
      'Liverpool',
      'Chelsea',
      'Arsenal',
      'Manchester City',
      'Paris Saint Germain',
      'Juventus'
    ];

    for (const teamName of testTeams) {
      try {
        const result = await teamMappingService.findApiFootballTeam(teamName);
        if (result) {
          console.log(`✅ ${teamName} -> ${result.name} (ID: ${result.id}, Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        } else {
          console.log(`❌ ${teamName} -> Not found`);
        }
      } catch (error) {
        console.log(`❌ ${teamName} -> Error: ${error.message}`);
      }
    }

    // Test reverse lookup
    console.log('\n2️⃣ Testing findAllSportsTeam function...');
    
    const apiFootballTeams = [
      'Manchester United',
      'Real Madrid',
      'FC Barcelona',
      'Bayern Munich',
      'Liverpool FC'
    ];

    for (const teamName of apiFootballTeams) {
      try {
        const result = await teamMappingService.findAllSportsTeam(teamName);
        if (result) {
          console.log(`✅ ${teamName} -> ${result.name} (ID: ${result.id}, Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        } else {
          console.log(`❌ ${teamName} -> Not found`);
        }
      } catch (error) {
        console.log(`❌ ${teamName} -> Error: ${error.message}`);
      }
    }

    // Test sync status
    console.log('\n3️⃣ Testing sync status...');
    const status = await teamMappingService.getSyncStatus();
    console.log(`📊 Total Mappings: ${status.stats.totalMappings}`);
    console.log(`✅ Verified Mappings: ${status.stats.verifiedMappings}`);
    console.log(`🔗 Both APIs Mapped: ${status.stats.bothApisMapped}`);
    console.log(`🅰️ AllSports Only: ${status.stats.allSportsOnly}`);
    console.log(`🅱️ API Football Only: ${status.stats.apiFootballOnly}`);
    console.log(`🎯 Average Confidence: ${(status.stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`🌎 Countries Covered: ${status.stats.countries}`);
    console.log(`📅 Last Sync: ${status.lastSync}`);

    // Test normalization
    console.log('\n4️⃣ Testing name normalization...');
    const testNames = [
      'Manchester United',
      'Real Madrid CF',
      'FC Barcelona',
      'Bayern München',
      'Liverpool FC'
    ];

    testNames.forEach(name => {
      const normalized = teamMappingService.normalizeTeamName(name);
      console.log(`📝 "${name}" -> "${normalized}"`);
    });

    console.log('\n🎉 Mapping lookup test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testMappingLookup()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testMappingLookup };
