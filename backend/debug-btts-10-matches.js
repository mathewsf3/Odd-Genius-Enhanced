const axios = require('axios');

async function debugBTTS10Matches() {
  try {
    console.log('🔍 DEBUGGING BTTS LAST 10 MATCHES DISCREPANCIES');
    
    const response = await axios.get('http://localhost:5000/api/matches/1544012/btts?matches=10', { timeout: 15000 });
    const result = response.data.result;
    
    console.log('\n=== BRAGANTINO (HOME) ANALYSIS ===');
    console.log('Total matches:', result.homeStats.totalMatches);
    console.log('Recent form length:', result.homeStats.recentForm.length);
    
    let cleanSheetCount = 0;
    let failedToScoreCount = 0;
    let totalGoals = 0;
    
    console.log('\nMatch-by-match analysis:');
    result.homeStats.recentForm.forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) cleanSheetCount++;
      if (failedToScore) failedToScoreCount++;
      totalGoals += match.goalsScored;
      
      console.log(`${index + 1}. ${match.opponent} - Scored: ${match.goalsScored}, Conceded: ${match.goalsConceded}, CS: ${cleanSheet}, FTS: ${failedToScore}`);
    });
    
    const calculatedCleanSheetPercentage = Math.round((cleanSheetCount / result.homeStats.totalMatches) * 100);
    const calculatedFailedToScorePercentage = Math.round((failedToScoreCount / result.homeStats.totalMatches) * 100);
    const calculatedAvgGoals = Math.round((totalGoals / result.homeStats.totalMatches) * 100) / 100;
    
    console.log('\n--- BRAGANTINO CALCULATIONS ---');
    console.log('Manual Clean Sheet:', cleanSheetCount + '/' + result.homeStats.totalMatches + ' = ' + calculatedCleanSheetPercentage + '%');
    console.log('API Clean Sheet:', result.homeStats.cleanSheetCount + '/' + result.homeStats.totalMatches + ' = ' + result.homeStats.cleanSheetPercentage + '%');
    console.log('Manual Failed to Score:', failedToScoreCount + '/' + result.homeStats.totalMatches + ' = ' + calculatedFailedToScorePercentage + '%');
    console.log('API Failed to Score:', result.homeStats.failedToScoreCount + '/' + result.homeStats.totalMatches + ' = ' + result.homeStats.failedToScorePercentage + '%');
    console.log('Manual Avg Goals:', totalGoals + '/' + result.homeStats.totalMatches + ' = ' + calculatedAvgGoals);
    console.log('API Avg Goals (combined):', result.combinedStats.averageHomeTeamGoals);
    
    console.log('\n=== JUVENTUDE (AWAY) ANALYSIS ===');
    console.log('Total matches:', result.awayStats.totalMatches);
    console.log('Recent form length:', result.awayStats.recentForm.length);
    
    cleanSheetCount = 0;
    failedToScoreCount = 0;
    totalGoals = 0;
    
    console.log('\nMatch-by-match analysis:');
    result.awayStats.recentForm.forEach((match, index) => {
      const cleanSheet = match.goalsConceded === 0;
      const failedToScore = match.goalsScored === 0;
      
      if (cleanSheet) cleanSheetCount++;
      if (failedToScore) failedToScoreCount++;
      totalGoals += match.goalsScored;
      
      console.log(`${index + 1}. ${match.opponent} - Scored: ${match.goalsScored}, Conceded: ${match.goalsConceded}, CS: ${cleanSheet}, FTS: ${failedToScore}`);
    });
    
    const calculatedCleanSheetPercentageAway = Math.round((cleanSheetCount / result.awayStats.totalMatches) * 100);
    const calculatedFailedToScorePercentageAway = Math.round((failedToScoreCount / result.awayStats.totalMatches) * 100);
    const calculatedAvgGoalsAway = Math.round((totalGoals / result.awayStats.totalMatches) * 100) / 100;
    
    console.log('\n--- JUVENTUDE CALCULATIONS ---');
    console.log('Manual Clean Sheet:', cleanSheetCount + '/' + result.awayStats.totalMatches + ' = ' + calculatedCleanSheetPercentageAway + '%');
    console.log('API Clean Sheet:', result.awayStats.cleanSheetCount + '/' + result.awayStats.totalMatches + ' = ' + result.awayStats.cleanSheetPercentage + '%');
    console.log('Manual Failed to Score:', failedToScoreCount + '/' + result.awayStats.totalMatches + ' = ' + calculatedFailedToScorePercentageAway + '%');
    console.log('API Failed to Score:', result.awayStats.failedToScoreCount + '/' + result.awayStats.totalMatches + ' = ' + result.awayStats.failedToScorePercentage + '%');
    console.log('Manual Avg Goals:', totalGoals + '/' + result.awayStats.totalMatches + ' = ' + calculatedAvgGoalsAway);
    console.log('API Avg Goals (combined):', result.combinedStats.averageAwayTeamGoals);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugBTTS10Matches();
