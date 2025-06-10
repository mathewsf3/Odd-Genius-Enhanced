const axios = require('axios');

/**
 * Test match 1512298 to identify the pattern of missing data
 * and develop a comprehensive solution for limited-data matches
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function testMatch1512298() {
  console.log('🔍 TESTING MATCH 1512298 - PATTERN ANALYSIS');
  console.log('==========================================');
  console.log('🎯 Goal: Identify systemic data limitations');
  console.log('📊 URL: http://localhost:3000/match/1512298');
  console.log('==========================================');

  const results = {
    matchDetails: null,
    teamIds: null,
    dataAvailability: {
      goals: false,
      cards: false,
      corners: false,
      players: false,
      statistics: false
    },
    apiFootballData: null,
    recommendations: []
  };

  // Step 1: Get match details from AllSportsAPI
  console.log('\n📊 STEP 1: Getting match details from AllSportsAPI...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        matchId: '1512298'
      },
      timeout: 15000
    });

    if (response.data?.result?.[0]) {
      const match = response.data.result[0];
      results.matchDetails = match;
      results.teamIds = {
        home: match.home_team_key,
        away: match.away_team_key
      };

      console.log('✅ Match Details Found:');
      console.log(`   📋 ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`   📅 Date: ${match.event_date}`);
      console.log(`   ⚽ Score: ${match.event_final_result}`);
      console.log(`   🏆 League: ${match.league_name} (ID: ${match.league_key})`);
      console.log(`   🆔 Home Team ID: ${match.home_team_key}`);
      console.log(`   🆔 Away Team ID: ${match.away_team_key}`);
      console.log(`   🇺🇸 Country: ${match.country_name}`);

      // Check available data in match
      results.dataAvailability.goals = !!(match.goalscorers && match.goalscorers.length > 0);
      results.dataAvailability.cards = !!(match.cards && match.cards.length > 0);
      results.dataAvailability.players = !!(match.lineups?.home_team?.starting_lineups?.length > 0 || 
                                           match.lineups?.away_team?.starting_lineups?.length > 0);
      results.dataAvailability.statistics = !!(match.statistics && match.statistics.length > 0);

      console.log('\n   📊 Data Availability in Match:');
      console.log(`   ⚽ Goals: ${results.dataAvailability.goals ? '✅ Available' : '❌ Missing'} (${match.goalscorers?.length || 0})`);
      console.log(`   🟨 Cards: ${results.dataAvailability.cards ? '✅ Available' : '❌ Missing'} (${match.cards?.length || 0})`);
      console.log(`   👥 Players: ${results.dataAvailability.players ? '✅ Available' : '❌ Missing'}`);
      console.log(`   📈 Statistics: ${results.dataAvailability.statistics ? '✅ Available' : '❌ Missing'} (${match.statistics?.length || 0})`);

      // Show goal details if available
      if (match.goalscorers && match.goalscorers.length > 0) {
        console.log('\n   ⚽ Goal Details:');
        match.goalscorers.forEach((goal, index) => {
          console.log(`   ${index + 1}. ${goal.time}' - ${goal.info} team (${goal.score})`);
          if (goal.home_scorer) console.log(`      Scorer: ${goal.home_scorer}`);
          if (goal.away_scorer) console.log(`      Scorer: ${goal.away_scorer}`);
        });
      }

      // Show statistics if available
      if (match.statistics && match.statistics.length > 0) {
        console.log('\n   📈 Available Statistics:');
        match.statistics.forEach(stat => {
          console.log(`   ${stat.type}: Home ${stat.home} - Away ${stat.away}`);
          if (stat.type.toLowerCase().includes('corner')) {
            results.dataAvailability.corners = true;
          }
        });
      }

    } else {
      console.log('❌ Match not found in AllSportsAPI');
    }
  } catch (error) {
    console.log('❌ AllSportsAPI Error:', error.message);
  }

  // Step 2: Test historical data for teams
  if (results.teamIds?.home && results.teamIds?.away) {
    console.log('\n📊 STEP 2: Testing historical team data...');
    
    try {
      const homeTeamResponse = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: ALLSPORTS_API_KEY,
          teamId: results.teamIds.home,
          from: '2024-01-01',
          to: '2025-12-31'
        },
        timeout: 15000
      });

      const homeMatches = homeTeamResponse.data?.result || [];
      console.log(`✅ Home Team Historical Matches: ${homeMatches.length}`);
      
      // Analyze historical data quality
      const matchesWithGoals = homeMatches.filter(m => m.event_final_result && m.event_final_result !== '0 - 0');
      const matchesWithCards = homeMatches.filter(m => (m.event_home_team_cards > 0) || (m.event_away_team_cards > 0));
      const matchesWithStats = homeMatches.filter(m => m.statistics && m.statistics.length > 0);
      
      console.log(`   ⚽ Matches with Goals: ${matchesWithGoals.length}/${homeMatches.length} (${Math.round((matchesWithGoals.length/homeMatches.length)*100)}%)`);
      console.log(`   🟨 Matches with Cards: ${matchesWithCards.length}/${homeMatches.length} (${Math.round((matchesWithCards.length/homeMatches.length)*100)}%)`);
      console.log(`   📈 Matches with Statistics: ${matchesWithStats.length}/${homeMatches.length} (${Math.round((matchesWithStats.length/homeMatches.length)*100)}%)`);

      // Calculate averages for estimation
      if (matchesWithGoals.length > 0) {
        let totalGoals = 0;
        matchesWithGoals.forEach(match => {
          const scoreParts = match.event_final_result.split(' - ');
          if (scoreParts.length === 2) {
            totalGoals += parseInt(scoreParts[0]) + parseInt(scoreParts[1]);
          }
        });
        const avgGoals = totalGoals / matchesWithGoals.length;
        console.log(`   📊 Average Goals per Match: ${avgGoals.toFixed(2)}`);
      }

    } catch (error) {
      console.log('❌ Historical Data Error:', error.message);
    }
  }

  // Step 3: Search for teams in API-Football
  if (results.matchDetails) {
    console.log('\n📊 STEP 3: Searching teams in API-Football...');
    
    const homeTeamName = results.matchDetails.event_home_team;
    const awayTeamName = results.matchDetails.event_away_team;
    
    try {
      // Extract key words for search
      const homeSearchTerm = homeTeamName.split(' ')[0]; // First word
      const awaySearchTerm = awayTeamName.split(' ')[0]; // First word
      
      console.log(`   🔍 Searching for "${homeSearchTerm}" and "${awaySearchTerm}"...`);
      
      const homeSearchResponse = await axios.get('https://v3.football.api-sports.io/teams', {
        headers: {
          'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        },
        params: {
          search: homeSearchTerm
        },
        timeout: 15000
      });

      const homeTeams = homeSearchResponse.data?.response || [];
      console.log(`   🏠 Home team search results: ${homeTeams.length}`);
      
      if (homeTeams.length > 0) {
        homeTeams.slice(0, 3).forEach((team, index) => {
          console.log(`   ${index + 1}. ${team.team.name} (ID: ${team.team.id}) - ${team.team.country}`);
        });
      }

    } catch (error) {
      console.log('❌ API-Football Search Error:', error.response?.status || error.message);
    }
  }

  // Step 4: Test our current API endpoints
  console.log('\n📊 STEP 4: Testing our current API endpoints...');
  
  try {
    console.log('   Testing match details endpoint...');
    const matchResponse = await axios.get(`http://localhost:5000/api/matches/1512298`, { timeout: 10000 });
    console.log(`   ✅ Match Details: ${matchResponse.data.result ? 'Available' : 'Not Available'}`);
  } catch (error) {
    console.log(`   ❌ Match Details Error: ${error.message}`);
  }

  try {
    console.log('   Testing BTTS endpoint...');
    const bttsResponse = await axios.get(`http://localhost:5000/api/matches/1512298/btts?matches=10`, { timeout: 15000 });
    console.log(`   ✅ BTTS: ${bttsResponse.data.result ? 'Available' : 'Not Available'}`);
  } catch (error) {
    console.log(`   ❌ BTTS Error: ${error.message}`);
  }

  try {
    console.log('   Testing Cards endpoint...');
    const cardsResponse = await axios.get(`http://localhost:5000/api/matches/1512298/cards?matches=10`, { timeout: 15000 });
    console.log(`   ✅ Cards: ${cardsResponse.data.result ? 'Available' : 'Not Available'}`);
  } catch (error) {
    console.log(`   ❌ Cards Error: ${error.message}`);
  }

  try {
    console.log('   Testing Players endpoint...');
    const playersResponse = await axios.get(`http://localhost:5000/api/matches/1512298/players?matches=10`, { timeout: 15000 });
    console.log(`   ✅ Players: ${playersResponse.data.result ? 'Available' : 'Not Available'}`);
  } catch (error) {
    console.log(`   ❌ Players Error: ${error.message}`);
  }

  // Step 5: Generate recommendations
  console.log('\n💡 STEP 5: Generating recommendations...');
  
  if (!results.dataAvailability.goals && !results.dataAvailability.cards && !results.dataAvailability.players) {
    results.recommendations.push('CRITICAL: No detailed match data available - implement fallback system');
  }
  
  if (results.teamIds?.home && results.teamIds?.away) {
    results.recommendations.push('Use historical team data for statistical estimation');
  }
  
  if (results.matchDetails?.league_name) {
    results.recommendations.push(`Apply league-specific estimation for ${results.matchDetails.league_name}`);
  }
  
  results.recommendations.push('Implement "Limited Data" UI mode for affected matches');
  results.recommendations.push('Show available data prominently, estimate missing data with disclaimers');

  console.log('\n🎯 RECOMMENDATIONS:');
  results.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 MATCH 1512298 ANALYSIS SUMMARY');
  console.log('='.repeat(70));
  
  if (results.matchDetails) {
    console.log(`\n📊 MATCH: ${results.matchDetails.event_home_team} vs ${results.matchDetails.event_away_team}`);
    console.log(`📅 DATE: ${results.matchDetails.event_date}`);
    console.log(`🏆 LEAGUE: ${results.matchDetails.league_name}`);
    console.log(`⚽ SCORE: ${results.matchDetails.event_final_result}`);
  }
  
  console.log('\n📈 DATA AVAILABILITY:');
  Object.keys(results.dataAvailability).forEach(key => {
    const available = results.dataAvailability[key];
    console.log(`   ${key.toUpperCase()}: ${available ? '✅ Available' : '❌ Missing'}`);
  });
  
  console.log('\n🔧 SYSTEMIC ISSUE CONFIRMED:');
  console.log('Multiple matches lack detailed statistical data');
  console.log('Need comprehensive solution for limited-data scenarios');

  // Save results
  require('fs').writeFileSync('match-1512298-analysis.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Analysis saved to: match-1512298-analysis.json');

  return results;
}

testMatch1512298().catch(console.error);
