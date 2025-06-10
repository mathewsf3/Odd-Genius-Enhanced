const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function debugRawMatches() {
  try {
    console.log('🔍 DEBUGGING RAW MATCH DATA FOR DISCREPANCIES');
    
    // Test Bragantino (team 2015)
    console.log('\n=== BRAGANTINO (2015) RAW DATA ===');
    
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    const response = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '2015',
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
          parseInt(match.match_hometeam_score) ||
          parseInt(match.event_home_final_result) ||
          (match.event_final_result ? parseInt(match.event_final_result.split(' - ')[0]) : 0) ||
          (match.event_ft_result ? parseInt(match.event_ft_result.split(' - ')[0]) : 0) || 0;
        
        const awayScore =
          parseInt(match.match_awayteam_score) ||
          parseInt(match.event_away_final_result) ||
          (match.event_final_result ? parseInt(match.event_final_result.split(' - ')[1]) : 0) ||
          (match.event_ft_result ? parseInt(match.event_ft_result.split(' - ')[1]) : 0) || 0;
        
        return {
          date: match.event_date,
          homeTeam: match.event_home_team,
          awayTeam: match.event_away_team,
          homeTeamId: match.home_team_key,
          awayTeamId: match.away_team_key,
          homeScore,
          awayScore,
          rawResult: match.event_final_result || match.event_ft_result
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    console.log('Last 10 matches for Bragantino:');
    
    let cleanSheetCount = 0;
    let failedToScoreCount = 0;
    let totalGoals = 0;
    
    last10Matches.forEach((match, index) => {
      const isBragHome = match.homeTeamId === 2015;
      const bragScore = isBragHome ? match.homeScore : match.awayScore;
      const oppScore = isBragHome ? match.awayScore : match.homeScore;
      const opponent = isBragHome ? match.awayTeam : match.homeTeam;
      const venue = isBragHome ? 'H' : 'A';
      
      const cleanSheet = oppScore === 0;
      const failedToScore = bragScore === 0;
      
      if (cleanSheet) cleanSheetCount++;
      if (failedToScore) failedToScoreCount++;
      totalGoals += bragScore;
      
      console.log(`${index + 1}. ${match.date} (${venue}) vs ${opponent}: ${bragScore}-${oppScore} [Raw: ${match.rawResult}] CS:${cleanSheet} FTS:${failedToScore}`);
    });
    
    console.log('\n--- BRAGANTINO MANUAL CALCULATIONS ---');
    console.log('Clean Sheets:', cleanSheetCount + '/10 = ' + (cleanSheetCount/10*100) + '%');
    console.log('Failed to Score:', failedToScoreCount + '/10 = ' + (failedToScoreCount/10*100) + '%');
    console.log('Total Goals:', totalGoals + '/10 = ' + (totalGoals/10));
    
    // Test Juventude (team 1737)
    console.log('\n=== JUVENTUDE (1737) RAW DATA ===');
    
    const responseJuv = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '1737',
        from: fromDate,
        to: toDate
      },
      timeout: 8000
    });
    
    const finishedMatchesJuv = responseJuv.data.result.filter(match => {
      const isFinished = ['Finished', 'FT', 'AET', 'FT_PEN'].includes(match.event_status);
      const matchDate = new Date(match.event_date);
      const isInPast = matchDate <= today;
      return isFinished && isInPast;
    });
    
    const last10MatchesJuv = finishedMatchesJuv
      .map(match => {
        const homeScore = 
          parseInt(match.match_hometeam_score) ||
          parseInt(match.event_home_final_result) ||
          (match.event_final_result ? parseInt(match.event_final_result.split(' - ')[0]) : 0) ||
          (match.event_ft_result ? parseInt(match.event_ft_result.split(' - ')[0]) : 0) || 0;
        
        const awayScore =
          parseInt(match.match_awayteam_score) ||
          parseInt(match.event_away_final_result) ||
          (match.event_final_result ? parseInt(match.event_final_result.split(' - ')[1]) : 0) ||
          (match.event_ft_result ? parseInt(match.event_ft_result.split(' - ')[1]) : 0) || 0;
        
        return {
          date: match.event_date,
          homeTeam: match.event_home_team,
          awayTeam: match.event_away_team,
          homeTeamId: match.home_team_key,
          awayTeamId: match.away_team_key,
          homeScore,
          awayScore,
          rawResult: match.event_final_result || match.event_ft_result
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    console.log('Last 10 matches for Juventude:');
    
    cleanSheetCount = 0;
    failedToScoreCount = 0;
    totalGoals = 0;
    
    last10MatchesJuv.forEach((match, index) => {
      const isJuvHome = match.homeTeamId === 1737;
      const juvScore = isJuvHome ? match.homeScore : match.awayScore;
      const oppScore = isJuvHome ? match.awayScore : match.homeScore;
      const opponent = isJuvHome ? match.awayTeam : match.homeTeam;
      const venue = isJuvHome ? 'H' : 'A';
      
      const cleanSheet = oppScore === 0;
      const failedToScore = juvScore === 0;
      
      if (cleanSheet) cleanSheetCount++;
      if (failedToScore) failedToScoreCount++;
      totalGoals += juvScore;
      
      console.log(`${index + 1}. ${match.date} (${venue}) vs ${opponent}: ${juvScore}-${oppScore} [Raw: ${match.rawResult}] CS:${cleanSheet} FTS:${failedToScore}`);
    });
    
    console.log('\n--- JUVENTUDE MANUAL CALCULATIONS ---');
    console.log('Clean Sheets:', cleanSheetCount + '/10 = ' + (cleanSheetCount/10*100) + '%');
    console.log('Failed to Score:', failedToScoreCount + '/10 = ' + (failedToScoreCount/10*100) + '%');
    console.log('Total Goals:', totalGoals + '/10 = ' + (totalGoals/10));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugRawMatches();
