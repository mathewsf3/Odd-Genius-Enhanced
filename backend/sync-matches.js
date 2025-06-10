const MappingNew = require('./src/services/MappingNew');
const logger = require('./src/utils/logger');

async function runMatchSync() {
  try {
    console.log('🚀 Starting Universal Match Sync...');
    
    // Initialize the mapping system
    await MappingNew.initialize();
    console.log('✅ Mapping system initialized');
    
    // Sync last 30 days and next 7 days of matches
    const result = await MappingNew.syncMatches({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),   // 7 days ahead
      forceUpdate: false
    });
    
    console.log('🎯 Match sync results:', {
      syncId: result.id,
      duration: `${Math.round(result.stats.duration / 1000)}s`,
      matchesFetched: result.stats.matches.fetched,
      matchesMapped: result.stats.matches.mapped,
      errors: result.errors.length
    });
    
    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      result.errors.forEach(error => {
        console.log(`  - ${error.type}: ${error.message}`);
      });
    }
    
    // Get overall statistics
    const stats = MappingNew.getStatistics();
    console.log('📊 System Statistics:');
    console.log(`  Teams: ${stats.teams.total} (${stats.teams.complete} complete)`);
    console.log(`  Leagues: ${stats.leagues.total} (${stats.leagues.complete} complete)`);
    console.log(`  Matches: ${stats.matches.total} (${stats.matches.merged} merged)`);
    console.log(`  API Usage: AllSports=${stats.apiUsage.allSportsCallsToday}, API-Football=${stats.apiUsage.apiFootballCallsToday}/${stats.apiUsage.apiFootballDailyLimit}`);
    
    console.log('✅ Match sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Match sync failed:', error.message);
    logger.error('Match sync script failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const options = {};

// Parse arguments
args.forEach(arg => {
  if (arg === '--force') {
    options.forceUpdate = true;
  } else if (arg.startsWith('--days=')) {
    const days = parseInt(arg.split('=')[1]);
    if (!isNaN(days)) {
      options.from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }
  } else if (arg.startsWith('--future=')) {
    const days = parseInt(arg.split('=')[1]);
    if (!isNaN(days)) {
      options.to = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }
});

// Display usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Universal Match Sync Script

Usage: node sync-matches.js [options]

Options:
  --force           Force update existing matches
  --days=N          Sync N days back (default: 30)
  --future=N        Sync N days ahead (default: 7)
  --help, -h        Show this help message

Examples:
  node sync-matches.js                    # Sync last 30 days + next 7 days
  node sync-matches.js --days=7           # Sync last 7 days + next 7 days
  node sync-matches.js --future=14        # Sync last 30 days + next 14 days
  node sync-matches.js --force            # Force update all matches
  `);
  process.exit(0);
}

// Run the sync
if (require.main === module) {
  runMatchSync().catch(console.error);
}

module.exports = { runMatchSync };
