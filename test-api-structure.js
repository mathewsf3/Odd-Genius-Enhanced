const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testFootyStatsAPI() {
  try {
    console.log('🔍 Testing FootyStats Team API Structure...\n');
    
    const data = await makeRequest('http://localhost:5000/api/footystats/team/1499505?include_stats=true');
    
    console.log('📋 Response Structure Check:');
    console.log('✅ Response received successfully');
    console.log('data.success:', data.success);
    
    if (data.data) {
      console.log('data.data.success:', data.data.success);
      console.log('data.data.data exists:', !!data.data.data);
      console.log('data.data.data is array:', Array.isArray(data.data.data));
      
      if (data.data.data && data.data.data[0]) {
        console.log('data.data.data[0] exists:', !!data.data.data[0]);
        console.log('data.data.data[0].stats exists:', !!data.data.data[0].stats);
        
        if (data.data.data[0].stats) {
          const stats = data.data.data[0].stats;
          console.log('\n🏆 Available Stats Keys (first 15):');
          console.log(Object.keys(stats).slice(0, 15));
          
          console.log('\n📈 Sample Key Stats:');
          console.log('seasonScoredAVG_overall:', stats.seasonScoredAVG_overall);
          console.log('seasonConcededAVG_overall:', stats.seasonConcededAVG_overall);
          console.log('seasonMatchesPlayed_overall:', stats.seasonMatchesPlayed_overall);
          console.log('seasonGoalsFor_overall:', stats.seasonGoalsFor_overall);
          console.log('seasonGoalsAgainst_overall:', stats.seasonGoalsAgainst_overall);
          console.log('seasonWins_overall:', stats.seasonWins_overall);
          console.log('seasonDraws_overall:', stats.seasonDraws_overall);
          console.log('seasonLosses_overall:', stats.seasonLosses_overall);
          
          console.log('\n🔍 Data Validation:');
          console.log('All required fields present:', !!(
            stats.seasonScoredAVG_overall !== undefined &&
            stats.seasonConcededAVG_overall !== undefined &&
            stats.seasonMatchesPlayed_overall !== undefined &&
            stats.seasonGoalsFor_overall !== undefined
          ));
        }
      }
    }
    
    console.log('\n✅ API structure test completed');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testFootyStatsAPI();
