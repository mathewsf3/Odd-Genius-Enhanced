const axios = require('axios');

/**
 * Comprehensive test to find team IDs and available data from both APIs
 * for match 1499505 (Oran U21 vs USM Alger U21)
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function comprehensiveAPITest() {
  console.log('🔍 COMPREHENSIVE API DATA TEST - MATCH 1499505');
  console.log('===============================================');
  console.log('📊 Match: Oran U21 vs USM Alger U21');
  console.log('🎯 Goal: Find team IDs and available data from both APIs');
  console.log('===============================================');

  const results = {
    allSports: {
      match: null,
      homeTeamId: null,
      awayTeamId: null,
      homeTeamData: null,
      awayTeamData: null
    },
    apiFootball: {
      homeTeamId: null,
      awayTeamId: null,
      homeTeamData: null,
      awayTeamData: null
    }
  };

  // STEP 1: Get match details from AllSportsAPI
  console.log('\n📊 STEP 1: Getting match details from AllSportsAPI...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        matchId: '1499505'
      },
      timeout: 15000
    });

    if (response.data?.result?.[0]) {
      const match = response.data.result[0];
      results.allSports.match = match;
      results.allSports.homeTeamId = match.event_home_team_id;
      results.allSports.awayTeamId = match.event_away_team_id;

      console.log('✅ AllSportsAPI Match Found:');
      console.log(`   📋 ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`   🆔 Home Team ID: ${match.event_home_team_id || 'NOT FOUND'}`);
      console.log(`   🆔 Away Team ID: ${match.event_away_team_id || 'NOT FOUND'}`);
      console.log(`   📅 Date: ${match.event_date}`);
      console.log(`   🏆 League: ${match.league_name} (ID: ${match.league_id})`);
      console.log(`   ⚽ Score: ${match.event_final_result}`);
    } else {
      console.log('❌ No match found in AllSportsAPI');
    }
  } catch (error) {
    console.log('❌ AllSportsAPI Error:', error.message);
  }

  // STEP 2: Search for teams in API-Football by name
  console.log('\n🔍 STEP 2: Searching for teams in API-Football...');
  
  // Search for Oran U21
  console.log('\n🏠 Searching for "Oran U21" in API-Football...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        search: 'Oran'
      },
      timeout: 15000
    });

    console.log(`✅ API-Football Teams Search Results: ${response.data?.response?.length || 0} teams found`);
    if (response.data?.response?.length > 0) {
      response.data.response.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.team.name} (ID: ${team.team.id}) - ${team.team.country}`);
        if (team.team.name.toLowerCase().includes('oran')) {
          results.apiFootball.homeTeamId = team.team.id;
          console.log(`      🎯 POTENTIAL MATCH for Oran U21!`);
        }
      });
    }
  } catch (error) {
    console.log('❌ API-Football Oran Search Error:', error.response?.status || error.message);
  }

  // Search for USM Alger
  console.log('\n🚌 Searching for "USM Alger" in API-Football...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        search: 'USM'
      },
      timeout: 15000
    });

    console.log(`✅ API-Football Teams Search Results: ${response.data?.response?.length || 0} teams found`);
    if (response.data?.response?.length > 0) {
      response.data.response.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.team.name} (ID: ${team.team.id}) - ${team.team.country}`);
        if (team.team.name.toLowerCase().includes('usm') || team.team.name.toLowerCase().includes('alger')) {
          results.apiFootball.awayTeamId = team.team.id;
          console.log(`      🎯 POTENTIAL MATCH for USM Alger U21!`);
        }
      });
    }
  } catch (error) {
    console.log('❌ API-Football USM Search Error:', error.response?.status || error.message);
  }

  // STEP 3: Get team data from AllSportsAPI (if team IDs found)
  if (results.allSports.homeTeamId) {
    console.log(`\n📊 STEP 3A: Getting Oran U21 data from AllSportsAPI (ID: ${results.allSports.homeTeamId})...`);
    try {
      const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: ALLSPORTS_API_KEY,
          teamId: results.allSports.homeTeamId,
          from: '2024-01-01',
          to: '2025-06-03'
        },
        timeout: 15000
      });

      const matches = response.data?.result || [];
      results.allSports.homeTeamData = {
        totalMatches: matches.length,
        matchesWithCards: matches.filter(m => m.event_home_team_cards || m.event_away_team_cards).length,
        matchesWithGoals: matches.filter(m => m.event_final_result && m.event_final_result !== '0 - 0').length,
        matchesWithStats: matches.filter(m => m.statistics?.length > 0).length,
        recentMatches: matches.slice(0, 5).map(m => ({
          opponent: m.event_home_team === 'Oran U21' ? m.event_away_team : m.event_home_team,
          score: m.event_final_result,
          date: m.event_date
        }))
      };

      console.log('✅ AllSportsAPI Oran U21 Data:');
      console.log(`   📊 Total Matches: ${results.allSports.homeTeamData.totalMatches}`);
      console.log(`   🟨 Matches with Cards: ${results.allSports.homeTeamData.matchesWithCards}`);
      console.log(`   ⚽ Matches with Goals: ${results.allSports.homeTeamData.matchesWithGoals}`);
      console.log(`   📈 Matches with Stats: ${results.allSports.homeTeamData.matchesWithStats}`);
    } catch (error) {
      console.log('❌ AllSportsAPI Oran Data Error:', error.message);
    }
  }

  if (results.allSports.awayTeamId) {
    console.log(`\n📊 STEP 3B: Getting USM Alger U21 data from AllSportsAPI (ID: ${results.allSports.awayTeamId})...`);
    try {
      const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: ALLSPORTS_API_KEY,
          teamId: results.allSports.awayTeamId,
          from: '2024-01-01',
          to: '2025-06-03'
        },
        timeout: 15000
      });

      const matches = response.data?.result || [];
      results.allSports.awayTeamData = {
        totalMatches: matches.length,
        matchesWithCards: matches.filter(m => m.event_home_team_cards || m.event_away_team_cards).length,
        matchesWithGoals: matches.filter(m => m.event_final_result && m.event_final_result !== '0 - 0').length,
        matchesWithStats: matches.filter(m => m.statistics?.length > 0).length,
        recentMatches: matches.slice(0, 5).map(m => ({
          opponent: m.event_home_team === 'USM Alger U21' ? m.event_away_team : m.event_home_team,
          score: m.event_final_result,
          date: m.event_date
        }))
      };

      console.log('✅ AllSportsAPI USM Alger U21 Data:');
      console.log(`   📊 Total Matches: ${results.allSports.awayTeamData.totalMatches}`);
      console.log(`   🟨 Matches with Cards: ${results.allSports.awayTeamData.matchesWithCards}`);
      console.log(`   ⚽ Matches with Goals: ${results.allSports.awayTeamData.matchesWithGoals}`);
      console.log(`   📈 Matches with Stats: ${results.allSports.awayTeamData.matchesWithStats}`);
    } catch (error) {
      console.log('❌ AllSportsAPI USM Data Error:', error.message);
    }
  }

  // STEP 4: Get team data from API-Football (if team IDs found)
  if (results.apiFootball.homeTeamId) {
    console.log(`\n📊 STEP 4A: Getting team data from API-Football (Home ID: ${results.apiFootball.homeTeamId})...`);
    try {
      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        headers: {
          'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        },
        params: {
          team: results.apiFootball.homeTeamId,
          season: 2024
        },
        timeout: 15000
      });

      const fixtures = response.data?.response || [];
      results.apiFootball.homeTeamData = {
        totalFixtures: fixtures.length,
        fixturesWithStats: fixtures.filter(f => f.statistics?.length > 0).length,
        recentFixtures: fixtures.slice(0, 5).map(f => ({
          opponent: f.teams.home.id === results.apiFootball.homeTeamId ? f.teams.away.name : f.teams.home.name,
          score: `${f.goals.home} - ${f.goals.away}`,
          date: f.fixture.date
        }))
      };

      console.log('✅ API-Football Home Team Data:');
      console.log(`   📊 Total Fixtures: ${results.apiFootball.homeTeamData.totalFixtures}`);
      console.log(`   📈 Fixtures with Stats: ${results.apiFootball.homeTeamData.fixturesWithStats}`);
    } catch (error) {
      console.log('❌ API-Football Home Team Error:', error.response?.status || error.message);
    }
  }

  if (results.apiFootball.awayTeamId) {
    console.log(`\n📊 STEP 4B: Getting team data from API-Football (Away ID: ${results.apiFootball.awayTeamId})...`);
    try {
      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        headers: {
          'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        },
        params: {
          team: results.apiFootball.awayTeamId,
          season: 2024
        },
        timeout: 15000
      });

      const fixtures = response.data?.response || [];
      results.apiFootball.awayTeamData = {
        totalFixtures: fixtures.length,
        fixturesWithStats: fixtures.filter(f => f.statistics?.length > 0).length,
        recentFixtures: fixtures.slice(0, 5).map(f => ({
          opponent: f.teams.home.id === results.apiFootball.awayTeamId ? f.teams.away.name : f.teams.home.name,
          score: `${f.goals.home} - ${f.goals.away}`,
          date: f.fixture.date
        }))
      };

      console.log('✅ API-Football Away Team Data:');
      console.log(`   📊 Total Fixtures: ${results.apiFootball.awayTeamData.totalFixtures}`);
      console.log(`   📈 Fixtures with Stats: ${results.apiFootball.awayTeamData.fixturesWithStats}`);
    } catch (error) {
      console.log('❌ API-Football Away Team Error:', error.response?.status || error.message);
    }
  }

  // FINAL SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('📋 COMPREHENSIVE DATA AVAILABILITY SUMMARY');
  console.log('='.repeat(70));

  console.log('\n🔍 ALLSPORTS API:');
  console.log(`   🆔 Home Team ID: ${results.allSports.homeTeamId || 'NOT FOUND'}`);
  console.log(`   🆔 Away Team ID: ${results.allSports.awayTeamId || 'NOT FOUND'}`);
  if (results.allSports.homeTeamData) {
    console.log(`   📊 Home Team: ${results.allSports.homeTeamData.totalMatches} matches, ${results.allSports.homeTeamData.matchesWithCards} with cards`);
  }
  if (results.allSports.awayTeamData) {
    console.log(`   📊 Away Team: ${results.allSports.awayTeamData.totalMatches} matches, ${results.allSports.awayTeamData.matchesWithCards} with cards`);
  }

  console.log('\n🔄 API-FOOTBALL:');
  console.log(`   🆔 Home Team ID: ${results.apiFootball.homeTeamId || 'NOT FOUND'}`);
  console.log(`   🆔 Away Team ID: ${results.apiFootball.awayTeamId || 'NOT FOUND'}`);
  if (results.apiFootball.homeTeamData) {
    console.log(`   📊 Home Team: ${results.apiFootball.homeTeamData.totalFixtures} fixtures, ${results.apiFootball.homeTeamData.fixturesWithStats} with stats`);
  }
  if (results.apiFootball.awayTeamData) {
    console.log(`   📊 Away Team: ${results.apiFootball.awayTeamData.totalFixtures} fixtures, ${results.apiFootball.awayTeamData.fixturesWithStats} with stats`);
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.allSports.homeTeamId && results.allSports.awayTeamId) {
    console.log('✅ Use AllSportsAPI as primary source - team IDs found and data available');
  } else {
    console.log('⚠️  AllSportsAPI has limited team ID data for this match');
  }

  if (results.apiFootball.homeTeamId && results.apiFootball.awayTeamId) {
    console.log('✅ API-Football can be used as secondary source');
  } else {
    console.log('⚠️  API-Football teams not found or different naming convention');
  }

  // Save results
  require('fs').writeFileSync('comprehensive-api-results-1499505.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: comprehensive-api-results-1499505.json');

  return results;
}

comprehensiveAPITest().catch(console.error);
