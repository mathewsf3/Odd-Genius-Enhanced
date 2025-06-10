const axios = require('axios');

/**
 * Test API-Football endpoints individually with longer timeouts
 */

const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';
const FIXTURE_ID = '1307405';

async function testIndividualEndpoints() {
  console.log('🔄 API-FOOTBALL V3 INDIVIDUAL ENDPOINT TESTS');
  console.log('============================================');
  console.log('🆔 Fixture ID: 1307405');
  console.log('⏱️  Using 30-second timeouts');
  console.log('============================================');

  // Test Events Endpoint (most likely to have data)
  console.log('\n🎯 TESTING: /fixtures/events');
  console.log('=' .repeat(40));
  
  try {
    console.log('Making request...');
    const eventsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/events', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 30000
    });

    const events = eventsResponse.data?.response || [];
    console.log(`✅ SUCCESS: ${events.length} events found`);
    
    if (events.length > 0) {
      console.log('\n📋 Event Details:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.time.elapsed}' ${event.type}: ${event.detail}`);
        console.log(`   Team: ${event.team.name}`);
        if (event.player?.name) {
          console.log(`   Player: ${event.player.name}`);
        }
        if (event.assist?.name) {
          console.log(`   Assist: ${event.assist.name}`);
        }
        console.log('');
      });
    }
    
    // Save events data
    require('fs').writeFileSync('events-data.json', JSON.stringify(events, null, 2));
    console.log('💾 Events data saved to events-data.json');

  } catch (error) {
    console.log(`❌ Events error: ${error.response?.status || error.code || error.message}`);
  }

  // Wait before next request
  console.log('\n⏱️  Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test Statistics Endpoint
  console.log('\n📈 TESTING: /fixtures/statistics');
  console.log('=' .repeat(40));
  
  try {
    console.log('Making request...');
    const statisticsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/statistics', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 30000
    });

    const statistics = statisticsResponse.data?.response || [];
    console.log(`✅ SUCCESS: ${statistics.length} team statistics found`);
    
    if (statistics.length > 0) {
      statistics.forEach((teamStats, index) => {
        console.log(`\n📊 ${teamStats.team.name} Statistics:`);
        teamStats.statistics.forEach(stat => {
          console.log(`   ${stat.type}: ${stat.value}`);
        });
      });
    }
    
    // Save statistics data
    require('fs').writeFileSync('statistics-data.json', JSON.stringify(statistics, null, 2));
    console.log('💾 Statistics data saved to statistics-data.json');

  } catch (error) {
    console.log(`❌ Statistics error: ${error.response?.status || error.code || error.message}`);
  }

  // Wait before next request
  console.log('\n⏱️  Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test Players Endpoint
  console.log('\n👥 TESTING: /fixtures/players');
  console.log('=' .repeat(40));
  
  try {
    console.log('Making request...');
    const playersResponse = await axios.get('https://v3.football.api-sports.io/fixtures/players', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 30000
    });

    const players = playersResponse.data?.response || [];
    console.log(`✅ SUCCESS: ${players.length} team player data found`);
    
    if (players.length > 0) {
      players.forEach((teamPlayers, index) => {
        console.log(`\n👥 ${teamPlayers.team.name} Players (${teamPlayers.players.length}):`);
        teamPlayers.players.slice(0, 5).forEach((player, pIndex) => {
          console.log(`${pIndex + 1}. ${player.player.name} (#${player.player.number || 'N/A'})`);
          console.log(`   Position: ${player.player.pos || 'N/A'}`);
          if (player.statistics?.[0]) {
            const stats = player.statistics[0];
            console.log(`   Minutes: ${stats.games?.minutes || 0}'`);
            console.log(`   Goals: ${stats.goals?.total || 0}`);
            console.log(`   Cards: Y${stats.cards?.yellow || 0} R${stats.cards?.red || 0}`);
          }
        });
        if (teamPlayers.players.length > 5) {
          console.log(`   ... and ${teamPlayers.players.length - 5} more players`);
        }
      });
    }
    
    // Save players data
    require('fs').writeFileSync('players-data.json', JSON.stringify(players, null, 2));
    console.log('💾 Players data saved to players-data.json');

  } catch (error) {
    console.log(`❌ Players error: ${error.response?.status || error.code || error.message}`);
  }

  // Wait before next request
  console.log('\n⏱️  Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test Lineups Endpoint (additional test)
  console.log('\n👔 TESTING: /fixtures/lineups');
  console.log('=' .repeat(40));
  
  try {
    console.log('Making request...');
    const lineupsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/lineups', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        fixture: FIXTURE_ID
      },
      timeout: 30000
    });

    const lineups = lineupsResponse.data?.response || [];
    console.log(`✅ SUCCESS: ${lineups.length} team lineups found`);
    
    if (lineups.length > 0) {
      lineups.forEach((teamLineup, index) => {
        console.log(`\n👔 ${teamLineup.team.name} Lineup:`);
        console.log(`   Formation: ${teamLineup.formation || 'N/A'}`);
        console.log(`   Starting XI: ${teamLineup.startXI?.length || 0} players`);
        console.log(`   Substitutes: ${teamLineup.substitutes?.length || 0} players`);
        
        if (teamLineup.startXI?.length > 0) {
          console.log('   Starting Players:');
          teamLineup.startXI.slice(0, 5).forEach((player, pIndex) => {
            console.log(`   ${pIndex + 1}. ${player.player.name} (#${player.player.number}) - ${player.player.pos}`);
          });
          if (teamLineup.startXI.length > 5) {
            console.log(`   ... and ${teamLineup.startXI.length - 5} more starters`);
          }
        }
      });
    }
    
    // Save lineups data
    require('fs').writeFileSync('lineups-data.json', JSON.stringify(lineups, null, 2));
    console.log('💾 Lineups data saved to lineups-data.json');

  } catch (error) {
    console.log(`❌ Lineups error: ${error.response?.status || error.code || error.message}`);
  }

  console.log('\n🎯 INDIVIDUAL ENDPOINT TEST COMPLETE');
  console.log('Check the saved JSON files for detailed data');
}

testIndividualEndpoints().catch(console.error);
