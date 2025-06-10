const axios = require('axios');

/**
 * Direct test of API-Football V3 for match 1499505
 * Testing both 2024 and 2025 seasons to see what data is available
 */

const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function testAPIFootballV3Direct() {
  console.log('🔄 DIRECT API-FOOTBALL V3 TEST - MATCH 1499505');
  console.log('===============================================');
  console.log('🎯 Testing: MC Oran U21 (10837) vs USM Alger U21 (10842)');
  console.log('📅 Match Date: 2025-06-03');
  console.log('===============================================');

  const results = {
    teams: {},
    fixtures2024: {},
    fixtures2025: {},
    leagues: {},
    statistics: {},
    matchDate: {}
  };

  // Test 1: Verify Team Information
  console.log('\n🔍 STEP 1: Verifying Team Information...');
  
  try {
    console.log('Testing MC Oran U21 (ID: 10837)...');
    const homeTeamResponse = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { id: '10837' },
      timeout: 15000
    });

    results.teams.home = homeTeamResponse.data?.response?.[0];
    if (results.teams.home) {
      console.log(`✅ Home Team Found: ${results.teams.home.team.name}`);
      console.log(`   📍 Country: ${results.teams.home.team.country}`);
      console.log(`   🏟️  Venue: ${results.teams.home.venue?.name || 'N/A'}`);
      console.log(`   📅 Founded: ${results.teams.home.team.founded || 'N/A'}`);
    } else {
      console.log('❌ Home team not found');
    }
  } catch (error) {
    console.log('❌ Home team error:', error.response?.status || error.message);
  }

  try {
    console.log('\nTesting USM Alger U21 (ID: 10842)...');
    const awayTeamResponse = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { id: '10842' },
      timeout: 15000
    });

    results.teams.away = awayTeamResponse.data?.response?.[0];
    if (results.teams.away) {
      console.log(`✅ Away Team Found: ${results.teams.away.team.name}`);
      console.log(`   📍 Country: ${results.teams.away.team.country}`);
      console.log(`   🏟️  Venue: ${results.teams.away.venue?.name || 'N/A'}`);
    } else {
      console.log('❌ Away team not found');
    }
  } catch (error) {
    console.log('❌ Away team error:', error.response?.status || error.message);
  }

  // Test 2: Check Fixtures for 2024 Season
  console.log('\n📊 STEP 2: Testing 2024 Season Fixtures...');
  
  try {
    console.log('Getting MC Oran U21 fixtures for 2024...');
    const fixtures2024Response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { team: '10837', season: '2024' },
      timeout: 15000
    });

    const fixtures2024 = fixtures2024Response.data?.response || [];
    results.fixtures2024.home = fixtures2024;
    console.log(`✅ 2024 Fixtures Found: ${fixtures2024.length}`);
    
    if (fixtures2024.length > 0) {
      console.log('\n   📋 Recent 2024 Fixtures:');
      fixtures2024.slice(0, 5).forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        console.log(`      📅 ${fixture.fixture.date} | Score: ${fixture.goals.home || 0}-${fixture.goals.away || 0}`);
        console.log(`      🏆 ${fixture.league.name} | Status: ${fixture.fixture.status.long}`);
      });
      
      // Check for statistics in 2024 fixtures
      const fixturesWithStats = fixtures2024.filter(f => f.statistics && f.statistics.length > 0);
      console.log(`   📈 Fixtures with Statistics: ${fixturesWithStats.length}`);
    }
  } catch (error) {
    console.log('❌ 2024 fixtures error:', error.response?.status || error.message);
  }

  // Test 3: Check Fixtures for 2025 Season
  console.log('\n📊 STEP 3: Testing 2025 Season Fixtures...');
  
  try {
    console.log('Getting MC Oran U21 fixtures for 2025...');
    const fixtures2025Response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { team: '10837', season: '2025' },
      timeout: 15000
    });

    const fixtures2025 = fixtures2025Response.data?.response || [];
    results.fixtures2025.home = fixtures2025;
    console.log(`✅ 2025 Fixtures Found: ${fixtures2025.length}`);
    
    if (fixtures2025.length > 0) {
      console.log('\n   📋 2025 Fixtures:');
      fixtures2025.slice(0, 5).forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        console.log(`      📅 ${fixture.fixture.date} | Score: ${fixture.goals.home || 0}-${fixture.goals.away || 0}`);
        console.log(`      🏆 ${fixture.league.name} | Status: ${fixture.fixture.status.long}`);
      });
    }
  } catch (error) {
    console.log('❌ 2025 fixtures error:', error.response?.status || error.message);
  }

  // Test 4: Check Specific Match Date
  console.log('\n📅 STEP 4: Testing Specific Match Date (2025-06-03)...');
  
  try {
    const matchDateResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { date: '2025-06-03' },
      timeout: 15000
    });

    const matchDateFixtures = matchDateResponse.data?.response || [];
    results.matchDate.fixtures = matchDateFixtures;
    console.log(`✅ Fixtures on 2025-06-03: ${matchDateFixtures.length}`);
    
    // Look for our specific match
    const ourMatch = matchDateFixtures.find(f => 
      (f.teams.home.id === 10837 && f.teams.away.id === 10842) ||
      (f.teams.home.name.includes('Oran') && f.teams.away.name.includes('USM'))
    );
    
    if (ourMatch) {
      console.log('🎯 FOUND OUR MATCH!');
      console.log(`   📋 ${ourMatch.teams.home.name} vs ${ourMatch.teams.away.name}`);
      console.log(`   🆔 Fixture ID: ${ourMatch.fixture.id}`);
      console.log(`   🏆 League: ${ourMatch.league.name} (ID: ${ourMatch.league.id})`);
      console.log(`   ⚽ Score: ${ourMatch.goals.home || 0}-${ourMatch.goals.away || 0}`);
      console.log(`   📊 Status: ${ourMatch.fixture.status.long}`);
      
      // Test detailed statistics for this specific match
      await testSpecificMatchStats(ourMatch.fixture.id);
    } else {
      console.log('⚠️  Our specific match not found on this date');
      if (matchDateFixtures.length > 0) {
        console.log('   📋 Other matches on this date:');
        matchDateFixtures.slice(0, 3).forEach((fixture, index) => {
          console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Match date error:', error.response?.status || error.message);
  }

  // Test 5: Check Available Leagues
  console.log('\n🏆 STEP 5: Testing Available Leagues...');
  
  try {
    const leaguesResponse = await axios.get('https://v3.football.api-sports.io/leagues', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { country: 'Algeria', season: '2025' },
      timeout: 15000
    });

    const leagues = leaguesResponse.data?.response || [];
    results.leagues.algeria2025 = leagues;
    console.log(`✅ Algerian Leagues 2025: ${leagues.length}`);
    
    leagues.forEach(league => {
      console.log(`   🏆 ${league.league.name} (ID: ${league.league.id})`);
      console.log(`      Type: ${league.league.type} | Season: ${league.seasons?.[0]?.year || 'N/A'}`);
    });
  } catch (error) {
    console.log('❌ Leagues error:', error.response?.status || error.message);
  }

  // Test 6: Head-to-Head
  console.log('\n🤝 STEP 6: Testing Head-to-Head...');
  
  try {
    const h2hResponse = await axios.get('https://v3.football.api-sports.io/fixtures/headtohead', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { h2h: '10837-10842' },
      timeout: 15000
    });

    const h2hFixtures = h2hResponse.data?.response || [];
    results.statistics.h2h = h2hFixtures;
    console.log(`✅ Head-to-Head Matches: ${h2hFixtures.length}`);
    
    if (h2hFixtures.length > 0) {
      console.log('\n   📋 Recent H2H Matches:');
      h2hFixtures.slice(0, 3).forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        console.log(`      📅 ${fixture.fixture.date} | Score: ${fixture.goals.home || 0}-${fixture.goals.away || 0}`);
      });
    }
  } catch (error) {
    console.log('❌ H2H error:', error.response?.status || error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 API-FOOTBALL V3 DIRECT TEST SUMMARY');
  console.log('='.repeat(70));
  
  console.log('\n🔍 TEAM VERIFICATION:');
  console.log(`   🏠 Home Team (10837): ${results.teams.home ? '✅ Found' : '❌ Not Found'}`);
  console.log(`   🚌 Away Team (10842): ${results.teams.away ? '✅ Found' : '❌ Not Found'}`);
  
  console.log('\n📊 FIXTURE DATA:');
  console.log(`   📅 2024 Season: ${results.fixtures2024.home?.length || 0} fixtures`);
  console.log(`   📅 2025 Season: ${results.fixtures2025.home?.length || 0} fixtures`);
  console.log(`   📅 Match Date (2025-06-03): ${results.matchDate.fixtures?.length || 0} fixtures`);
  
  console.log('\n🏆 LEAGUE DATA:');
  console.log(`   🇩🇿 Algeria 2025 Leagues: ${results.leagues.algeria2025?.length || 0} leagues`);
  
  console.log('\n🤝 HEAD-TO-HEAD:');
  console.log(`   📊 H2H Matches: ${results.statistics.h2h?.length || 0} matches`);

  // Save results
  require('fs').writeFileSync('api-football-v3-direct-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: api-football-v3-direct-test-results.json');

  return results;
}

async function testSpecificMatchStats(fixtureId) {
  console.log(`\n📊 Testing Detailed Statistics for Fixture ${fixtureId}...`);
  
  try {
    // Test fixture statistics
    const statsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/statistics', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { fixture: fixtureId },
      timeout: 15000
    });

    const stats = statsResponse.data?.response || [];
    console.log(`   📈 Statistics Available: ${stats.length > 0 ? 'Yes' : 'No'}`);
    
    if (stats.length > 0) {
      stats.forEach(teamStats => {
        console.log(`   📊 ${teamStats.team.name}:`);
        teamStats.statistics.forEach(stat => {
          console.log(`      - ${stat.type}: ${stat.value}`);
        });
      });
    }

    // Test fixture events
    const eventsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/events', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: { fixture: fixtureId },
      timeout: 15000
    });

    const events = eventsResponse.data?.response || [];
    console.log(`   🎯 Events Available: ${events.length}`);
    
    if (events.length > 0) {
      events.forEach(event => {
        console.log(`   ${event.time.elapsed}' ${event.type}: ${event.detail} (${event.team.name})`);
      });
    }

  } catch (error) {
    console.log(`   ❌ Statistics error: ${error.response?.status || error.message}`);
  }
}

testAPIFootballV3Direct().catch(console.error);
