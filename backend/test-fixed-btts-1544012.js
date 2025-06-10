const axios = require('axios');

async function testFixedBTTS() {
  try {
    console.log('🎯 Testing FIXED BTTS Endpoint with Match 1544012');
    console.log('================================================');
    console.log('Expected: Bragantino (team-2015) vs Juventude (team-1737)');
    
    // Test the backend BTTS endpoint directly
    console.log('\n📊 Testing Backend BTTS Endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/matches/1544012/btts', {
      params: {
        matches: 10
      },
      timeout: 30000
    });
    
    if (response.data && response.data.success) {
      const result = response.data.result;
      
      console.log('✅ BTTS Endpoint Success!');
      console.log(`Home Team: ${result.homeStats.teamName}`);
      console.log(`Away Team: ${result.awayStats.teamName}`);
      
      console.log('\n=== BTTS STATISTICS RESULTS ===');
      console.log('HOME TEAM (Bragantino):');
      console.log(`- BTTS: ${result.homeStats.bttsYesPercentage}%`);
      console.log(`- Clean Sheets: ${result.homeStats.cleanSheetPercentage}%`);
      console.log(`- Failed to Score: ${result.homeStats.failedToScorePercentage}%`);
      console.log(`- Total Matches: ${result.homeStats.totalMatches}`);
      
      console.log('\nAWAY TEAM (Juventude):');
      console.log(`- BTTS: ${result.awayStats.bttsYesPercentage}%`);
      console.log(`- Clean Sheets: ${result.awayStats.cleanSheetPercentage}%`);
      console.log(`- Failed to Score: ${result.awayStats.failedToScorePercentage}%`);
      console.log(`- Total Matches: ${result.awayStats.totalMatches}`);
      
      console.log('\nCOMBINED STATISTICS:');
      console.log(`- BTTS Prediction: ${result.combinedStats.prediction}`);
      console.log(`- BTTS Probability: ${result.combinedStats.bttsYesProbability}%`);
      console.log(`- Confidence: ${result.combinedStats.confidenceLevel}`);
      console.log(`- Home Team Average Goals: ${result.combinedStats.averageHomeTeamGoals}`);
      console.log(`- Away Team Average Goals: ${result.combinedStats.averageAwayTeamGoals}`);
      console.log(`- Combined Average Goals: ${result.combinedStats.averageTotalGoals}`);
      console.log(`- Home Team Clean Sheets (Combined): ${result.combinedStats.homeTeamCleanSheetProbability}%`);
      console.log(`- Away Team Clean Sheets (Combined): ${result.combinedStats.awayTeamCleanSheetProbability}%`);
      console.log(`- Home Team Failed to Score (Combined): ${result.combinedStats.homeTeamFailToScoreProbability}%`);
      console.log(`- Away Team Failed to Score (Combined): ${result.combinedStats.awayTeamFailToScoreProbability}%`);
      
      console.log('\n=== COMPARISON WITH EXPECTED VALUES ===');
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
      
      // Check for exact matches
      const exactMatches = [];
      const discrepancies = [];
      
      if (result.combinedStats.homeTeamCleanSheetProbability === 40) {
        exactMatches.push('✅ Bragantino Clean Sheets: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Bragantino Clean Sheets: Expected 40%, Got ${result.combinedStats.homeTeamCleanSheetProbability}%`);
      }
      
      if (result.combinedStats.homeTeamFailToScoreProbability === 30) {
        exactMatches.push('✅ Bragantino Failed to Score: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Bragantino Failed to Score: Expected 30%, Got ${result.combinedStats.homeTeamFailToScoreProbability}%`);
      }
      
      if (result.combinedStats.averageHomeTeamGoals === 1.5) {
        exactMatches.push('✅ Bragantino Average Goals: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Bragantino Average Goals: Expected 1.5, Got ${result.combinedStats.averageHomeTeamGoals}`);
      }
      
      if (result.combinedStats.awayTeamFailToScoreProbability === 60) {
        exactMatches.push('✅ Juventude Failed to Score: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Juventude Failed to Score: Expected 60%, Got ${result.combinedStats.awayTeamFailToScoreProbability}%`);
      }
      
      if (result.combinedStats.averageAwayTeamGoals === 0.5) {
        exactMatches.push('✅ Juventude Average Goals: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Juventude Average Goals: Expected 0.5, Got ${result.combinedStats.averageAwayTeamGoals}`);
      }
      
      if (result.combinedStats.averageTotalGoals === 2.0) {
        exactMatches.push('✅ Combined Average: PERFECT MATCH!');
      } else {
        discrepancies.push(`❌ Combined Average: Expected 2.0, Got ${result.combinedStats.averageTotalGoals}`);
      }
      
      console.log('\n=== ACCURACY ASSESSMENT ===');
      if (exactMatches.length > 0) {
        console.log('PERFECT MATCHES:');
        exactMatches.forEach(match => console.log(match));
      }
      
      if (discrepancies.length > 0) {
        console.log('\nREMAINING DISCREPANCIES:');
        discrepancies.forEach(disc => console.log(disc));
      }
      
      if (discrepancies.length === 0) {
        console.log('\n🎉 PERFECT! All BTTS calculations now match your expected values!');
        console.log('The slice-of-5 bug has been completely fixed!');
      } else {
        console.log(`\n⚠️  ${discrepancies.length} discrepancies remain. These could be due to:`);
        console.log('   1. Different date ranges between API and official records');
        console.log('   2. Missing matches in API data');
        console.log('   3. Score extraction issues for specific matches');
      }
      
    } else {
      console.log('❌ BTTS Endpoint Failed');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing BTTS endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFixedBTTS();
