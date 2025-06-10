const axios = require('axios');

// Simple debug script to check if corner data exists anywhere
async function quickCornerCheck() {
  console.log('🔍 Quick Corner Data Check...\n');

  try {
    const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
    
    // Check a known live match that should have more data
    console.log('1. Checking live matches for corner data...');
    const liveResponse = await axios.get(`https://apiv2.allsportsapi.com/football/`, {
      params: {
        met: 'Livescore',
        APIkey: API_KEY
      },
      timeout: 10000
    });

    console.log(`Live matches found: ${liveResponse.data.result?.length || 0}`);
    
    if (liveResponse.data.result && liveResponse.data.result.length > 0) {
      const liveMatch = liveResponse.data.result[0];
      console.log(`Sample live match: ${liveMatch.event_home_team} vs ${liveMatch.event_away_team}`);
      
      // Check for corner data in live match
      if (liveMatch.statistics) {
        console.log(`Live match statistics: ${liveMatch.statistics.map(s => s.type).join(', ')}`);
        
        const cornerStat = liveMatch.statistics.find(s => 
          s.type.toLowerCase().includes('corner')
        );
        
        if (cornerStat) {
          console.log(`✅ FOUND CORNER DATA in live match: ${cornerStat.type} - ${cornerStat.home}-${cornerStat.away}`);
        } else {
          console.log(`❌ No corner data in live match statistics`);
        }
      }
      
      // Check for direct corner fields
      const cornerFields = Object.keys(liveMatch).filter(k => 
        k.toLowerCase().includes('corner')
      );
      
      if (cornerFields.length > 0) {
        console.log(`Live match corner fields: ${cornerFields.join(', ')}`);
        cornerFields.forEach(field => {
          console.log(`  ${field}: ${liveMatch[field]}`);
        });
      }
    }

    // Check if there's a specific match with corner data
    console.log('\n2. Checking specific match for corner data...');
    const specificResponse = await axios.get(`https://apiv2.allsportsapi.com/football/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        matchId: '1569761' // The live match ID we were testing
      },
      timeout: 10000
    });

    console.log(`Specific match result: ${specificResponse.data.result?.length || 0} matches`);
    
    if (specificResponse.data.result && specificResponse.data.result.length > 0) {
      const specificMatch = specificResponse.data.result[0];
      console.log(`Match: ${specificMatch.event_home_team} vs ${specificMatch.event_away_team}`);
      console.log(`Status: ${specificMatch.event_status}`);
      
      if (specificMatch.statistics) {
        console.log(`Statistics: ${specificMatch.statistics.map(s => `${s.type}: ${s.home}-${s.away}`).join(', ')}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.message);
  }
}

quickCornerCheck().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});
