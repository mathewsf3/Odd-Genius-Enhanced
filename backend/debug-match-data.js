const bttsService = require('./src/services/bttsStatsService');

async function debugMatchData() {
  try {
    console.log('🔍 Debugging Match Data for Bragantino vs Juventude');
    console.log('===================================================');
    
    const matchInfo = {
      matchId: '1544012',
      homeTeamName: 'Bragantino',
      awayTeamName: 'Juventude',
      homeTeamLogo: '',
      awayTeamLogo: ''
    };
    
    console.log('\n📊 Getting BTTS stats with matchCount=10...');
    const result = await bttsService.getBTTSStats('team-2015', 'team-1737', matchInfo, 10);
    
    console.log('\n=== BRAGANTINO (HOME) MATCH ANALYSIS ===');
    console.log(`Total matches found: ${result.homeStats.recentForm.length}`);
    console.log('Last 10 matches:');
    
    let bragantinoCleanSheets = 0;
    let bragantinoFailedToScore = 0;
    let bragantinoTotalGoals = 0;
    
    result.homeStats.recentForm.slice(0, 10).forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) bragantinoCleanSheets++;
      if (failedToScore) bragantinoFailedToScore++;
      bragantinoTotalGoals += match.goalsScored;
      
      console.log(`${index + 1}. ${match.date} vs ${match.opponent} (${match.isHome ? 'H' : 'A'}): ${match.goalsScored}-${match.goalsConceded} | CS: ${cleanSheet} | FTS: ${failedToScore}`);
    });
    
    console.log('\n=== JUVENTUDE (AWAY) MATCH ANALYSIS ===');
    console.log(`Total matches found: ${result.awayStats.recentForm.length}`);
    console.log('Last 10 matches:');
    
    let juventudeCleanSheets = 0;
    let juventudeFailedToScore = 0;
    let juventudeTotalGoals = 0;
    
    result.awayStats.recentForm.slice(0, 10).forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) juventudeCleanSheets++;
      if (failedToScore) juventudeFailedToScore++;
      juventudeTotalGoals += match.goalsScored;
      
      console.log(`${index + 1}. ${match.date} vs ${match.opponent} (${match.isHome ? 'H' : 'A'}): ${match.goalsScored}-${match.goalsConceded} | CS: ${cleanSheet} | FTS: ${failedToScore}`);
    });
    
    console.log('\n=== MANUAL CALCULATIONS (Last 10) ===');
    const bragantinoAvg = bragantinoTotalGoals / 10;
    const juventudeAvg = juventudeTotalGoals / 10;
    const combinedAvg = bragantinoAvg + juventudeAvg;
    const bragantinoCSPct = Math.round((bragantinoCleanSheets / 10) * 100);
    const bragantinoFTSPct = Math.round((bragantinoFailedToScore / 10) * 100);
    const juventudeCSPct = Math.round((juventudeCleanSheets / 10) * 100);
    const juventudeFTSPct = Math.round((juventudeFailedToScore / 10) * 100);
    
    console.log(`Bragantino: ${bragantinoTotalGoals} goals / 10 matches = ${bragantinoAvg} avg`);
    console.log(`Juventude: ${juventudeTotalGoals} goals / 10 matches = ${juventudeAvg} avg`);
    console.log(`Combined Average: ${combinedAvg}`);
    console.log(`Bragantino Clean Sheets: ${bragantinoCleanSheets}/10 = ${bragantinoCSPct}%`);
    console.log(`Bragantino Failed to Score: ${bragantinoFailedToScore}/10 = ${bragantinoFTSPct}%`);
    console.log(`Juventude Clean Sheets: ${juventudeCleanSheets}/10 = ${juventudeCSPct}%`);
    console.log(`Juventude Failed to Score: ${juventudeFailedToScore}/10 = ${juventudeFTSPct}%`);
    
    console.log('\n=== API RESULTS ===');
    console.log(`Bragantino Average Goals: ${result.combinedStats.averageHomeTeamGoals}`);
    console.log(`Juventude Average Goals: ${result.combinedStats.averageAwayTeamGoals}`);
    console.log(`Combined Average: ${result.combinedStats.averageTotalGoals}`);
    console.log(`Bragantino Clean Sheets: ${result.combinedStats.homeTeamCleanSheetProbability}%`);
    console.log(`Bragantino Failed to Score: ${result.combinedStats.homeTeamFailToScoreProbability}%`);
    console.log(`Juventude Clean Sheets: ${result.combinedStats.awayTeamCleanSheetProbability}%`);
    console.log(`Juventude Failed to Score: ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    
    console.log('\n=== COMPARISON WITH YOUR EXPECTED VALUES ===');
    console.log('YOUR EXPECTED (from official records):');
    console.log('- Bragantino Clean Sheets: 40% (4/10)');
    console.log('- Bragantino Failed to Score: 30% (3/10)');
    console.log('- Bragantino Average Goals: 1.5 (15/10)');
    console.log('- Juventude Failed to Score: 60% (6/10)');
    console.log('- Juventude Average Goals: 0.5 (5/10)');
    console.log('- Combined Average: 2.0');
    
    console.log('\nACTUAL MANUAL CALCULATIONS:');
    console.log(`- Bragantino Clean Sheets: ${bragantinoCSPct}% (${bragantinoCleanSheets}/10)`);
    console.log(`- Bragantino Failed to Score: ${bragantinoFTSPct}% (${bragantinoFailedToScore}/10)`);
    console.log(`- Bragantino Average Goals: ${bragantinoAvg} (${bragantinoTotalGoals}/10)`);
    console.log(`- Juventude Failed to Score: ${juventudeFTSPct}% (${juventudeFailedToScore}/10)`);
    console.log(`- Juventude Average Goals: ${juventudeAvg} (${juventudeTotalGoals}/10)`);
    console.log(`- Combined Average: ${combinedAvg}`);
    
    console.log('\n=== DISCREPANCY ANALYSIS ===');
    const discrepancies = [];
    
    if (bragantinoCSPct !== 40) {
      discrepancies.push(`❌ Bragantino Clean Sheets: Expected 40%, Got ${bragantinoCSPct}% (${bragantinoCleanSheets}/10)`);
    } else {
      discrepancies.push(`✅ Bragantino Clean Sheets: Perfect match!`);
    }
    
    if (bragantinoFTSPct !== 30) {
      discrepancies.push(`❌ Bragantino Failed to Score: Expected 30%, Got ${bragantinoFTSPct}% (${bragantinoFailedToScore}/10)`);
    } else {
      discrepancies.push(`✅ Bragantino Failed to Score: Perfect match!`);
    }
    
    if (bragantinoAvg !== 1.5) {
      discrepancies.push(`❌ Bragantino Average Goals: Expected 1.5, Got ${bragantinoAvg} (${bragantinoTotalGoals}/10)`);
    } else {
      discrepancies.push(`✅ Bragantino Average Goals: Perfect match!`);
    }
    
    if (juventudeFTSPct !== 60) {
      discrepancies.push(`❌ Juventude Failed to Score: Expected 60%, Got ${juventudeFTSPct}% (${juventudeFailedToScore}/10)`);
    } else {
      discrepancies.push(`✅ Juventude Failed to Score: Perfect match!`);
    }
    
    if (juventudeAvg !== 0.5) {
      discrepancies.push(`❌ Juventude Average Goals: Expected 0.5, Got ${juventudeAvg} (${juventudeTotalGoals}/10)`);
    } else {
      discrepancies.push(`✅ Juventude Average Goals: Perfect match!`);
    }
    
    if (combinedAvg !== 2.0) {
      discrepancies.push(`❌ Combined Average: Expected 2.0, Got ${combinedAvg}`);
    } else {
      discrepancies.push(`✅ Combined Average: Perfect match!`);
    }
    
    discrepancies.forEach(d => console.log(d));
    
    if (discrepancies.every(d => d.startsWith('✅'))) {
      console.log('\n🎉 PERFECT! All calculations match your expected values!');
    } else {
      console.log('\n⚠️  Some discrepancies found. Possible causes:');
      console.log('   1. Different date ranges (API vs official records)');
      console.log('   2. Missing matches in API data');
      console.log('   3. Different match filtering criteria');
      console.log('   4. Score extraction issues for some matches');
    }
    
  } catch (error) {
    console.error('❌ Error debugging match data:', error.message);
  }
}

debugMatchData();
