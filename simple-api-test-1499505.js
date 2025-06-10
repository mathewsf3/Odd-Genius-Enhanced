const axios = require('axios');

async function testAPIs() {
  console.log('🔍 TESTING API DATA FOR MATCH 1499505');
  console.log('=====================================');

  // Test 1: AllSportsAPI Match Details
  console.log('\n📊 Testing AllSportsAPI Match Details...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0',
        matchId: '1499505'
      },
      timeout: 10000
    });
    
    console.log('✅ AllSportsAPI Response Status:', response.status);
    console.log('📊 Data Available:', !!response.data?.result?.[0]);
    
    if (response.data?.result?.[0]) {
      const match = response.data.result[0];
      console.log(`   📋 Match: ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`   📅 Date: ${match.event_date}`);
      console.log(`   🏆 League: ${match.league_name}`);
      console.log(`   ⚽ Score: ${match.event_final_result || 'N/A'}`);
      console.log(`   🆔 Home Team ID: ${match.event_home_team_id}`);
      console.log(`   🆔 Away Team ID: ${match.event_away_team_id}`);
    } else {
      console.log('❌ No match data found');
      console.log('📄 Raw response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ AllSportsAPI Error:', error.message);
  }

  // Test 2: Our API Match Details
  console.log('\n🏠 Testing Our API Match Details...');
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505', { timeout: 10000 });
    console.log('✅ Our API Response Status:', response.status);
    console.log('📊 Data Available:', !!response.data?.result);
    
    if (response.data?.result) {
      const match = response.data.result;
      console.log(`   📋 Match: ${match.homeTeam?.name} vs ${match.awayTeam?.name}`);
      console.log(`   📅 Date: ${match.date}`);
      console.log(`   🏆 League: ${match.league?.name}`);
      console.log(`   🆔 Home Team ID: ${match.homeTeam?.id}`);
      console.log(`   🆔 Away Team ID: ${match.awayTeam?.id}`);
    } else {
      console.log('❌ No match data found in our API');
    }
  } catch (error) {
    console.log('❌ Our API Error:', error.message);
  }

  // Test 3: Our API Card Statistics
  console.log('\n🟨 Testing Our API Card Statistics...');
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505/cards?matches=5', { timeout: 15000 });
    console.log('✅ Card Stats Response Status:', response.status);
    console.log('📊 Data Available:', !!response.data?.result);
    
    if (response.data?.result) {
      const stats = response.data.result;
      console.log(`   🟨 Home Team Cards: ${stats.homeStats?.totalCards || 0}`);
      console.log(`   🟨 Away Team Cards: ${stats.awayStats?.totalCards || 0}`);
      console.log(`   📈 Expected Cards: ${stats.expectedCards || 0}`);
    }
  } catch (error) {
    console.log('❌ Card Stats Error:', error.message);
  }

  // Test 4: Our API BTTS Statistics
  console.log('\n⚽ Testing Our API BTTS Statistics...');
  try {
    const response = await axios.get('http://localhost:5000/api/matches/1499505/btts?matches=5', { timeout: 15000 });
    console.log('✅ BTTS Stats Response Status:', response.status);
    console.log('📊 Data Available:', !!response.data?.result);
    
    if (response.data?.result) {
      const stats = response.data.result;
      console.log(`   ⚽ Home Team Goals: ${stats.homeStats?.totalGoals || 0}`);
      console.log(`   ⚽ Away Team Goals: ${stats.awayStats?.totalGoals || 0}`);
      console.log(`   📈 BTTS Probability: ${stats.bttsPercentage || 0}%`);
    }
  } catch (error) {
    console.log('❌ BTTS Stats Error:', error.message);
  }

  console.log('\n🎯 SUMMARY:');
  console.log('If AllSportsAPI has no data for this match, that explains why our API shows no data.');
  console.log('The validation system can only improve data quality if there is source data available.');
}

testAPIs().catch(console.error);
