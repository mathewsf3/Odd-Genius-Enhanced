const universalTeamDiscovery = require('./src/services/universalTeamDiscovery');
const teamMappingService = require('./src/services/teamMappingService');

async function runUniversalDiscovery() {
  console.log('🌍 Starting Universal Team Discovery Process...\n');

  try {
    // Step 1: Test discovery functions individually
    console.log('1️⃣ Testing League Discovery...');
    
    const [allSportsLeagues, apiFootballLeagues] = await Promise.all([
      universalTeamDiscovery.getAllSportsApiLeagues(),
      universalTeamDiscovery.getApiFootballLeagues()
    ]);

    console.log(`✅ AllSportsAPI Leagues: ${allSportsLeagues.length}`);
    console.log(`✅ API Football Leagues: ${apiFootballLeagues.length}`);

    // Show sample leagues
    console.log('\nSample AllSportsAPI Leagues:');
    allSportsLeagues.slice(0, 5).forEach(league => {
      console.log(`  - ${league.name} (${league.country})`);
    });

    console.log('\nSample API Football Leagues:');
    apiFootballLeagues.slice(0, 5).forEach(league => {
      console.log(`  - ${league.name} (${league.country})`);
    });

    // Step 2: Test team discovery for a few leagues
    console.log('\n2️⃣ Testing Team Discovery (Limited Sample)...');
    
    // Get teams for first 3 leagues from each API
    const sampleAllSportsLeagues = allSportsLeagues.slice(0, 3);
    const sampleApiFootballLeagues = apiFootballLeagues.slice(0, 3);

    const [allSportsTeams, apiFootballTeams] = await Promise.all([
      universalTeamDiscovery.getAllSportsApiTeams(sampleAllSportsLeagues),
      universalTeamDiscovery.getApiFootballTeams(sampleApiFootballLeagues)
    ]);

    console.log(`✅ AllSportsAPI Teams: ${allSportsTeams.length}`);
    console.log(`✅ API Football Teams: ${apiFootballTeams.length}`);

    // Step 3: Test mapping creation
    console.log('\n3️⃣ Testing Universal Mapping Creation...');
    
    const mappings = await universalTeamDiscovery.createUniversalMappings(
      allSportsTeams,
      apiFootballTeams
    );

    console.log(`✅ Successful Mappings: ${mappings.statistics.successfulMappings}`);
    console.log(`⚠️ Unmapped Teams: ${mappings.statistics.unmappedAllSportsTeams.length}`);
    console.log(`🤔 Ambiguous Mappings: ${mappings.statistics.ambiguousMappings.length}`);
    console.log(`📊 Success Rate: ${((mappings.statistics.successfulMappings / allSportsTeams.length) * 100).toFixed(1)}%`);

    // Show sample successful mappings
    console.log('\nSample Successful Mappings:');
    Object.entries(mappings.teams).slice(0, 10).forEach(([allSports, mapping]) => {
      console.log(`  ✅ ${allSports} -> ${mapping.apiFootball} (${(mapping.confidence * 100).toFixed(1)}%)`);
    });

    // Show sample unmapped teams
    if (mappings.statistics.unmappedAllSportsTeams.length > 0) {
      console.log('\nSample Unmapped Teams:');
      mappings.statistics.unmappedAllSportsTeams.slice(0, 5).forEach(team => {
        console.log(`  ❌ ${team.name} (${team.country})`);
      });
    }

    // Step 4: Test enhanced team mapping service
    console.log('\n4️⃣ Testing Enhanced Team Mapping Service...');
    
    // Test with some known teams
    const testTeams = [
      'Manchester United',
      'Bayern Munich', 
      'Real Madrid',
      'Barcelona',
      'Liverpool'
    ];

    for (const teamName of testTeams) {
      try {
        const mappedName = await teamMappingService.findApiFootballTeam(teamName);
        if (mappedName) {
          console.log(`  ✅ ${teamName} -> ${mappedName}`);
        } else {
          console.log(`  ❌ ${teamName} -> NO MAPPING FOUND`);
        }
      } catch (error) {
        console.log(`  ❌ ${teamName} -> ERROR: ${error.message}`);
      }
    }

    // Step 5: Show mapping statistics
    console.log('\n5️⃣ Mapping Statistics...');
    const stats = await teamMappingService.getMappingStatistics();
    console.log(`📊 Total Mappings: ${stats.totalMappings}`);
    console.log(`📚 Static Mappings: ${stats.staticMappings}`);
    console.log(`🌍 Universal Mappings: ${stats.universalMappings}`);
    console.log(`🤖 Auto-Discovered: ${stats.autoDiscovered}`);
    console.log(`💾 Cache Size: ${stats.cacheSize}`);

    console.log('\n🎉 Universal Discovery Test Completed Successfully!');

    // Return summary for further analysis
    return {
      leagues: {
        allSports: allSportsLeagues.length,
        apiFootball: apiFootballLeagues.length
      },
      teams: {
        allSports: allSportsTeams.length,
        apiFootball: apiFootballTeams.length
      },
      mappings: {
        successful: mappings.statistics.successfulMappings,
        unmapped: mappings.statistics.unmappedAllSportsTeams.length,
        successRate: ((mappings.statistics.successfulMappings / allSportsTeams.length) * 100).toFixed(1)
      }
    };

  } catch (error) {
    console.error('❌ Universal Discovery Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runUniversalDiscovery()
    .then(summary => {
      console.log('\n📋 Final Summary:', JSON.stringify(summary, null, 2));
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runUniversalDiscovery };
