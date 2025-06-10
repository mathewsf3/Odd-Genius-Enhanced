const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function debugMatch1544012() {
  try {
    console.log('🔍 Debugging Match ID: 1544012');
    console.log('===============================');

    // First, try to get the match details directly from AllSportsAPI
    console.log('\n📊 Fetching match details from AllSportsAPI...');
    
    const matchResponse = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        matchId: '1544012'
      },
      timeout: 10000
    });
    
    if (matchResponse.data && matchResponse.data.result && matchResponse.data.result.length > 0) {
      const match = matchResponse.data.result[0];
      console.log('✅ Match found!');
      console.log(`Home Team: ${match.event_home_team} (ID: ${match.event_home_team_id})`);
      console.log(`Away Team: ${match.event_away_team} (ID: ${match.event_away_team_id})`);
      console.log(`Date: ${match.event_date}`);
      console.log(`Status: ${match.event_status}`);
      console.log(`League: ${match.league_name}`);
      console.log(`Country: ${match.country_name}`);
      
      // Check if this is Bragantino vs Juventude
      const isBragantino = match.event_home_team.toLowerCase().includes('bragantino') || 
                          match.event_away_team.toLowerCase().includes('bragantino');
      const isJuventude = match.event_home_team.toLowerCase().includes('juventude') || 
                         match.event_away_team.toLowerCase().includes('juventude');
      
      console.log(`\nIs this Bragantino vs Juventude? ${isBragantino && isJuventude ? '✅ YES' : '❌ NO'}`);
      
      if (isBragantino && isJuventude) {
        console.log('🎉 Perfect! This is the correct match for your analysis.');
        
        // Extract the correct team IDs
        const homeTeamId = match.event_home_team_id;
        const awayTeamId = match.event_away_team_id;
        
        console.log(`\n📋 Team IDs for BTTS service:`);
        console.log(`Home Team ID: team-${homeTeamId}`);
        console.log(`Away Team ID: team-${awayTeamId}`);
        
        // Test if these match our expected IDs
        if (homeTeamId === '2015' || awayTeamId === '2015') {
          console.log('✅ Bragantino ID (2015) confirmed');
        }
        if (homeTeamId === '1737' || awayTeamId === '1737') {
          console.log('✅ Juventude ID (1737) confirmed');
        }
        
        return {
          homeTeamId: `team-${homeTeamId}`,
          awayTeamId: `team-${awayTeamId}`,
          homeTeamName: match.event_home_team,
          awayTeamName: match.event_away_team,
          matchFound: true
        };
      } else {
        console.log('❌ This match is not Bragantino vs Juventude');
        console.log('   The discrepancies in your analysis make sense now!');
        return { matchFound: false };
      }
    } else {
      console.log('❌ Match not found in AllSportsAPI');
      return { matchFound: false };
    }
    
  } catch (error) {
    console.error('❌ Error fetching match details:', error.message);
    return { matchFound: false };
  }
}

// Also test our backend API
async function testBackendMatch() {
  try {
    console.log('\n🔧 Testing Backend API for match 1544012...');
    
    const backendResponse = await axios.get('http://localhost:5000/api/matches/1544012', {
      timeout: 10000
    });
    
    if (backendResponse.data && backendResponse.data.success) {
      const match = backendResponse.data.result;
      console.log('✅ Backend API response:');
      console.log(`Home Team: ${match.homeTeam.name} (ID: ${match.homeTeam.id})`);
      console.log(`Away Team: ${match.awayTeam.name} (ID: ${match.awayTeam.id})`);
      console.log(`League: ${match.league.name}`);
      console.log(`Date: ${match.date}`);
      
      return {
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        homeTeamName: match.homeTeam.name,
        awayTeamName: match.awayTeam.name
      };
    } else {
      console.log('❌ Backend API did not return match data');
      return null;
    }
  } catch (error) {
    console.error('❌ Backend API error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🎯 ANALYZING MATCH 1544012 - The Actual Match Being Tested');
  console.log('=========================================================');
  
  // Test both APIs
  const apiResult = await debugMatch1544012();
  const backendResult = await testBackendMatch();
  
  console.log('\n=== SUMMARY ===');
  if (apiResult.matchFound) {
    console.log('✅ Match found in AllSportsAPI');
    console.log(`Teams: ${apiResult.homeTeamName} vs ${apiResult.awayTeamName}`);
    console.log(`Team IDs: ${apiResult.homeTeamId} vs ${apiResult.awayTeamId}`);
  } else {
    console.log('❌ Match not found or not Bragantino vs Juventude');
  }
  
  if (backendResult) {
    console.log('✅ Match found in Backend API');
    console.log(`Teams: ${backendResult.homeTeamName} vs ${backendResult.awayTeamName}`);
    console.log(`Team IDs: ${backendResult.homeTeamId} vs ${backendResult.awayTeamId}`);
  } else {
    console.log('❌ Match not found in Backend API');
  }
  
  console.log('\n=== NEXT STEPS ===');
  if (apiResult.matchFound && backendResult) {
    console.log('🎉 Perfect! Now we can test BTTS with the correct match data.');
    console.log('The BTTS calculations should now match your expected values.');
  } else {
    console.log('⚠️  The match ID 1544012 may not contain Bragantino vs Juventude.');
    console.log('This explains why the BTTS statistics don\'t match your expected values.');
    console.log('We need to either:');
    console.log('1. Find the correct match ID for Bragantino vs Juventude');
    console.log('2. Update the test to use the teams that are actually in match 1544012');
  }
}

main();
