// Browser console test for BTTS statistics fixes
// Copy and paste this into the browser console on the match page

async function testBTTSFix() {
  console.log('🧮 Testing BTTS Statistics Fix for Bragantino vs Juventude');
  console.log('='.repeat(60));

  // Import the BTTS service (this should work if we're on the match page)
  const bttsService = window.bttsStatsService || (await import('/src/services/bttsStatsService.ts')).default;
  
  if (!bttsService) {
    console.error('❌ Could not access BTTS service');
    return;
  }

  try {
    // Test with Bragantino vs Juventude team IDs (these are example IDs)
    const homeTeamId = '1543'; // Bragantino
    const awayTeamId = '1544'; // Juventude

    console.log('\n📊 Testing Last 10 matches:');
    const stats10 = await bttsService.fetchBTTSStats(homeTeamId, awayTeamId, 10);
    
    console.log(`Home Team (${stats10.homeStats.teamName || 'Home'}) BTTS: ${stats10.homeStats.bttsYesCount}/${stats10.homeStats.totalMatches} (${stats10.homeStats.bttsYesPercentage}%)`);
    console.log(`Away Team (${stats10.awayStats.teamName || 'Away'}) BTTS: ${stats10.awayStats.bttsYesCount}/${stats10.awayStats.totalMatches} (${stats10.awayStats.bttsYesPercentage}%)`);
    console.log(`Home Team Clean Sheets: ${stats10.homeStats.cleanSheetCount}/${stats10.homeStats.totalMatches} (${stats10.homeStats.cleanSheetPercentage}%)`);
    console.log(`Away Team Clean Sheets: ${stats10.awayStats.cleanSheetCount}/${stats10.awayStats.totalMatches} (${stats10.awayStats.cleanSheetPercentage}%)`);
    console.log(`Home Team Failed to Score: ${stats10.homeStats.failedToScoreCount}/${stats10.homeStats.totalMatches} (${stats10.homeStats.failedToScorePercentage}%)`);
    console.log(`Away Team Failed to Score: ${stats10.awayStats.failedToScoreCount}/${stats10.awayStats.totalMatches} (${stats10.awayStats.failedToScorePercentage}%)`);
    console.log(`Combined Average Goals: ${stats10.combinedStats.averageTotalGoals}`);

    console.log('\n📊 Testing Last 5 matches:');
    const stats5 = await bttsService.fetchBTTSStats(homeTeamId, awayTeamId, 5);
    
    console.log(`Home Team (${stats5.homeStats.teamName || 'Home'}) BTTS: ${stats5.homeStats.bttsYesCount}/${stats5.homeStats.totalMatches} (${stats5.homeStats.bttsYesPercentage}%)`);
    console.log(`Away Team (${stats5.awayStats.teamName || 'Away'}) BTTS: ${stats5.awayStats.bttsYesCount}/${stats5.awayStats.totalMatches} (${stats5.awayStats.bttsYesPercentage}%)`);
    console.log(`Home Team Clean Sheets: ${stats5.homeStats.cleanSheetCount}/${stats5.homeStats.totalMatches} (${stats5.homeStats.cleanSheetPercentage}%)`);
    console.log(`Away Team Clean Sheets: ${stats5.awayStats.cleanSheetCount}/${stats5.awayStats.totalMatches} (${stats5.awayStats.cleanSheetPercentage}%)`);
    console.log(`Home Team Failed to Score: ${stats5.homeStats.failedToScoreCount}/${stats5.homeStats.totalMatches} (${stats5.homeStats.failedToScorePercentage}%)`);
    console.log(`Away Team Failed to Score: ${stats5.awayStats.failedToScoreCount}/${stats5.awayStats.totalMatches} (${stats5.awayStats.failedToScorePercentage}%)`);
    console.log(`Combined Average Goals: ${stats5.combinedStats.averageTotalGoals}`);

    // Expected values from the analysis
    console.log('\n✅ Expected values (from analysis):');
    console.log('Last 10: Bragantino BTTS 4/10 (40%), Juventude BTTS 4/10 (40%)');
    console.log('Last 5: Bragantino BTTS 2/5 (40%), Juventude BTTS 3/5 (60%)');
    console.log('Last 10: Bragantino Clean Sheets 4/10 (40%), Juventude Clean Sheets 1/10 (10%)');
    console.log('Last 5: Bragantino Clean Sheets 0/5 (0%), Juventude Clean Sheets 1/5 (20%)');
    console.log('Last 10: Combined Average Goals 2.0');
    console.log('Last 5: Combined Average Goals 2.6');

    // Validation
    console.log('\n🔍 Validation Results:');
    
    const validations = [
      { name: 'Bragantino BTTS % (Last 10)', actual: stats10.homeStats.bttsYesPercentage, expected: 40 },
      { name: 'Juventude BTTS % (Last 10)', actual: stats10.awayStats.bttsYesPercentage, expected: 40 },
      { name: 'Bragantino BTTS % (Last 5)', actual: stats5.homeStats.bttsYesPercentage, expected: 40 },
      { name: 'Juventude BTTS % (Last 5)', actual: stats5.awayStats.bttsYesPercentage, expected: 60 },
      { name: 'Bragantino Clean Sheets % (Last 10)', actual: stats10.homeStats.cleanSheetPercentage, expected: 40 },
      { name: 'Juventude Clean Sheets % (Last 10)', actual: stats10.awayStats.cleanSheetPercentage, expected: 10 },
      { name: 'Bragantino Clean Sheets % (Last 5)', actual: stats5.homeStats.cleanSheetPercentage, expected: 0 },
      { name: 'Juventude Clean Sheets % (Last 5)', actual: stats5.awayStats.cleanSheetPercentage, expected: 20 },
    ];

    let allPassed = true;
    validations.forEach(validation => {
      const passed = validation.actual === validation.expected;
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${validation.name}: ${validation.actual}% (expected ${validation.expected}%)`);
      if (!passed) allPassed = false;
    });

    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  } catch (error) {
    console.error('❌ Error testing BTTS fix:', error);
  }
}

// Instructions for use
console.log('📋 Instructions:');
console.log('1. Navigate to a match page (e.g., http://localhost:3000/match/1)');
console.log('2. Open browser console (F12)');
console.log('3. Run: testBTTSFix()');
console.log('4. Check the results against expected values');

// Auto-run if we detect we're on a match page
if (window.location.pathname.includes('/match/')) {
  console.log('🚀 Auto-running test since we\'re on a match page...');
  testBTTSFix();
}
