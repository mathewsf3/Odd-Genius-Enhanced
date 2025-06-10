const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function debugBTTSService() {
  try {
    console.log('=== DEBUGGING BTTS SERVICE WITH FIXES ===');

    // Step 1: Test team match fetching
    console.log('\n1. Testing team match fetching for team 2015 (Bragantino)...');

    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    console.log(`Date range: ${fromDate} to ${toDate}`);

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

    console.log(`API returned ${response.data.result.length} total matches`);

    // Step 2: Filter matches
    const today = new Date();
    const finishedMatches = response.data.result.filter(match => {
      const isFinished = ['Finished', 'FT', 'AET', 'FT_PEN'].includes(match.event_status);
      const matchDate = new Date(match.event_date);
      const isInPast = matchDate <= today;
      return isFinished && isInPast;
    });

    console.log(`Filtered to ${finishedMatches.length} finished matches`);

    // Step 3: Normalize matches with new score extraction
    const normalizedMatches = finishedMatches.slice(0, 5).map(match => {
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
        match_id: match.event_key,
        match_date: match.event_date,
        match_hometeam_id: match.home_team_key,
        match_awayteam_id: match.away_team_key,
        match_hometeam_name: match.event_home_team,
        match_awayteam_name: match.event_away_team,
        match_hometeam_score: homeScore,
        match_awayteam_score: awayScore,
        match_status: match.event_status,
        raw_event_final_result: match.event_final_result,
        raw_event_ft_result: match.event_ft_result
      };
    });

    console.log(`Normalized ${normalizedMatches.length} matches`);
    console.log('Sample normalized match:', normalizedMatches[0]);

    // Step 4: Test team processing
    console.log('\n2. Testing team processing...');

    const teamId = 'team-2015';
    const cleanTeamId = teamId.toString().replace(/^team-/, '');
    console.log(`Team ID: ${teamId}, Clean Team ID: ${cleanTeamId}`);

    let processedMatches = 0;
    let bttsYesCount = 0;

    for (const match of normalizedMatches) {
      const homeTeamIdStr = String(match.match_hometeam_id);
      const awayTeamIdStr = String(match.match_awayteam_id);
      const cleanTeamIdStr = String(cleanTeamId);

      const isHome = homeTeamIdStr === cleanTeamIdStr;
      const isAway = awayTeamIdStr === cleanTeamIdStr;

      console.log(`Match: ${match.match_hometeam_name} (${homeTeamIdStr}) vs ${match.match_awayteam_name} (${awayTeamIdStr})`);
      console.log(`  Raw scores: event_final_result="${match.raw_event_final_result}", event_ft_result="${match.raw_event_ft_result}"`);
      console.log(`  Parsed scores: ${match.match_hometeam_score}-${match.match_awayteam_score}`);
      console.log(`  Comparing with team ${cleanTeamIdStr}: isHome=${isHome}, isAway=${isAway}`);

      if (isHome || isAway) {
        processedMatches++;
        const homeScore = match.match_hometeam_score;
        const awayScore = match.match_awayteam_score;
        const btts = homeScore > 0 && awayScore > 0;

        console.log(`  BTTS calculation: ${homeScore} > 0 && ${awayScore} > 0 = ${btts}`);

        if (btts) bttsYesCount++;
      }
    }

    console.log(`\nProcessed ${processedMatches} matches for team ${teamId}`);
    console.log(`BTTS Yes: ${bttsYesCount}/${processedMatches} (${processedMatches > 0 ? (bttsYesCount/processedMatches*100).toFixed(1) : 0}%)`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugBTTSService();
