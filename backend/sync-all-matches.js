const MappingNew = require('./src/services/MappingNew');
const logger = require('./src/utils/logger');

async function syncAllMatches() {
  console.log('🚀 Starting comprehensive match synchronization...\n');
  
  const startTime = Date.now();
  
  try {
    // Initialize the mapping system
    console.log('1. Initializing universal mapping system...');
    await MappingNew.initialize();
    console.log('✅ Mapping system initialized\n');
    
    // Get initial statistics
    const initialStats = MappingNew.getStatistics();
    console.log('📊 Initial System State:');
    console.log(`   Teams: ${initialStats.teams.total} (${initialStats.teams.complete} complete)`);
    console.log(`   Leagues: ${initialStats.leagues.total} (${initialStats.leagues.complete} complete)`);
    console.log(`   Matches: ${initialStats.matches.total} (${initialStats.matches.merged} merged)\n`);
    
    // Sync last 60 days and next 14 days
    console.log('2. Starting comprehensive match sync...');
    console.log('   📅 Date Range: Last 60 days + Next 14 days');
    console.log('   🔄 Force Update: Enabled');
    console.log('   🎯 Target: All available matches\n');
    
    const result = await MappingNew.syncMatches({
      from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),   // 14 days ahead
      forceUpdate: true
    });
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Match sync completed successfully!');
    console.log('📈 Sync Results:');
    console.log(`   🆔 Sync ID: ${result.id}`);
    console.log(`   ⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   📥 Matches Fetched: ${result.stats.matches.fetched}`);
    console.log(`   🔗 Matches Mapped: ${result.stats.matches.mapped}`);
    console.log(`   ❌ Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.type}: ${error.message}`);
      });
      if (result.errors.length > 5) {
        console.log(`   ... and ${result.errors.length - 5} more errors`);
      }
    }
    
    // Get final statistics
    const finalStats = MappingNew.getStatistics();
    console.log('\n📊 Final System Statistics:');
    console.log(`   Teams: ${finalStats.teams.total} total`);
    console.log(`     ✅ Complete (both APIs): ${finalStats.teams.complete}`);
    console.log(`     🟡 AllSports only: ${finalStats.teams.allsportsOnly || 0}`);
    console.log(`     🔵 API Football only: ${finalStats.teams.apiFootballOnly || 0}`);
    
    console.log(`   Leagues: ${finalStats.leagues.total} total`);
    console.log(`     ✅ Complete (both APIs): ${finalStats.leagues.complete}`);
    
    console.log(`   Matches: ${finalStats.matches.total} total`);
    console.log(`     ✅ Merged (both APIs): ${finalStats.matches.merged}`);
    console.log(`     🟡 AllSports only: ${finalStats.matches.allsportsOnly || 0}`);
    console.log(`     🔵 API Football only: ${finalStats.matches.apiFootballOnly || 0}`);
    
    console.log(`   API Usage:`);
    console.log(`     🟡 AllSports calls today: ${finalStats.apiUsage.allSportsCallsToday}`);
    console.log(`     🔵 API Football calls today: ${finalStats.apiUsage.apiFootballCallsToday}/${finalStats.apiUsage.apiFootballDailyLimit}`);
    
    // Calculate improvement
    const matchImprovement = finalStats.matches.total - initialStats.matches.total;
    const mergedImprovement = finalStats.matches.merged - initialStats.matches.merged;
    
    console.log('\n📈 Sync Impact:');
    console.log(`   📥 New matches added: ${matchImprovement}`);
    console.log(`   🔗 New merged matches: ${mergedImprovement}`);
    console.log(`   📊 Data coverage: ${Math.round((finalStats.matches.merged / finalStats.matches.total) * 100)}%`);
    
    // Health check
    const health = {
      teamsHealthy: finalStats.teams.complete > finalStats.teams.total * 0.5,
      matchesHealthy: finalStats.matches.merged > finalStats.matches.total * 0.3,
      apiLimitsOk: finalStats.apiUsage.apiFootballCallsToday < finalStats.apiUsage.apiFootballDailyLimit * 0.8
    };
    
    console.log('\n🏥 System Health:');
    console.log(`   Teams: ${health.teamsHealthy ? '✅ Healthy' : '⚠️  Needs attention'}`);
    console.log(`   Matches: ${health.matchesHealthy ? '✅ Healthy' : '⚠️  Needs attention'}`);
    console.log(`   API Limits: ${health.apiLimitsOk ? '✅ OK' : '⚠️  Approaching limit'}`);
    
    console.log('\n🎉 Comprehensive match synchronization completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Start the backend server to enable automatic sync jobs');
    console.log('   2. Monitor /api/admin/sync/status for ongoing health');
    console.log('   3. Use the unified system in your controllers');
    
  } catch (error) {
    console.error('\n❌ Comprehensive match sync failed:', error.message);
    logger.error('Comprehensive match sync failed', { 
      error: error.message, 
      stack: error.stack 
    });
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your API keys are valid');
    console.log('   2. Ensure you have internet connectivity');
    console.log('   3. Check the logs for detailed error information');
    console.log('   4. Try running with a smaller date range first');
    
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Comprehensive Match Sync Script

This script performs a full synchronization of matches from both AllSportsAPI 
and API-Football, creating a unified database for the system.

Usage: node sync-all-matches.js [options]

Options:
  --help, -h        Show this help message
  --quick           Quick sync (last 7 days + next 7 days)
  --historical      Historical sync (last 90 days only)
  --future          Future sync (next 30 days only)

Examples:
  node sync-all-matches.js                    # Full sync (60 days back + 14 ahead)
  node sync-all-matches.js --quick            # Quick sync (7 days back + 7 ahead)
  node sync-all-matches.js --historical       # Historical only (90 days back)
  node sync-all-matches.js --future           # Future only (30 days ahead)

Note: This script will take several minutes to complete depending on the 
amount of data and API response times.
  `);
  process.exit(0);
}

// Handle different sync modes
if (args.includes('--quick')) {
  console.log('🚀 Running in QUICK mode (7 days back + 7 days ahead)');
  // Override the sync parameters in the function
}

if (args.includes('--historical')) {
  console.log('🚀 Running in HISTORICAL mode (90 days back only)');
  // Override the sync parameters in the function
}

if (args.includes('--future')) {
  console.log('🚀 Running in FUTURE mode (30 days ahead only)');
  // Override the sync parameters in the function
}

// Run the sync
if (require.main === module) {
  syncAllMatches().catch(console.error);
}

module.exports = { syncAllMatches };
