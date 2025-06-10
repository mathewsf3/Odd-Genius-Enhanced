const bttsService = require('./src/services/bttsStatsService');

console.log('🔍 BTTS Discrepancy Debug - Bragantino vs Juventude');
console.log('====================================================');

async function debugBTTSDiscrepancy() {
  try {
    const matchInfo = {
      matchId: 'test-match',
      homeTeamName: 'Bragantino',
      awayTeamName: 'Juventude',
      homeTeamLogo: '',
      awayTeamLogo: ''
    };

    console.log('\n📊 Testing with matchCount=10 (Last 10 matches)...');
    console.log('Using CORRECT team IDs: Bragantino (2015) vs Juventude (1737)');
    const result = await bttsService.getBTTSStats('team-2015', 'team-1737', matchInfo, 10);

    console.log('\n=== RAW DATA ANALYSIS ===');
    console.log('Home team (Bragantino) matches:', result.homeStats.recentForm.length);
    console.log('Away team (Juventude) matches:', result.awayStats.recentForm.length);

    // Manual calculation for Bragantino (Home team)
    console.log('\n--- BRAGANTINO (HOME) ANALYSIS ---');
    let bragantinoCleanSheets = 0;
    let bragantinoFailedToScore = 0;
    let bragantinoTotalGoals = 0;

    console.log('Match-by-match breakdown:');
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

    console.log('\nBRAGANTINO MANUAL CALCULATIONS:');
    console.log(`Clean Sheets: ${bragantinoCleanSheets}/10 = ${bragantinoCleanSheetPct}%`);
    console.log(`Failed to Score: ${bragantinoFailedToScore}/10 = ${bragantinoFailedToScorePct}%`);
    console.log(`Average Goals: ${bragantinoTotalGoals}/10 = ${bragantinoAvgGoals}`);

    console.log('\nBRAGANTINO API RESULTS:');
    console.log(`Clean Sheets (Combined): ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    console.log(`Failed to Score (Combined): ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    console.log(`Average Goals (Combined): ${result.combinedStats.averageHomeTeamGoals}`);

    // Manual calculation for Juventude (Away team)
    console.log('\n--- JUVENTUDE (AWAY) ANALYSIS ---');
    let juventudeCleanSheets = 0;
    let juventudeFailedToScore = 0;
    let juventudeTotalGoals = 0;

    console.log('Match-by-match breakdown:');
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

    console.log('\nJUVENTUDE MANUAL CALCULATIONS:');
    console.log(`Clean Sheets: ${juventudeCleanSheets}/10 = ${juventudeCleanSheetPct}%`);
    console.log(`Failed to Score: ${juventudeFailedToScore}/10 = ${juventudeFailedToScorePct}%`);
    console.log(`Average Goals: ${juventudeTotalGoals}/10 = ${juventudeAvgGoals}`);

    console.log('\nJUVENTUDE API RESULTS:');
    console.log(`Clean Sheets (Combined): ${result.combinedStats.awayTeamCleanSheetProbability}%`);
    console.log(`Failed to Score (Combined): ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    console.log(`Average Goals (Combined): ${result.combinedStats.averageAwayTeamGoals}`);

    // Combined calculations
    const combinedAvgGoals = bragantinoAvgGoals + juventudeAvgGoals;

    console.log('\n=== COMBINED ANALYSIS ===');
    console.log(`Manual Combined Average: ${bragantinoAvgGoals} + ${juventudeAvgGoals} = ${combinedAvgGoals}`);
    console.log(`API Combined Average: ${result.combinedStats.averageTotalGoals}`);

    // Expected vs Actual comparison
    console.log('\n=== EXPECTED vs ACTUAL (Based on your analysis) ===');
    console.log('EXPECTED (from official records):');
    console.log('- Bragantino Clean Sheets: 4/10 = 40%');
    console.log('- Bragantino Failed to Score: 3/10 = 30%');
    console.log('- Bragantino Average Goals: 15/10 = 1.5');
    console.log('- Juventude Average Goals: 5/10 = 0.5');
    console.log('- Juventude Failed to Score: 6/10 = 60%');
    console.log('- Combined Average: 2.0');

    console.log('\nACTUAL (from API):');
    console.log(`- Bragantino Clean Sheets: ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    console.log(`- Bragantino Failed to Score: ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    console.log(`- Bragantino Average Goals: ${result.combinedStats.averageHomeTeamGoals}`);
    console.log(`- Juventude Average Goals: ${result.combinedStats.averageAwayTeamGoals}`);
    console.log(`- Juventude Failed to Score: ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    console.log(`- Combined Average: ${result.combinedStats.averageTotalGoals}`);

    // Identify discrepancies
    console.log('\n=== DISCREPANCY ANALYSIS ===');
    const discrepancies = [];

    if (result.combinedStats.homeTeamCleanSheetProbability !== 40) {
      discrepancies.push(`❌ Bragantino Clean Sheets: Expected 40%, Got ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    }
    if (result.combinedStats.homeTeamFailToScoreProbability !== 30) {
      discrepancies.push(`❌ Bragantino Failed to Score: Expected 30%, Got ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    }
    if (result.combinedStats.averageHomeTeamGoals !== 1.5) {
      discrepancies.push(`❌ Bragantino Average Goals: Expected 1.5, Got ${result.combinedStats.averageHomeTeamGoals}`);
    }
    if (result.combinedStats.averageAwayTeamGoals !== 0.5) {
      discrepancies.push(`❌ Juventude Average Goals: Expected 0.5, Got ${result.combinedStats.averageAwayTeamGoals}`);
    }
    if (result.combinedStats.awayTeamFailToScoreProbability !== 60) {
      discrepancies.push(`❌ Juventude Failed to Score: Expected 60%, Got ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    }
    if (result.combinedStats.averageTotalGoals !== 2.0) {
      discrepancies.push(`❌ Combined Average: Expected 2.0, Got ${result.combinedStats.averageTotalGoals}`);
    }

    if (discrepancies.length === 0) {
      console.log('✅ All calculations match expected values!');
    } else {
      console.log('Found discrepancies:');
      discrepancies.forEach(d => console.log(d));
    }

    // Check for 0-0 matches (score extraction issues)
    console.log('\n=== SCORE EXTRACTION ANALYSIS ===');
    const zeroZeroMatches = [];

    result.homeStats.recentForm.forEach((match, index) => {
      if (match.goalsScored === 0 && match.goalsConceded === 0) {
        zeroZeroMatches.push(`Bragantino match ${index + 1}: vs ${match.opponent} (0-0)`);
      }
    });

    result.awayStats.recentForm.forEach((match, index) => {
      if (match.goalsScored === 0 && match.goalsConceded === 0) {
        zeroZeroMatches.push(`Juventude match ${index + 1}: vs ${match.opponent} (0-0)`);
      }
    });

    if (zeroZeroMatches.length > 0) {
      console.log('⚠️  Found potential score extraction issues (0-0 matches):');
      zeroZeroMatches.forEach(m => console.log(`   ${m}`));
    } else {
      console.log('✅ No 0-0 matches found - score extraction appears to be working');
    }

  } catch (error) {
    console.error('❌ Error debugging BTTS discrepancy:', error.message);
  }
}

debugBTTSDiscrepancy();
