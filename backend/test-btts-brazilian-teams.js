const bttsService = require('./src/services/bttsStatsService');

console.log('🇧🇷 Testing BTTS with Correct Brazilian Teams');
console.log('==============================================');

async function testBrazilianTeams() {
  try {
    const matchInfo = {
      matchId: 'bragantino-vs-juventude',
      homeTeamName: 'Bragantino',
      awayTeamName: 'Juventude',
      homeTeamLogo: '',
      awayTeamLogo: ''
    };

    console.log('\n📊 Testing with CORRECT Brazilian team IDs:');
    console.log('- Bragantino: team-2015');
    console.log('- Juventude: team-1737');
    console.log('- Match Count: 10');
    
    const result = await bttsService.getBTTSStats('team-2015', 'team-1737', matchInfo, 10);
    
    console.log('\n=== BRAZILIAN TEAMS DATA ANALYSIS ===');
    console.log('Home team (Bragantino) matches:', result.homeStats.recentForm.length);
    console.log('Away team (Juventude) matches:', result.awayStats.recentForm.length);
    
    // Bragantino Analysis
    console.log('\n--- BRAGANTINO ANALYSIS ---');
    let bragantinoCleanSheets = 0;
    let bragantinoFailedToScore = 0;
    let bragantinoTotalGoals = 0;
    
    console.log('Last 10 matches:');
    result.homeStats.recentForm.slice(0, 10).forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) bragantinoCleanSheets++;
      if (failedToScore) bragantinoFailedToScore++;
      bragantinoTotalGoals += match.goalsScored;
      
      console.log(`${index + 1}. vs ${match.opponent} (${match.isHome ? 'H' : 'A'}): ${match.goalsScored}-${match.goalsConceded} | CS: ${cleanSheet} | FTS: ${failedToScore}`);
    });
    
    const bragantinoAvgGoals = bragantinoTotalGoals / 10;
    const bragantinoCleanSheetPct = Math.round((bragantinoCleanSheets / 10) * 100);
    const bragantinoFailedToScorePct = Math.round((bragantinoFailedToScore / 10) * 100);
    
    console.log('\nBRAGANTINO CALCULATIONS:');
    console.log(`Clean Sheets: ${bragantinoCleanSheets}/10 = ${bragantinoCleanSheetPct}%`);
    console.log(`Failed to Score: ${bragantinoFailedToScore}/10 = ${bragantinoFailedToScorePct}%`);
    console.log(`Average Goals: ${bragantinoTotalGoals}/10 = ${bragantinoAvgGoals}`);
    
    // Juventude Analysis
    console.log('\n--- JUVENTUDE ANALYSIS ---');
    let juventudeCleanSheets = 0;
    let juventudeFailedToScore = 0;
    let juventudeTotalGoals = 0;
    
    console.log('Last 10 matches:');
    result.awayStats.recentForm.slice(0, 10).forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) juventudeCleanSheets++;
      if (failedToScore) juventudeFailedToScore++;
      juventudeTotalGoals += match.goalsScored;
      
      console.log(`${index + 1}. vs ${match.opponent} (${match.isHome ? 'H' : 'A'}): ${match.goalsScored}-${match.goalsConceded} | CS: ${cleanSheet} | FTS: ${failedToScore}`);
    });
    
    const juventudeAvgGoals = juventudeTotalGoals / 10;
    const juventudeCleanSheetPct = Math.round((juventudeCleanSheets / 10) * 100);
    const juventudeFailedToScorePct = Math.round((juventudeFailedToScore / 10) * 100);
    
    console.log('\nJUVENTUDE CALCULATIONS:');
    console.log(`Clean Sheets: ${juventudeCleanSheets}/10 = ${juventudeCleanSheetPct}%`);
    console.log(`Failed to Score: ${juventudeFailedToScore}/10 = ${juventudeFailedToScorePct}%`);
    console.log(`Average Goals: ${juventudeTotalGoals}/10 = ${juventudeAvgGoals}`);
    
    // Combined calculations
    const combinedAvgGoals = bragantinoAvgGoals + juventudeAvgGoals;
    
    console.log('\n=== API RESULTS vs MANUAL CALCULATIONS ===');
    console.log('MANUAL CALCULATIONS:');
    console.log(`- Bragantino Clean Sheets: ${bragantinoCleanSheetPct}%`);
    console.log(`- Bragantino Failed to Score: ${bragantinoFailedToScorePct}%`);
    console.log(`- Bragantino Average Goals: ${bragantinoAvgGoals}`);
    console.log(`- Juventude Clean Sheets: ${juventudeCleanSheetPct}%`);
    console.log(`- Juventude Failed to Score: ${juventudeFailedToScorePct}%`);
    console.log(`- Juventude Average Goals: ${juventudeAvgGoals}`);
    console.log(`- Combined Average: ${combinedAvgGoals}`);
    
    console.log('\nAPI COMBINED RESULTS:');
    console.log(`- Bragantino Clean Sheets: ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    console.log(`- Bragantino Failed to Score: ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    console.log(`- Bragantino Average Goals: ${result.combinedStats.averageHomeTeamGoals}`);
    console.log(`- Juventude Clean Sheets: ${result.combinedStats.awayTeamCleanSheetProbability}%`);
    console.log(`- Juventude Failed to Score: ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    console.log(`- Juventude Average Goals: ${result.combinedStats.averageAwayTeamGoals}`);
    console.log(`- Combined Average: ${result.combinedStats.averageTotalGoals}`);
    
    // Verify calculations match
    console.log('\n=== VERIFICATION ===');
    const calculations_match = 
      result.combinedStats.homeTeamCleanSheetProbability === bragantinoCleanSheetPct &&
      result.combinedStats.homeTeamFailToScoreProbability === bragantinoFailedToScorePct &&
      result.combinedStats.averageHomeTeamGoals === bragantinoAvgGoals &&
      result.combinedStats.awayTeamCleanSheetProbability === juventudeCleanSheetPct &&
      result.combinedStats.awayTeamFailToScoreProbability === juventudeFailedToScorePct &&
      result.combinedStats.averageAwayTeamGoals === juventudeAvgGoals &&
      result.combinedStats.averageTotalGoals === combinedAvgGoals;
    
    if (calculations_match) {
      console.log('✅ ALL CALCULATIONS MATCH! The BTTS service is working correctly.');
    } else {
      console.log('❌ CALCULATIONS DO NOT MATCH! There are still issues with the BTTS service.');
      
      // Show specific mismatches
      if (result.combinedStats.homeTeamCleanSheetProbability !== bragantinoCleanSheetPct) {
        console.log(`  ❌ Bragantino Clean Sheets: Expected ${bragantinoCleanSheetPct}%, Got ${result.combinedStats.homeTeamCleanSheetProbability}%`);
      }
      if (result.combinedStats.homeTeamFailToScoreProbability !== bragantinoFailedToScorePct) {
        console.log(`  ❌ Bragantino Failed to Score: Expected ${bragantinoFailedToScorePct}%, Got ${result.combinedStats.homeTeamFailToScoreProbability}%`);
      }
      if (result.combinedStats.averageHomeTeamGoals !== bragantinoAvgGoals) {
        console.log(`  ❌ Bragantino Average Goals: Expected ${bragantinoAvgGoals}, Got ${result.combinedStats.averageHomeTeamGoals}`);
      }
      if (result.combinedStats.awayTeamCleanSheetProbability !== juventudeCleanSheetPct) {
        console.log(`  ❌ Juventude Clean Sheets: Expected ${juventudeCleanSheetPct}%, Got ${result.combinedStats.awayTeamCleanSheetProbability}%`);
      }
      if (result.combinedStats.awayTeamFailToScoreProbability !== juventudeFailedToScorePct) {
        console.log(`  ❌ Juventude Failed to Score: Expected ${juventudeFailedToScorePct}%, Got ${result.combinedStats.awayTeamFailToScoreProbability}%`);
      }
      if (result.combinedStats.averageAwayTeamGoals !== juventudeAvgGoals) {
        console.log(`  ❌ Juventude Average Goals: Expected ${juventudeAvgGoals}, Got ${result.combinedStats.averageAwayTeamGoals}`);
      }
      if (result.combinedStats.averageTotalGoals !== combinedAvgGoals) {
        console.log(`  ❌ Combined Average: Expected ${combinedAvgGoals}, Got ${result.combinedStats.averageTotalGoals}`);
      }
    }
    
    // Check for expected values from your analysis
    console.log('\n=== COMPARISON WITH YOUR EXPECTED VALUES ===');
    console.log('YOUR EXPECTED (from official records):');
    console.log('- Bragantino Clean Sheets: 40% (4/10)');
    console.log('- Bragantino Failed to Score: 30% (3/10)');
    console.log('- Bragantino Average Goals: 1.5 (15/10)');
    console.log('- Juventude Failed to Score: 60% (6/10)');
    console.log('- Juventude Average Goals: 0.5 (5/10)');
    console.log('- Combined Average: 2.0');
    
    console.log('\nACTUAL API RESULTS:');
    console.log(`- Bragantino Clean Sheets: ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    console.log(`- Bragantino Failed to Score: ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    console.log(`- Bragantino Average Goals: ${result.combinedStats.averageHomeTeamGoals}`);
    console.log(`- Juventude Failed to Score: ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    console.log(`- Juventude Average Goals: ${result.combinedStats.averageAwayTeamGoals}`);
    console.log(`- Combined Average: ${result.combinedStats.averageTotalGoals}`);
    
    // Final conclusion
    console.log('\n=== FINAL CONCLUSION ===');
    if (result.combinedStats.averageTotalGoals === 2.0 && 
        result.combinedStats.homeTeamCleanSheetProbability === 40 &&
        result.combinedStats.homeTeamFailToScoreProbability === 30 &&
        result.combinedStats.averageHomeTeamGoals === 1.5 &&
        result.combinedStats.awayTeamFailToScoreProbability === 60 &&
        result.combinedStats.averageAwayTeamGoals === 0.5) {
      console.log('🎉 PERFECT! All values match your expected official records!');
    } else {
      console.log('⚠️  Values do not match expected records. This could be due to:');
      console.log('   1. Different date ranges in API vs official records');
      console.log('   2. Missing matches in API data');
      console.log('   3. Score extraction issues for some matches');
      console.log('   4. Different match filtering criteria');
    }
    
  } catch (error) {
    console.error('❌ Error testing Brazilian teams:', error.message);
  }
}

testBrazilianTeams();
