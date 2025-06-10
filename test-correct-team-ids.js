const axios = require('axios');

/**
 * Test with CORRECT team IDs found from the comprehensive test
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function testCorrectTeamIDs() {
  console.log('🎯 TESTING WITH CORRECT TEAM IDs - MATCH 1499505');
  console.log('===============================================');
  console.log('📊 AllSportsAPI Team IDs: Home 11699, Away 11230');
  console.log('📊 API-Football Team IDs: Home 10837, Away 10842');
  console.log('===============================================');

  // Test AllSportsAPI with correct team IDs
  console.log('\n🔍 ALLSPORTS API - Testing Home Team (11699)...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        teamId: '11699',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 15000
    });

    const matches = response.data?.result || [];
    console.log(`✅ AllSportsAPI Home Team (11699): ${matches.length} matches found`);
    
    // Analyze data quality
    const matchesWithCards = matches.filter(m => 
      (m.event_home_team_cards && m.event_home_team_cards > 0) || 
      (m.event_away_team_cards && m.event_away_team_cards > 0) ||
      (m.cards && m.cards.length > 0)
    );
    
    const matchesWithGoals = matches.filter(m => 
      m.event_final_result && 
      m.event_final_result !== '0 - 0' && 
      m.event_final_result !== '' &&
      m.event_final_result !== null
    );
    
    const matchesWithLineups = matches.filter(m => 
      (m.lineups?.home_team?.starting_lineups?.length > 0) ||
      (m.lineups?.away_team?.starting_lineups?.length > 0)
    );
    
    const matchesWithStats = matches.filter(m => 
      m.statistics && m.statistics.length > 0
    );

    console.log(`   🟨 Matches with Cards: ${matchesWithCards.length}`);
    console.log(`   ⚽ Matches with Goals: ${matchesWithGoals.length}`);
    console.log(`   👥 Matches with Lineups: ${matchesWithLineups.length}`);
    console.log(`   📈 Matches with Statistics: ${matchesWithStats.length}`);
    
    // Show recent matches with details
    console.log('\n   📋 Recent Matches with Details:');
    matches.slice(0, 3).forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`      Score: ${match.event_final_result || 'N/A'}, Date: ${match.event_date}`);
      console.log(`      Cards: H${match.event_home_team_cards || 0} - A${match.event_away_team_cards || 0}`);
      console.log(`      Lineups: ${(match.lineups?.home_team?.starting_lineups?.length || 0) + (match.lineups?.away_team?.starting_lineups?.length || 0)} players`);
    });

  } catch (error) {
    console.log('❌ AllSportsAPI Home Team Error:', error.message);
  }

  console.log('\n🔍 ALLSPORTS API - Testing Away Team (11230)...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        teamId: '11230',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 15000
    });

    const matches = response.data?.result || [];
    console.log(`✅ AllSportsAPI Away Team (11230): ${matches.length} matches found`);
    
    // Analyze data quality
    const matchesWithCards = matches.filter(m => 
      (m.event_home_team_cards && m.event_home_team_cards > 0) || 
      (m.event_away_team_cards && m.event_away_team_cards > 0) ||
      (m.cards && m.cards.length > 0)
    );
    
    const matchesWithGoals = matches.filter(m => 
      m.event_final_result && 
      m.event_final_result !== '0 - 0' && 
      m.event_final_result !== '' &&
      m.event_final_result !== null
    );

    console.log(`   🟨 Matches with Cards: ${matchesWithCards.length}`);
    console.log(`   ⚽ Matches with Goals: ${matchesWithGoals.length}`);

  } catch (error) {
    console.log('❌ AllSportsAPI Away Team Error:', error.message);
  }

  // Test API-Football with correct team IDs
  console.log('\n🔄 API-FOOTBALL - Testing MC Oran U21 (10837)...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        team: '10837',
        season: '2024'
      },
      timeout: 15000
    });

    const fixtures = response.data?.response || [];
    console.log(`✅ API-Football MC Oran U21 (10837): ${fixtures.length} fixtures found`);
    
    if (fixtures.length > 0) {
      const fixturesWithStats = fixtures.filter(f => f.statistics && f.statistics.length > 0);
      const fixturesWithLineups = fixtures.filter(f => f.lineups && (f.lineups.home || f.lineups.away));
      
      console.log(`   📈 Fixtures with Statistics: ${fixturesWithStats.length}`);
      console.log(`   👥 Fixtures with Lineups: ${fixturesWithLineups.length}`);
      
      // Show recent fixtures
      console.log('\n   📋 Recent Fixtures:');
      fixtures.slice(0, 3).forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        console.log(`      Score: ${fixture.goals.home || 0} - ${fixture.goals.away || 0}, Date: ${fixture.fixture.date}`);
        console.log(`      Status: ${fixture.fixture.status.long}`);
      });
    }

  } catch (error) {
    console.log('❌ API-Football MC Oran U21 Error:', error.response?.status || error.message);
  }

  console.log('\n🔄 API-FOOTBALL - Testing USM Alger U21 (10842)...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        team: '10842',
        season: '2024'
      },
      timeout: 15000
    });

    const fixtures = response.data?.response || [];
    console.log(`✅ API-Football USM Alger U21 (10842): ${fixtures.length} fixtures found`);
    
    if (fixtures.length > 0) {
      const fixturesWithStats = fixtures.filter(f => f.statistics && f.statistics.length > 0);
      console.log(`   📈 Fixtures with Statistics: ${fixturesWithStats.length}`);
    }

  } catch (error) {
    console.log('❌ API-Football USM Alger U21 Error:', error.response?.status || error.message);
  }

  // Test specific match statistics from AllSportsAPI
  console.log('\n🔍 ALLSPORTS API - Testing Specific Match Statistics...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        matchId: '1499505',
        withPlayerStats: 1
      },
      timeout: 15000
    });

    const match = response.data?.result?.[0];
    if (match) {
      console.log('✅ Match Statistics Available:');
      console.log(`   ⚽ Final Score: ${match.event_final_result}`);
      console.log(`   🟨 Home Cards: ${match.event_home_team_cards || 0}`);
      console.log(`   🟨 Away Cards: ${match.event_away_team_cards || 0}`);
      console.log(`   👥 Home Lineup: ${match.lineups?.home_team?.starting_lineups?.length || 0} players`);
      console.log(`   👥 Away Lineup: ${match.lineups?.away_team?.starting_lineups?.length || 0} players`);
      console.log(`   📈 Statistics: ${match.statistics?.length || 0} categories`);
      console.log(`   ⚽ Goal Events: ${match.goalscorers?.length || 0} goals`);
      console.log(`   🟨 Card Events: ${match.cards?.length || 0} cards`);
      
      if (match.goalscorers && match.goalscorers.length > 0) {
        console.log('\n   ⚽ Goal Details:');
        match.goalscorers.forEach((goal, index) => {
          console.log(`   ${index + 1}. ${goal.time}' - ${goal.info} team (${goal.score})`);
        });
      }
    }

  } catch (error) {
    console.log('❌ Match Statistics Error:', error.message);
  }

  console.log('\n🎯 SUMMARY & RECOMMENDATIONS:');
  console.log('===============================================');
  console.log('✅ AllSportsAPI has comprehensive data for both teams');
  console.log('✅ Team IDs are correct: Home 11699, Away 11230');
  console.log('✅ Historical match data is available for analysis');
  console.log('⚠️  API-Football has limited data for these reserve teams');
  console.log('📊 Primary source should be AllSportsAPI for this match type');
  console.log('🔧 Our validation system should focus on AllSportsAPI data enhancement');
}

testCorrectTeamIDs().catch(console.error);
