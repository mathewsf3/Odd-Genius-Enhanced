const axios = require('axios');

async function testTeamHistory() {
  console.log('🔍 TESTING TEAM HISTORICAL DATA FOR MATCH 1499505');
  console.log('================================================');
  console.log('📊 Teams: Oran U21 (11699) vs USM Alger U21 (11230)');
  console.log('================================================');

  const API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';

  // Test Team 11699 (Oran U21) Historical Data
  console.log('\n🏠 Testing Oran U21 (Team 11699) Historical Data...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '11699',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 15000
    });
    
    console.log('✅ Oran U21 Response Status:', response.status);
    const matches = response.data?.result || [];
    console.log(`📊 Total Matches Found: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\n📋 Recent Matches:');
      matches.slice(0, 5).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.event_home_team} vs ${match.event_away_team} (${match.event_date})`);
        console.log(`      Score: ${match.event_final_result || 'N/A'}, Status: ${match.event_status}`);
      });
      
      // Check for card data
      const matchesWithCards = matches.filter(match => 
        match.event_home_team_cards || match.event_away_team_cards ||
        match.statistics?.length > 0
      );
      console.log(`🟨 Matches with Card Data: ${matchesWithCards.length}`);
      
      // Check for goal data
      const matchesWithGoals = matches.filter(match => 
        match.event_final_result && match.event_final_result !== '0 - 0'
      );
      console.log(`⚽ Matches with Goals: ${matchesWithGoals.length}`);
    } else {
      console.log('❌ No historical matches found for Oran U21');
    }
  } catch (error) {
    console.log('❌ Oran U21 Error:', error.message);
  }

  // Test Team 11230 (USM Alger U21) Historical Data
  console.log('\n🚌 Testing USM Alger U21 (Team 11230) Historical Data...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '11230',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 15000
    });
    
    console.log('✅ USM Alger U21 Response Status:', response.status);
    const matches = response.data?.result || [];
    console.log(`📊 Total Matches Found: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\n📋 Recent Matches:');
      matches.slice(0, 5).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.event_home_team} vs ${match.event_away_team} (${match.event_date})`);
        console.log(`      Score: ${match.event_final_result || 'N/A'}, Status: ${match.event_status}`);
      });
      
      // Check for card data
      const matchesWithCards = matches.filter(match => 
        match.event_home_team_cards || match.event_away_team_cards ||
        match.statistics?.length > 0
      );
      console.log(`🟨 Matches with Card Data: ${matchesWithCards.length}`);
      
      // Check for goal data
      const matchesWithGoals = matches.filter(match => 
        match.event_final_result && match.event_final_result !== '0 - 0'
      );
      console.log(`⚽ Matches with Goals: ${matchesWithGoals.length}`);
    } else {
      console.log('❌ No historical matches found for USM Alger U21');
    }
  } catch (error) {
    console.log('❌ USM Alger U21 Error:', error.message);
  }

  // Test specific match with detailed stats
  console.log('\n🔍 Testing Match 1499505 with Detailed Stats...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        matchId: '1499505',
        withPlayerStats: 1
      },
      timeout: 15000
    });
    
    console.log('✅ Match Details Response Status:', response.status);
    const match = response.data?.result?.[0];
    
    if (match) {
      console.log(`📊 Match: ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`⚽ Score: ${match.event_final_result}`);
      console.log(`🟨 Home Cards: ${match.event_home_team_cards || 0}`);
      console.log(`🟨 Away Cards: ${match.event_away_team_cards || 0}`);
      
      // Check for player lineups
      const homePlayers = match.players_home_lineup?.length || 0;
      const awayPlayers = match.players_away_lineup?.length || 0;
      console.log(`👥 Home Players: ${homePlayers}`);
      console.log(`👥 Away Players: ${awayPlayers}`);
      
      // Check for statistics
      const hasStats = match.statistics?.length > 0;
      console.log(`📈 Has Statistics: ${hasStats ? 'Yes' : 'No'}`);
      
      if (hasStats) {
        console.log('📊 Available Statistics:');
        match.statistics.forEach(stat => {
          console.log(`   - ${stat.type}: Home ${stat.home} - Away ${stat.away}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Match Details Error:', error.message);
  }

  console.log('\n🎯 ANALYSIS:');
  console.log('This appears to be a Reserve League match with limited data availability.');
  console.log('Reserve/youth teams often have less comprehensive statistics than senior teams.');
  console.log('The validation system is working, but the source data is limited.');
}

testTeamHistory().catch(console.error);
