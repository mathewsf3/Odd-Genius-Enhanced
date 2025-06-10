const axios = require('axios');

/**
 * Comprehensive test for corners, cards, player stats, and league stats
 * Using correct team IDs: AllSports (11699, 11230) and API-Football (10837, 10842)
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function comprehensiveStatsTest() {
  console.log('🔍 COMPREHENSIVE STATS TEST - MATCH 1499505');
  console.log('===========================================');
  console.log('🎯 Testing: Corners, Cards, Player Stats, League Stats');
  console.log('📊 AllSports IDs: Home 11699, Away 11230');
  console.log('📊 API-Football IDs: Home 10837, Away 10842');
  console.log('===========================================');

  const results = {
    allSports: {
      corners: null,
      cards: null,
      playerStats: null,
      leagueStats: null
    },
    apiFootball: {
      corners: null,
      cards: null,
      playerStats: null,
      leagueStats: null
    }
  };

  // ========================================
  // ALLSPORTS API TESTING
  // ========================================

  console.log('\n🔍 ALLSPORTS API - DETAILED STATISTICS TESTING');
  console.log('=' .repeat(50));

  // Test 1: Get detailed match statistics
  console.log('\n📊 Testing Match Statistics with Details...');
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
      console.log('✅ Match Details Retrieved');
      
      // Check for corner statistics
      const hasCornerStats = match.statistics?.some(stat => 
        stat.type?.toLowerCase().includes('corner') ||
        stat.type?.toLowerCase().includes('corners')
      );
      
      // Check for card statistics  
      const hasCardStats = match.cards?.length > 0 || 
                          match.event_home_team_cards > 0 || 
                          match.event_away_team_cards > 0;
      
      // Check for player statistics
      const hasPlayerStats = (match.lineups?.home_team?.starting_lineups?.length > 0) ||
                            (match.lineups?.away_team?.starting_lineups?.length > 0) ||
                            (match.players_home_lineup?.length > 0) ||
                            (match.players_away_lineup?.length > 0);

      results.allSports.corners = hasCornerStats;
      results.allSports.cards = hasCardStats;
      results.allSports.playerStats = hasPlayerStats;

      console.log(`   📐 Corner Stats: ${hasCornerStats ? 'Available' : 'Not Available'}`);
      console.log(`   🟨 Card Stats: ${hasCardStats ? 'Available' : 'Not Available'}`);
      console.log(`   👥 Player Stats: ${hasPlayerStats ? 'Available' : 'Not Available'}`);
      
      // Show available statistics
      if (match.statistics?.length > 0) {
        console.log('\n   📈 Available Statistics:');
        match.statistics.forEach(stat => {
          console.log(`      - ${stat.type}: Home ${stat.home} - Away ${stat.away}`);
        });
      }
      
      // Show card details
      if (match.cards?.length > 0) {
        console.log('\n   🟨 Card Details:');
        match.cards.forEach(card => {
          console.log(`      - ${card.time}' ${card.card} card for ${card.home_fault || card.away_fault}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ AllSports Match Stats Error:', error.message);
  }

  // Test 2: Get team historical data for statistical analysis
  console.log('\n📊 Testing Home Team Historical Data (11699)...');
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
    console.log(`✅ Home Team: ${matches.length} historical matches`);
    
    // Analyze corner data
    const matchesWithCorners = matches.filter(m => 
      m.statistics?.some(stat => stat.type?.toLowerCase().includes('corner'))
    );
    
    // Analyze card data
    const matchesWithCards = matches.filter(m => 
      (m.event_home_team_cards && m.event_home_team_cards > 0) ||
      (m.event_away_team_cards && m.event_away_team_cards > 0) ||
      (m.cards && m.cards.length > 0)
    );
    
    // Analyze player data
    const matchesWithPlayers = matches.filter(m =>
      (m.lineups?.home_team?.starting_lineups?.length > 0) ||
      (m.lineups?.away_team?.starting_lineups?.length > 0)
    );

    console.log(`   📐 Matches with Corner Data: ${matchesWithCorners.length}`);
    console.log(`   🟨 Matches with Card Data: ${matchesWithCards.length}`);
    console.log(`   👥 Matches with Player Data: ${matchesWithPlayers.length}`);
    
    // Sample corner data
    if (matchesWithCorners.length > 0) {
      console.log('\n   📐 Sample Corner Data:');
      matchesWithCorners.slice(0, 3).forEach((match, index) => {
        const cornerStat = match.statistics?.find(stat => stat.type?.toLowerCase().includes('corner'));
        if (cornerStat) {
          console.log(`      ${index + 1}. ${match.event_home_team} vs ${match.event_away_team}`);
          console.log(`         Corners: Home ${cornerStat.home} - Away ${cornerStat.away}`);
        }
      });
    }
    
    // Sample card data
    if (matchesWithCards.length > 0) {
      console.log('\n   🟨 Sample Card Data:');
      matchesWithCards.slice(0, 3).forEach((match, index) => {
        console.log(`      ${index + 1}. ${match.event_home_team} vs ${match.event_away_team}`);
        console.log(`         Cards: Home ${match.event_home_team_cards || 0} - Away ${match.event_away_team_cards || 0}`);
      });
    }

  } catch (error) {
    console.log('❌ AllSports Home Team Error:', error.message);
  }

  // Test 3: Get league statistics
  console.log('\n📊 Testing League Statistics (Reserve League - ID: 436)...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        leagueId: '436',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 15000
    });

    const leagueMatches = response.data?.result || [];
    console.log(`✅ League Matches: ${leagueMatches.length} total matches`);
    
    const leagueMatchesWithStats = leagueMatches.filter(m => m.statistics?.length > 0);
    results.allSports.leagueStats = leagueMatchesWithStats.length > 0;
    
    console.log(`   📈 Matches with Statistics: ${leagueMatchesWithStats.length}`);
    console.log(`   📊 League Coverage: ${Math.round((leagueMatchesWithStats.length / leagueMatches.length) * 100)}%`);

  } catch (error) {
    console.log('❌ AllSports League Stats Error:', error.message);
  }

  // ========================================
  // API-FOOTBALL TESTING
  // ========================================

  console.log('\n🔄 API-FOOTBALL - DETAILED STATISTICS TESTING');
  console.log('=' .repeat(50));

  // Test 4: Get fixture statistics from API-Football
  console.log('\n📊 Testing API-Football Fixture Statistics...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        team: '10837', // MC Oran U21
        season: '2024',
        last: 10
      },
      timeout: 15000
    });

    const fixtures = response.data?.response || [];
    console.log(`✅ API-Football Fixtures: ${fixtures.length} recent matches`);
    
    // Check for detailed statistics
    let fixturesWithCorners = 0;
    let fixturesWithCards = 0;
    let fixturesWithPlayers = 0;
    
    for (const fixture of fixtures) {
      // Check for corner statistics
      if (fixture.statistics?.some(stat => stat.type?.toLowerCase().includes('corner'))) {
        fixturesWithCorners++;
      }
      
      // Check for card statistics
      if (fixture.statistics?.some(stat => stat.type?.toLowerCase().includes('card'))) {
        fixturesWithCards++;
      }
      
      // Check for player statistics
      if (fixture.players && fixture.players.length > 0) {
        fixturesWithPlayers++;
      }
    }
    
    results.apiFootball.corners = fixturesWithCorners > 0;
    results.apiFootball.cards = fixturesWithCards > 0;
    results.apiFootball.playerStats = fixturesWithPlayers > 0;
    
    console.log(`   📐 Fixtures with Corner Data: ${fixturesWithCorners}`);
    console.log(`   🟨 Fixtures with Card Data: ${fixturesWithCards}`);
    console.log(`   👥 Fixtures with Player Data: ${fixturesWithPlayers}`);

  } catch (error) {
    console.log('❌ API-Football Fixtures Error:', error.response?.status || error.message);
  }

  // Test 5: Get specific fixture statistics
  console.log('\n📊 Testing API-Football Specific Statistics...');
  try {
    // Get a specific fixture to test detailed stats
    const fixturesResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        team: '10837',
        season: '2024',
        last: 1
      },
      timeout: 15000
    });

    const fixture = fixturesResponse.data?.response?.[0];
    if (fixture) {
      console.log(`✅ Testing fixture: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
      
      // Test fixture statistics
      try {
        const statsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/statistics', {
          headers: {
            'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          },
          params: {
            fixture: fixture.fixture.id
          },
          timeout: 15000
        });

        const stats = statsResponse.data?.response || [];
        console.log(`   📈 Statistics Available: ${stats.length > 0 ? 'Yes' : 'No'}`);
        
        if (stats.length > 0) {
          stats.forEach(teamStats => {
            console.log(`   📊 ${teamStats.team.name}:`);
            teamStats.statistics.forEach(stat => {
              if (stat.type.toLowerCase().includes('corner') || 
                  stat.type.toLowerCase().includes('card') ||
                  stat.type.toLowerCase().includes('shot')) {
                console.log(`      - ${stat.type}: ${stat.value}`);
              }
            });
          });
        }

      } catch (statsError) {
        console.log('   ⚠️  No detailed statistics available for this fixture');
      }

      // Test fixture events (cards, goals, etc.)
      try {
        const eventsResponse = await axios.get('https://v3.football.api-sports.io/fixtures/events', {
          headers: {
            'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          },
          params: {
            fixture: fixture.fixture.id
          },
          timeout: 15000
        });

        const events = eventsResponse.data?.response || [];
        const cardEvents = events.filter(event => event.type === 'Card');
        console.log(`   🟨 Card Events: ${cardEvents.length}`);
        
        if (cardEvents.length > 0) {
          cardEvents.forEach(card => {
            console.log(`      - ${card.time.elapsed}' ${card.detail} card for ${card.player.name}`);
          });
        }

      } catch (eventsError) {
        console.log('   ⚠️  No events data available for this fixture');
      }
    }

  } catch (error) {
    console.log('❌ API-Football Specific Stats Error:', error.response?.status || error.message);
  }

  // Test 6: Get league standings/statistics
  console.log('\n📊 Testing API-Football League Statistics...');
  try {
    // First, find the league ID for Algerian Reserve League
    const leaguesResponse = await axios.get('https://v3.football.api-sports.io/leagues', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        country: 'Algeria',
        season: '2024'
      },
      timeout: 15000
    });

    const leagues = leaguesResponse.data?.response || [];
    console.log(`✅ Algerian Leagues Found: ${leagues.length}`);
    
    leagues.forEach(league => {
      console.log(`   🏆 ${league.league.name} (ID: ${league.league.id})`);
    });
    
    results.apiFootball.leagueStats = leagues.length > 0;

  } catch (error) {
    console.log('❌ API-Football League Stats Error:', error.response?.status || error.message);
  }

  // ========================================
  // FINAL SUMMARY
  // ========================================

  console.log('\n' + '='.repeat(70));
  console.log('📋 COMPREHENSIVE STATISTICS AVAILABILITY SUMMARY');
  console.log('='.repeat(70));

  console.log('\n🔍 ALLSPORTS API CAPABILITIES:');
  console.log(`   📐 Corner Statistics: ${results.allSports.corners ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🟨 Card Statistics: ${results.allSports.cards ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   👥 Player Statistics: ${results.allSports.playerStats ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🏆 League Statistics: ${results.allSports.leagueStats ? '✅ Available' : '❌ Not Available'}`);

  console.log('\n🔄 API-FOOTBALL CAPABILITIES:');
  console.log(`   📐 Corner Statistics: ${results.apiFootball.corners ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🟨 Card Statistics: ${results.apiFootball.cards ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   👥 Player Statistics: ${results.apiFootball.playerStats ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🏆 League Statistics: ${results.apiFootball.leagueStats ? '✅ Available' : '❌ Not Available'}`);

  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.allSports.corners || results.allSports.cards) {
    console.log('✅ AllSportsAPI should be primary source for available statistics');
  }
  if (results.apiFootball.corners || results.apiFootball.cards) {
    console.log('✅ API-Football can supplement with additional statistics');
  }
  if (!results.allSports.corners && !results.apiFootball.corners) {
    console.log('⚠️  Corner statistics may need to be estimated from historical data');
  }
  if (!results.allSports.cards && !results.apiFootball.cards) {
    console.log('⚠️  Card statistics may need to be estimated from historical data');
  }

  // Save results
  require('fs').writeFileSync('comprehensive-stats-results-1499505.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: comprehensive-stats-results-1499505.json');

  return results;
}

comprehensiveStatsTest().catch(console.error);
