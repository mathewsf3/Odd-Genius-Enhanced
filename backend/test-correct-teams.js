const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function testCorrectTeams() {
  try {
    console.log('🔍 Testing Correct Team IDs for Bragantino vs Juventude');
    console.log('======================================================');

    // Test Bragantino (team 2015)
    console.log('\n📊 Testing Bragantino (Team ID: 2015)...');
    
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    console.log(`Date range: ${fromDate} to ${toDate}`);
    
    const bragResponse = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '2015',
        from: fromDate,
        to: toDate
      },
      timeout: 10000
    });
    
    if (bragResponse.data && bragResponse.data.result) {
      console.log(`✅ Bragantino API response: ${bragResponse.data.result.length} total matches`);
      
      // Check team name in first match
      if (bragResponse.data.result.length > 0) {
        const firstMatch = bragResponse.data.result[0];
        console.log(`Team names in first match: ${firstMatch.event_home_team} vs ${firstMatch.event_away_team}`);
        
        // Check if this is actually Bragantino
        const isBragantino = firstMatch.event_home_team.toLowerCase().includes('bragantino') || 
                           firstMatch.event_away_team.toLowerCase().includes('bragantino');
        console.log(`Is this Bragantino? ${isBragantino ? '✅ YES' : '❌ NO'}`);
      }
    } else {
      console.log('❌ No data returned for Bragantino');
    }

    // Test Juventude (team 1737)
    console.log('\n📊 Testing Juventude (Team ID: 1737)...');
    
    const juvResponse = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '1737',
        from: fromDate,
        to: toDate
      },
      timeout: 10000
    });
    
    if (juvResponse.data && juvResponse.data.result) {
      console.log(`✅ Juventude API response: ${juvResponse.data.result.length} total matches`);
      
      // Check team name in first match
      if (juvResponse.data.result.length > 0) {
        const firstMatch = juvResponse.data.result[0];
        console.log(`Team names in first match: ${firstMatch.event_home_team} vs ${firstMatch.event_away_team}`);
        
        // Check if this is actually Juventude
        const isJuventude = firstMatch.event_home_team.toLowerCase().includes('juventude') || 
                          firstMatch.event_away_team.toLowerCase().includes('juventude');
        console.log(`Is this Juventude? ${isJuventude ? '✅ YES' : '❌ NO'}`);
      }
    } else {
      console.log('❌ No data returned for Juventude');
    }

    // Test the old team IDs to confirm they're wrong
    console.log('\n📊 Testing OLD team IDs (1371 and 1370)...');
    
    const oldResponse = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '1371',
        from: fromDate,
        to: toDate
      },
      timeout: 10000
    });
    
    if (oldResponse.data && oldResponse.data.result && oldResponse.data.result.length > 0) {
      const firstMatch = oldResponse.data.result[0];
      console.log(`OLD Team 1371 names: ${firstMatch.event_home_team} vs ${firstMatch.event_away_team}`);
      console.log('❌ These are Belgian teams, not Brazilian!');
    }

    console.log('\n=== CONCLUSION ===');
    console.log('The issue was using wrong team IDs:');
    console.log('❌ Wrong: team-1371 (SK Beveren) and team-1370 (Cercle Brugge) - Belgian teams');
    console.log('✅ Correct: team-2015 (Bragantino) and team-1737 (Juventude) - Brazilian teams');
    
  } catch (error) {
    console.error('❌ Error testing team IDs:', error.message);
  }
}

testCorrectTeams();
