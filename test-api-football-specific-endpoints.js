const axios = require('axios');

/**
 * Test specific API-Football endpoints for match 1499505
 * Using the recommended endpoints to determine exact data availability
 */

const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';
const FIXTURE_ID = '1307405'; // Found from previous test

async function testSpecificEndpoints() {
  console.log('🔄 API-FOOTBALL V3 SPECIFIC ENDPOINTS TEST');
  console.log('==========================================');
  console.log('🎯 Match: MC Oran U21 vs USM Alger U21');
  console.log('🆔 Fixture ID: 1307405');
  console.log('📅 Date: 2025-06-03');
  console.log('==========================================');

  const results = {
    fixtures: null,
    events: null,
    statistics: null,
    players: null,
    summary: {}
  };

  // Test 1: Fixtures Endpoint (with specific parameters)
  console.log('\n📊 ENDPOINT 1: /fixtures (with specific parameters)');
  console.log('=' .repeat(50));
  
  try {
    console.log('Testing: league=515, season=2025, team=10837...');
    const fixturesResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        league: '515',
        season: '2025',
        team: '10837'
      },
      timeout: 15000
    });

    const fixtures = fixturesResponse.data?.response || [];
    results.fixtures = fixtures;
    console.log(`✅ Fixtures Found: ${fixtures.length}`);
    
    // Look for our specific match
    const ourMatch = fixtures.find(f => 
      (f.teams.home.id === 10837 && f.teams.away.id === 10842) ||
      (f.teams.home.id === 10842 && f.teams.away.id === 10837)
    );
    
    if (ourMatch) {
      console.log('🎯 FOUND OUR MATCH IN 2025 SEASON!');
      console.log(`   📋 ${ourMatch.teams.home.name} vs ${ourMatch.teams.away.name}`);
      console.log(`   🆔 Fixture ID: ${ourMatch.fixture.id}`);
      console.log(`   📅 Date: ${ourMatch.fixture.date}`);
      console.log(`   ⚽ Score: ${ourMatch.goals.home}-${ourMatch.goals.away}`);
      console.log(`   📊 Status: ${ourMatch.fixture.status.long}`);
      console.log(`   🏆 League: ${ourMatch.league.name} (Round: ${ourMatch.league.round})`);
    } else {
      console.log('⚠️  Match not found in 2025 season fixtures');
      if (fixtures.length > 0) {
        console.log('   📋 Other 2025 fixtures found:');
        fixtures.slice(0, 3).forEach((fixture, index) => {
          console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name} (${fixture.fixture.date})`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Fixtures endpoint error:', error.response?.status || error.message);
  }

  // Test 2: Events Endpoint
  console.log('\n🎯 ENDPOINT 2: /fixtures/events');
  console.log('=' .repeat(50));
  
  try {
    console.log(`Testing events for fixture ${FIXTURE_ID}...`);
    const eventsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/events', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 15000
    });

    const events = eventsResponse.data?.response || [];
    results.events = events;
    console.log(`✅ Events Found: ${events.length}`);
    
    if (events.length > 0) {
      // Categorize events
      const goals = events.filter(e => e.type === 'Goal');
      const cards = events.filter(e => e.type === 'Card');
      const substitutions = events.filter(e => e.type === 'subst');
      const vars = events.filter(e => e.type === 'Var');
      
      console.log(`   ⚽ Goals: ${goals.length}`);
      console.log(`   🟨 Cards: ${cards.length}`);
      console.log(`   🔄 Substitutions: ${substitutions.length}`);
      console.log(`   📺 VAR Events: ${vars.length}`);
      
      console.log('\n   📋 Detailed Events:');
      events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.time.elapsed}' ${event.type}: ${event.detail}`);
        console.log(`      Team: ${event.team.name}`);
        if (event.player) {
          console.log(`      Player: ${event.player.name}`);
        }
        if (event.assist && event.assist.name) {
          console.log(`      Assist: ${event.assist.name}`);
        }
      });
      
      results.summary.goals = goals.length;
      results.summary.cards = cards.length;
      results.summary.substitutions = substitutions.length;
    }
  } catch (error) {
    console.log('❌ Events endpoint error:', error.response?.status || error.message);
  }

  // Test 3: Statistics Endpoint
  console.log('\n📈 ENDPOINT 3: /fixtures/statistics');
  console.log('=' .repeat(50));
  
  try {
    console.log(`Testing statistics for fixture ${FIXTURE_ID}...`);
    const statisticsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/statistics', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 15000
    });

    const statistics = statisticsResponse.data?.response || [];
    results.statistics = statistics;
    console.log(`✅ Team Statistics Found: ${statistics.length} teams`);
    
    if (statistics.length > 0) {
      statistics.forEach((teamStats, index) => {
        console.log(`\n   📊 ${teamStats.team.name}:`);
        
        // Look for specific statistics
        const corners = teamStats.statistics.find(s => s.type.toLowerCase().includes('corner'));
        const possession = teamStats.statistics.find(s => s.type.toLowerCase().includes('possession'));
        const shots = teamStats.statistics.find(s => s.type.toLowerCase().includes('shots on'));
        const fouls = teamStats.statistics.find(s => s.type.toLowerCase().includes('fouls'));
        const offsides = teamStats.statistics.find(s => s.type.toLowerCase().includes('offside'));
        
        if (corners) console.log(`      📐 Corners: ${corners.value}`);
        if (possession) console.log(`      ⚽ Possession: ${possession.value}`);
        if (shots) console.log(`      🎯 Shots on Target: ${shots.value}`);
        if (fouls) console.log(`      🚫 Fouls: ${fouls.value}`);
        if (offsides) console.log(`      🏃 Offsides: ${offsides.value}`);
        
        // Show all available statistics
        console.log(`      📋 All Statistics (${teamStats.statistics.length}):`);
        teamStats.statistics.forEach(stat => {
          console.log(`         - ${stat.type}: ${stat.value}`);
        });
      });
      
      // Extract key statistics for summary
      if (statistics[0]?.statistics) {
        const homeCorners = statistics[0].statistics.find(s => s.type.toLowerCase().includes('corner'));
        const awayCorners = statistics[1]?.statistics.find(s => s.type.toLowerCase().includes('corner'));
        
        results.summary.homeCorners = homeCorners?.value || 0;
        results.summary.awayCorners = awayCorners?.value || 0;
        results.summary.totalCorners = (parseInt(homeCorners?.value || 0) + parseInt(awayCorners?.value || 0));
      }
    } else {
      console.log('   ⚠️  No team-level statistics available');
    }
  } catch (error) {
    console.log('❌ Statistics endpoint error:', error.response?.status || error.message);
  }

  // Test 4: Players Endpoint
  console.log('\n👥 ENDPOINT 4: /fixtures/players');
  console.log('=' .repeat(50));
  
  try {
    console.log(`Testing player statistics for fixture ${FIXTURE_ID}...`);
    const playersResponse = await axios.get('https://v3.football.api-sports.io/fixtures/players', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 15000
    });

    const players = playersResponse.data?.response || [];
    results.players = players;
    console.log(`✅ Team Player Data Found: ${players.length} teams`);
    
    if (players.length > 0) {
      players.forEach((teamPlayers, index) => {
        console.log(`\n   👥 ${teamPlayers.team.name}:`);
        console.log(`      📊 Players: ${teamPlayers.players.length}`);
        
        if (teamPlayers.players.length > 0) {
          console.log(`      📋 Player Statistics:`);
          teamPlayers.players.slice(0, 5).forEach((player, pIndex) => {
            console.log(`      ${pIndex + 1}. ${player.player.name} (#${player.player.number || 'N/A'})`);
            console.log(`         Position: ${player.player.pos || 'N/A'}`);
            console.log(`         Minutes: ${player.statistics[0]?.games?.minutes || 0}'`);
            console.log(`         Goals: ${player.statistics[0]?.goals?.total || 0}`);
            console.log(`         Assists: ${player.statistics[0]?.goals?.assists || 0}`);
            console.log(`         Cards: Y${player.statistics[0]?.cards?.yellow || 0} R${player.statistics[0]?.cards?.red || 0}`);
          });
          
          if (teamPlayers.players.length > 5) {
            console.log(`      ... and ${teamPlayers.players.length - 5} more players`);
          }
        }
      });
      
      // Calculate summary statistics
      let totalPlayers = 0;
      let totalGoals = 0;
      let totalCards = 0;
      
      players.forEach(teamPlayers => {
        totalPlayers += teamPlayers.players.length;
        teamPlayers.players.forEach(player => {
          totalGoals += player.statistics[0]?.goals?.total || 0;
          totalCards += (player.statistics[0]?.cards?.yellow || 0) + (player.statistics[0]?.cards?.red || 0);
        });
      });
      
      results.summary.totalPlayers = totalPlayers;
      results.summary.playerGoals = totalGoals;
      results.summary.playerCards = totalCards;
    } else {
      console.log('   ⚠️  No player-specific statistics available');
    }
  } catch (error) {
    console.log('❌ Players endpoint error:', error.response?.status || error.message);
  }

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 API-FOOTBALL V3 ENDPOINTS SUMMARY');
  console.log('='.repeat(70));
  
  console.log('\n🔍 DATA AVAILABILITY:');
  console.log(`   📊 Fixtures: ${results.fixtures ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🎯 Events: ${results.events ? '✅ Available' : '❌ Not Available'} (${results.summary.goals || 0} goals, ${results.summary.cards || 0} cards)`);
  console.log(`   📈 Statistics: ${results.statistics ? '✅ Available' : '❌ Not Available'} (${results.summary.totalCorners || 0} total corners)`);
  console.log(`   👥 Players: ${results.players ? '✅ Available' : '❌ Not Available'} (${results.summary.totalPlayers || 0} players)`);
  
  console.log('\n🎯 KEY FINDINGS:');
  if (results.events && results.events.length > 0) {
    console.log('✅ Goal events with timing and player details available');
  }
  if (results.statistics && results.statistics.length > 0) {
    console.log('✅ Team-level statistics including corners and possession available');
  }
  if (results.players && results.players.length > 0) {
    console.log('✅ Player-specific statistics and lineups available');
  }
  if (results.summary.cards > 0) {
    console.log('✅ Card events with player details available');
  }
  
  console.log('\n💡 IMPLEMENTATION RECOMMENDATIONS:');
  if (results.statistics && results.players) {
    console.log('🌟 EXCELLENT: Full statistical data available from API-Football V3');
    console.log('📊 Can build comprehensive match analysis using this API alone');
  } else if (results.events) {
    console.log('✅ GOOD: Basic event data available, can supplement with other sources');
  } else {
    console.log('⚠️  LIMITED: May need to rely on other APIs or estimation');
  }

  // Save results
  require('fs').writeFileSync('api-football-endpoints-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: api-football-endpoints-test-results.json');

  return results;
}

testSpecificEndpoints().catch(console.error);
