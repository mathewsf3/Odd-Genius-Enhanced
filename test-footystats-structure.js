const https = require('https');

async function testFootyStatsAPI() {
  try {
    console.log('🔍 Testing FootyStats Team API Structure...\n');
    
    const response = await fetch('http://localhost:5000/api/footystats/team/1499505?include_stats=true');
    const data = await response.json();
    
    console.log('📋 Full Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📊 Data Navigation:');
    console.log('data.success:', data.success);
    console.log('data.data:', !!data.data);
    console.log('data.data.success:', data.data?.success);
    console.log('data.data.data:', !!data.data?.data);
    console.log('data.data.data[0]:', !!data.data?.data?.[0]);
    console.log('data.data.data[0].stats:', !!data.data?.data?.[0]?.stats);
    
    if (data.data?.data?.[0]?.stats) {
      const stats = data.data.data[0].stats;
      console.log('\n🏆 Available Stats Keys:');
      console.log(Object.keys(stats).slice(0, 10)); // Show first 10 keys
      
      console.log('\n📈 Sample Stats:');
      console.log('seasonScoredAVG_overall:', stats.seasonScoredAVG_overall);
      console.log('seasonConcededAVG_overall:', stats.seasonConcededAVG_overall);
      console.log('seasonMatchesPlayed_overall:', stats.seasonMatchesPlayed_overall);
      console.log('seasonGoalsFor_overall:', stats.seasonGoalsFor_overall);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testFootyStatsAPI();
