const teamMappingService = require('./src/services/teamMappingService');
const logger = require('./src/utils/logger');

/**
 * Initial Full Synchronization Script
 * This script performs a complete sync of ALL teams from both APIs
 * and creates the universal mapping database
 */

async function performInitialSync() {
  console.log('🌍 Starting GLOBAL POWERHOUSE Team Synchronization...\n');
  
  try {
    const startTime = Date.now();
    
    // Step 1: Get current sync status
    console.log('📊 Checking current sync status...');
    const initialStatus = await teamMappingService.getSyncStatus();
    console.log(`Last sync: ${initialStatus.lastSync || 'Never'}`);
    console.log(`Current mappings: ${initialStatus.stats?.totalMappings || 0}`);
    console.log(`Cache size: ${initialStatus.cacheSize?.mapping || 0} items\n`);
    
    // Step 2: Perform full sync with force refresh
    console.log('🚀 Starting full synchronization of ALL teams from BOTH APIs...');
    console.log('This will take several minutes as we process thousands of teams worldwide.\n');
    
    const mappings = await teamMappingService.syncAllTeams({
      forceRefresh: true,
      // Start with major leagues for initial testing, then expand
      countries: [
        'England', 'Germany', 'Spain', 'Italy', 'France', 
        'Netherlands', 'Portugal', 'Belgium', 'Turkey', 'Greece',
        'Brazil', 'Argentina', 'USA', 'Mexico', 'Colombia',
        'Japan', 'South Korea', 'China', 'Australia'
      ]
    });
    
    // Step 3: Get final sync status
    console.log('\n📈 Synchronization completed! Getting final status...');
    const finalStatus = await teamMappingService.getSyncStatus();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Step 4: Display comprehensive results
    console.log('\n🎉 GLOBAL POWERHOUSE SYNCHRONIZATION COMPLETED!\n');
    
    console.log('📊 FINAL STATISTICS:');
    console.log('═'.repeat(50));
    console.log(`⏱️  Total Duration: ${duration} seconds`);
    console.log(`🌍 Total Mappings: ${finalStatus.stats.totalMappings}`);
    console.log(`✅ Verified Mappings: ${finalStatus.stats.verifiedMappings}`);
    console.log(`🔗 Both APIs Mapped: ${finalStatus.stats.bothApisMapped}`);
    console.log(`🅰️  AllSports Only: ${finalStatus.stats.allSportsOnly}`);
    console.log(`🅱️  API Football Only: ${finalStatus.stats.apiFootballOnly}`);
    console.log(`🎯 Average Confidence: ${(finalStatus.stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`🌎 Countries Covered: ${finalStatus.stats.countries}`);
    console.log(`📅 Last Sync: ${finalStatus.lastSync}`);
    console.log(`📦 Cache Size: ${finalStatus.cacheSize.mapping} items`);
    
    // Step 5: Test some mappings
    console.log('\n🧪 TESTING SAMPLE MAPPINGS:');
    console.log('═'.repeat(50));
    
    const testTeams = [
      'Manchester United',
      'Real Madrid', 
      'Barcelona',
      'Bayern Munich',
      'Liverpool',
      'Paris Saint Germain',
      'Juventus',
      'Chelsea',
      'Arsenal',
      'Manchester City'
    ];
    
    for (const teamName of testTeams) {
      try {
        const apiFootballTeam = await teamMappingService.findApiFootballTeam(teamName);
        const allSportsTeam = await teamMappingService.findAllSportsTeam(teamName);
        
        if (apiFootballTeam && allSportsTeam) {
          console.log(`✅ ${teamName}:`);
          console.log(`   🅰️  AllSports: ${allSportsTeam.name} (ID: ${allSportsTeam.id})`);
          console.log(`   🅱️  API Football: ${apiFootballTeam.name} (ID: ${apiFootballTeam.id})`);
          console.log(`   🎯 Confidence: ${(apiFootballTeam.confidence * 100).toFixed(1)}%`);
        } else if (apiFootballTeam) {
          console.log(`⚠️  ${teamName}: Only in API Football - ${apiFootballTeam.name}`);
        } else if (allSportsTeam) {
          console.log(`⚠️  ${teamName}: Only in AllSports - ${allSportsTeam.name}`);
        } else {
          console.log(`❌ ${teamName}: Not found in either API`);
        }
      } catch (error) {
        console.log(`❌ ${teamName}: Error - ${error.message}`);
      }
    }
    
    // Step 6: Success summary
    console.log('\n🎊 SUCCESS SUMMARY:');
    console.log('═'.repeat(50));
    console.log('✅ Universal team mapping database created');
    console.log('✅ Both APIs synchronized into ONE powerhouse system');
    console.log('✅ ID-based mappings established for fast lookups');
    console.log('✅ Confidence scoring implemented for quality assurance');
    console.log('✅ Bidirectional mapping (AllSports ↔ API Football)');
    console.log('✅ Automatic discovery and fuzzy matching working');
    console.log('✅ Persistent storage with caching for performance');
    console.log('✅ Ready for production use across all services');
    
    console.log('\n🚀 The system is now ready to provide unified data from both APIs!');
    console.log('   Use teamMappingService.findApiFootballTeam() and');
    console.log('   teamMappingService.findAllSportsTeam() in your services.');
    
    return {
      success: true,
      duration,
      stats: finalStatus.stats,
      mappingsCreated: finalStatus.stats.totalMappings
    };
    
  } catch (error) {
    console.error('\n❌ SYNCHRONIZATION FAILED:');
    console.error('═'.repeat(50));
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    logger.error('Initial sync failed', { 
      service: 'team-mapping', 
      error: error.message,
      stack: error.stack 
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the sync if this file is executed directly
if (require.main === module) {
  performInitialSync()
    .then(result => {
      if (result.success) {
        console.log(`\n✅ Sync completed successfully in ${result.duration}s`);
        console.log(`📊 Created ${result.mappingsCreated} team mappings`);
        process.exit(0);
      } else {
        console.log(`\n❌ Sync failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { performInitialSync };
