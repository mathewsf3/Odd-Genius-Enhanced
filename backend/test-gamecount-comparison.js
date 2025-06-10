const axios = require('axios');

async function testGameCountComparison() {
  try {
    console.log('🔍 Testing GameCount Parameter - 5 vs 10 matches');
    console.log('=================================================');
    
    console.log('\n📊 Testing with matches=10...');
    const response10 = await axios.get('http://localhost:5000/api/matches/1544012/btts?matches=10', {
      timeout: 15000
    });
    
    console.log('\n📊 Testing with matches=5...');
    const response5 = await axios.get('http://localhost:5000/api/matches/1544012/btts?matches=5', {
      timeout: 15000
    });
    
    if (response10.data.success && response5.data.success) {
      const result10 = response10.data.result;
      const result5 = response5.data.result;
      
      console.log('\n=== COMPARISON RESULTS ===');
      console.log('Metric                          | 10 Matches | 5 Matches | Different?');
      console.log('-------------------------------|------------|-----------|------------');
      console.log(`Combined Average Goals          | ${result10.combinedStats.averageTotalGoals}        | ${result5.combinedStats.averageTotalGoals}       | ${result10.combinedStats.averageTotalGoals !== result5.combinedStats.averageTotalGoals ? '✅ YES' : '❌ NO'}`);
      console.log(`Home Clean Sheets (Combined)    | ${result10.combinedStats.homeTeamCleanSheetProbability}%        | ${result5.combinedStats.homeTeamCleanSheetProbability}%       | ${result10.combinedStats.homeTeamCleanSheetProbability !== result5.combinedStats.homeTeamCleanSheetProbability ? '✅ YES' : '❌ NO'}`);
      console.log(`Away Clean Sheets (Combined)    | ${result10.combinedStats.awayTeamCleanSheetProbability}%        | ${result5.combinedStats.awayTeamCleanSheetProbability}%       | ${result10.combinedStats.awayTeamCleanSheetProbability !== result5.combinedStats.awayTeamCleanSheetProbability ? '✅ YES' : '❌ NO'}`);
      console.log(`Home Failed to Score (Combined) | ${result10.combinedStats.homeTeamFailToScoreProbability}%        | ${result5.combinedStats.homeTeamFailToScoreProbability}%       | ${result10.combinedStats.homeTeamFailToScoreProbability !== result5.combinedStats.homeTeamFailToScoreProbability ? '✅ YES' : '❌ NO'}`);
      console.log(`Away Failed to Score (Combined) | ${result10.combinedStats.awayTeamFailToScoreProbability}%        | ${result5.combinedStats.awayTeamFailToScoreProbability}%       | ${result10.combinedStats.awayTeamFailToScoreProbability !== result5.combinedStats.awayTeamFailToScoreProbability ? '✅ YES' : '❌ NO'}`);
      
      console.log('\n=== DIAGNOSIS ===');
      const allSame = 
        result10.combinedStats.averageTotalGoals === result5.combinedStats.averageTotalGoals &&
        result10.combinedStats.homeTeamCleanSheetProbability === result5.combinedStats.homeTeamCleanSheetProbability &&
        result10.combinedStats.awayTeamCleanSheetProbability === result5.combinedStats.awayTeamCleanSheetProbability &&
        result10.combinedStats.homeTeamFailToScoreProbability === result5.combinedStats.homeTeamFailToScoreProbability &&
        result10.combinedStats.awayTeamFailToScoreProbability === result5.combinedStats.awayTeamFailToScoreProbability;
      
      if (allSame) {
        console.log('❌ SLICE-OF-5 BUG CONFIRMED: All values are identical between 5 and 10 matches!');
        console.log('   This means the gameCount parameter is being ignored in calculations.');
        console.log('   The backend is still using hardcoded slice(0,5) logic.');
      } else {
        console.log('✅ GameCount parameter is working: Values differ between 5 and 10 matches.');
        console.log('   The discrepancies might be due to different date ranges or missing data.');
      }
      
      // Check individual team stats (full dataset)
      console.log('\n=== FULL DATASET COMPARISON ===');
      console.log('These should be IDENTICAL (full dataset stats):');
      console.log(`Home Clean Sheets (Full)        | ${result10.homeStats.cleanSheetPercentage}%        | ${result5.homeStats.cleanSheetPercentage}%       | ${result10.homeStats.cleanSheetPercentage === result5.homeStats.cleanSheetPercentage ? '✅ SAME' : '❌ DIFFERENT'}`);
      console.log(`Away Clean Sheets (Full)        | ${result10.awayStats.cleanSheetPercentage}%        | ${result5.awayStats.cleanSheetPercentage}%       | ${result10.awayStats.cleanSheetPercentage === result5.awayStats.cleanSheetPercentage ? '✅ SAME' : '❌ DIFFERENT'}`);
      console.log(`Home Failed to Score (Full)     | ${result10.homeStats.failedToScorePercentage}%        | ${result5.homeStats.failedToScorePercentage}%       | ${result10.homeStats.failedToScorePercentage === result5.homeStats.failedToScorePercentage ? '✅ SAME' : '❌ DIFFERENT'}`);
      console.log(`Away Failed to Score (Full)     | ${result10.awayStats.failedToScorePercentage}%        | ${result5.awayStats.failedToScorePercentage}%       | ${result10.awayStats.failedToScorePercentage === result5.awayStats.failedToScorePercentage ? '✅ SAME' : '❌ DIFFERENT'}`);
      
    } else {
      console.log('❌ One or both API calls failed');
      if (!response10.data.success) console.log('10 matches error:', response10.data.error);
      if (!response5.data.success) console.log('5 matches error:', response5.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGameCountComparison();
