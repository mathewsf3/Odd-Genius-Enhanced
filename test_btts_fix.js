// Test script to verify BTTS statistics fixes
// This script tests the specific Bragantino vs Juventude match mentioned in the analysis

const axios = require('axios');

async function testBTTSFix() {
  console.log('🧮 Testing BTTS Statistics Fix for Bragantino vs Juventude');
  console.log('='.repeat(60));

  try {
    // Test Last 10 matches
    console.log('\n📊 Testing Last 10 matches:');
    const response10 = await axios.get('http://localhost:3001/api/btts-stats/1?gameCount=10');
    const stats10 = response10.data;

    console.log(`Home Team (${stats10.homeTeamStats.teamName}) BTTS: ${stats10.homeTeamStats.bttsYesCount}/${stats10.homeTeamStats.totalMatches} (${stats10.homeTeamStats.bttsYesPercentage}%)`);
    console.log(`Away Team (${stats10.awayTeamStats.teamName}) BTTS: ${stats10.awayTeamStats.bttsYesCount}/${stats10.awayTeamStats.totalMatches} (${stats10.awayTeamStats.bttsYesPercentage}%)`);
    console.log(`Home Team Clean Sheets: ${stats10.homeTeamStats.cleanSheetCount}/${stats10.homeTeamStats.totalMatches} (${stats10.homeTeamStats.cleanSheetPercentage}%)`);
    console.log(`Away Team Clean Sheets: ${stats10.awayTeamStats.cleanSheetCount}/${stats10.awayTeamStats.totalMatches} (${stats10.awayTeamStats.cleanSheetPercentage}%)`);
    console.log(`Home Team Failed to Score: ${stats10.homeTeamStats.failedToScoreCount}/${stats10.homeTeamStats.totalMatches} (${stats10.homeTeamStats.failedToScorePercentage}%)`);
    console.log(`Away Team Failed to Score: ${stats10.awayTeamStats.failedToScoreCount}/${stats10.awayTeamStats.totalMatches} (${stats10.awayTeamStats.failedToScorePercentage}%)`);
    console.log(`Combined Average Goals: ${stats10.combinedStats.averageTotalGoals}`);

    // Test Last 5 matches
    console.log('\n📊 Testing Last 5 matches:');
    const response5 = await axios.get('http://localhost:3001/api/btts-stats/1?gameCount=5');
    const stats5 = response5.data;

    console.log(`Home Team (${stats5.homeTeamStats.teamName}) BTTS: ${stats5.homeTeamStats.bttsYesCount}/${stats5.homeTeamStats.totalMatches} (${stats5.homeTeamStats.bttsYesPercentage}%)`);
    console.log(`Away Team (${stats5.awayTeamStats.teamName}) BTTS: ${stats5.awayTeamStats.bttsYesCount}/${stats5.awayTeamStats.totalMatches} (${stats5.awayTeamStats.bttsYesPercentage}%)`);
    console.log(`Home Team Clean Sheets: ${stats5.homeTeamStats.cleanSheetCount}/${stats5.homeTeamStats.totalMatches} (${stats5.homeTeamStats.cleanSheetPercentage}%)`);
    console.log(`Away Team Clean Sheets: ${stats5.awayTeamStats.cleanSheetCount}/${stats5.awayTeamStats.totalMatches} (${stats5.awayTeamStats.cleanSheetPercentage}%)`);
    console.log(`Home Team Failed to Score: ${stats5.homeTeamStats.failedToScoreCount}/${stats5.homeTeamStats.totalMatches} (${stats5.homeTeamStats.failedToScorePercentage}%)`);
    console.log(`Away Team Failed to Score: ${stats5.awayTeamStats.failedToScoreCount}/${stats5.awayTeamStats.totalMatches} (${stats5.awayTeamStats.failedToScorePercentage}%)`);
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

    // Check if the values match expected results
    const validations = [
      { name: 'Bragantino BTTS % (Last 10)', actual: stats10.homeTeamStats.bttsYesPercentage, expected: 40 },
      { name: 'Juventude BTTS % (Last 10)', actual: stats10.awayTeamStats.bttsYesPercentage, expected: 40 },
      { name: 'Bragantino BTTS % (Last 5)', actual: stats5.homeTeamStats.bttsYesPercentage, expected: 40 },
      { name: 'Juventude BTTS % (Last 5)', actual: stats5.awayTeamStats.bttsYesPercentage, expected: 60 },
      { name: 'Bragantino Clean Sheets % (Last 10)', actual: stats10.homeTeamStats.cleanSheetPercentage, expected: 40 },
      { name: 'Juventude Clean Sheets % (Last 10)', actual: stats10.awayTeamStats.cleanSheetPercentage, expected: 10 },
      { name: 'Bragantino Clean Sheets % (Last 5)', actual: stats5.homeTeamStats.cleanSheetPercentage, expected: 0 },
      { name: 'Juventude Clean Sheets % (Last 5)', actual: stats5.awayTeamStats.cleanSheetPercentage, expected: 20 },
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
    console.error('❌ Error testing BTTS fix:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBTTSFix();
