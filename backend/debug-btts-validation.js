const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function validateBTTSData() {
  try {
    console.log('🔍 VALIDATING BTTS DATA AGAINST EXPECTED VALUES');
    console.log('Expected values based on ESPN/Soccerway verification:');
    console.log('- Bragantino Clean Sheets: 4/10 = 40%');
    console.log('- Bragantino Failed to Score: 3/10 = 30%');
    console.log('- Juventude Failed to Score: 6/10 = 60%');
    console.log('- Juventude Avg Goals: 5g/10 = 0.5');
    console.log('- Combined Avg: 2.0');
    
    // Test both teams
    const teams = [
      { id: '2015', name: 'Bragantino', expectedCS: 4, expectedFTS: 3, expectedGoals: 15 },
      { id: '1737', name: 'Juventude', expectedCS: 1, expectedFTS: 6, expectedGoals: 5 }
    ];
    
    for (const team of teams) {
      console.log(`\n=== ${team.name.toUpperCase()} (${team.id}) VALIDATION ===`);
      
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      const response = await axios.get(`${BASE_URL}/`, {
        params: {
          met: 'Fixtures',
          APIkey: API_KEY,
          teamId: team.id,
          from: fromDate,
          to: toDate
        },
        timeout: 8000
      });
      
      const today = new Date();
      const finishedMatches = response.data.result.filter(match => {
        const isFinished = ['Finished', 'FT', 'AET', 'FT_PEN'].includes(match.event_status);
        const matchDate = new Date(match.event_date);
        const isInPast = matchDate <= today;
        return isFinished && isInPast;
      });
      
      const last10Matches = finishedMatches
        .map(match => {
          const homeScore = 
            Number(match.match_hometeam_score) ||
            Number(match.event_home_final_result) ||
            (match.event_final_result ? Number(match.event_final_result.split(' - ')[0]) : 0) ||
            (match.event_ft_result ? Number(match.event_ft_result.split(' - ')[0]) : 0) || 0;
          
          const awayScore =
            Number(match.match_awayteam_score) ||
            Number(match.event_away_final_result) ||
            (match.event_final_result ? Number(match.event_final_result.split(' - ')[1]) : 0) ||
            (match.event_ft_result ? Number(match.event_ft_result.split(' - ')[1]) : 0) || 0;
          
          return {
            date: match.event_date,
            homeTeam: match.event_home_team,
            awayTeam: match.event_away_team,
            homeTeamId: match.home_team_key,
            awayTeamId: match.away_team_key,
            homeScore,
            awayScore,
            rawResult: match.event_final_result || match.event_ft_result,
            rawHomeScore: match.match_hometeam_score,
            rawAwayScore: match.match_awayteam_score,
            rawEventHome: match.event_home_final_result,
            rawEventAway: match.event_away_final_result,
            rawEventFT: match.event_ft_result
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      
      console.log(`Last 10 matches for ${team.name}:`);
      
      let cleanSheetCount = 0;
      let failedToScoreCount = 0;
      let totalGoals = 0;
      
      last10Matches.forEach((match, index) => {
        const isTeamHome = match.homeTeamId == team.id;
        const teamScore = isTeamHome ? match.homeScore : match.awayScore;
        const oppScore = isTeamHome ? match.awayScore : match.homeScore;
        const opponent = isTeamHome ? match.awayTeam : match.homeTeam;
        const venue = isTeamHome ? 'H' : 'A';
        
        const cleanSheet = oppScore === 0;
        const failedToScore = teamScore === 0;
        
        if (cleanSheet) cleanSheetCount++;
        if (failedToScore) failedToScoreCount++;
        totalGoals += teamScore;
        
        console.log(`${index + 1}. ${match.date} (${venue}) vs ${opponent}: ${teamScore}-${oppScore}`);
        console.log(`   Raw: ${match.rawResult} | Home: ${match.rawHomeScore} | Away: ${match.rawAwayScore}`);
        console.log(`   Event Home: ${match.rawEventHome} | Event Away: ${match.rawEventAway} | Event FT: ${match.rawEventFT}`);
        console.log(`   CS: ${cleanSheet}, FTS: ${failedToScore}`);
        console.log('');
      });
      
      console.log(`--- ${team.name.toUpperCase()} RESULTS ---`);
      console.log(`Clean Sheets: ${cleanSheetCount}/10 = ${(cleanSheetCount/10*100)}% (Expected: ${team.expectedCS}/10 = ${(team.expectedCS/10*100)}%)`);
      console.log(`Failed to Score: ${failedToScoreCount}/10 = ${(failedToScoreCount/10*100)}% (Expected: ${team.expectedFTS}/10 = ${(team.expectedFTS/10*100)}%)`);
      console.log(`Total Goals: ${totalGoals}/10 = ${(totalGoals/10)} (Expected: ${team.expectedGoals}/10 = ${(team.expectedGoals/10)})`);
      
      // Check for discrepancies
      if (cleanSheetCount !== team.expectedCS) {
        console.log(`❌ CLEAN SHEET MISMATCH: Got ${cleanSheetCount}, expected ${team.expectedCS}`);
      }
      if (failedToScoreCount !== team.expectedFTS) {
        console.log(`❌ FAILED TO SCORE MISMATCH: Got ${failedToScoreCount}, expected ${team.expectedFTS}`);
      }
      if (totalGoals !== team.expectedGoals) {
        console.log(`❌ TOTAL GOALS MISMATCH: Got ${totalGoals}, expected ${team.expectedGoals}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

validateBTTSData();
