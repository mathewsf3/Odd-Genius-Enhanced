const axios = require('axios');

async function simpleBTTSTest() {
  try {
    console.log('🎯 Simple BTTS Test for Match 1544012');
    console.log('====================================');
    
    const response = await axios.get('http://localhost:5000/api/matches/1544012/btts?matches=10', {
      timeout: 15000
    });
    
    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success) {
      const result = response.data.result;
      console.log('\n📊 BTTS Results:');
      console.log(`Home: ${result.homeStats.teamName}`);
      console.log(`Away: ${result.awayStats.teamName}`);
      console.log(`Combined Average Goals: ${result.combinedStats.averageTotalGoals}`);
      console.log(`Home Clean Sheets: ${result.combinedStats.homeTeamCleanSheetProbability}%`);
      console.log(`Away Clean Sheets: ${result.combinedStats.awayTeamCleanSheetProbability}%`);
      console.log(`Home Failed to Score: ${result.combinedStats.homeTeamFailToScoreProbability}%`);
      console.log(`Away Failed to Score: ${result.combinedStats.awayTeamFailToScoreProbability}%`);
    } else {
      console.log('❌ API returned error:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

simpleBTTSTest();
