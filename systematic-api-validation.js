const axios = require('axios');

/**
 * Systematic API validation following the provided script
 * Testing both API-FOOTBALL V3 and AllSportsAPI V2 for MC Oran U21 × USM Alger U21
 */

const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';
const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';

async function systematicAPIValidation() {
  console.log('🔍 SYSTEMATIC API VALIDATION - 5 MINUTE TEST');
  console.log('===========================================');
  console.log('🎯 Match: MC Oran U21 × USM Alger U21');
  console.log('📊 API-Football Teams: 10837 vs 10842');
  console.log('📊 AllSports Match ID: 1499505');
  console.log('===========================================');

  const results = {
    apiFootball: {
      leagueCoverage: null,
      fixtureId: null,
      statistics: null,
      events: null,
      lineups: null,
      odds: null,
      predictions: null
    },
    allSports: {
      matchDirect: null,
      teamFallback: null,
      statistics: null,
      lineups: null,
      odds: null
    },
    summary: {}
  };

  // ========================================
  // 1. API-FOOTBALL (V3) TESTING
  // ========================================

  console.log('\n🔄 1. API-FOOTBALL (V3) TESTING');
  console.log('=' .repeat(50));

  // 1.1. Check if U21 League (515) is covered
  console.log('\n1.1. Checking U21 League (515) coverage...');
  try {
    const leagueResponse = await axios.get('https://v3.football.api-sports.io/leagues', {
      headers: {
        'x-apisports-key': APIFOOTBALL_API_KEY
      },
      params: { id: '515' },
      timeout: 20000
    });

    const leagues = leagueResponse.data?.response || [];
    results.apiFootball.leagueCoverage = leagues.length > 0;
    
    if (leagues.length > 0) {
      const league = leagues[0];
      console.log('✅ League found:');
      console.log(`   📋 Name: ${league.league.name}`);
      console.log(`   🇩🇿 Country: ${league.country.name}`);
      console.log(`   📊 Coverage: ${league.coverage ? 'Available' : 'Limited'}`);
      
      if (league.coverage) {
        console.log(`   🎯 Fixtures: ${league.coverage.fixtures ? 'Yes' : 'No'}`);
        console.log(`   📈 Statistics: ${league.coverage.statistics ? 'Yes' : 'No'}`);
        console.log(`   👥 Players: ${league.coverage.players ? 'Yes' : 'No'}`);
        console.log(`   🎲 Odds: ${league.coverage.odds ? 'Yes' : 'No'}`);
        console.log(`   🔮 Predictions: ${league.coverage.predictions ? 'Yes' : 'No'}`);
      }
    } else {
      console.log('❌ League not found - competition not covered');
    }
  } catch (error) {
    console.log(`❌ League check error: ${error.response?.status || error.message}`);
  }

  // 1.2. Find fixture ID via H2H
  console.log('\n1.2. Finding fixture ID via H2H...');
  try {
    const h2hResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'x-apisports-key': APIFOOTBALL_API_KEY
      },
      params: { 
        h2h: '10837-10842',
        season: '2025'
      },
      timeout: 20000
    });

    const fixtures = h2hResponse.data?.response || [];
    console.log(`✅ H2H fixtures found: ${fixtures.length}`);
    
    if (fixtures.length > 0) {
      const targetFixture = fixtures.find(f => 
        f.fixture.date.includes('2025-06-03') ||
        f.fixture.date.includes('2025-05-04')
      );
      
      if (targetFixture) {
        results.apiFootball.fixtureId = targetFixture.fixture.id;
        console.log(`🎯 Target fixture found:`);
        console.log(`   🆔 Fixture ID: ${targetFixture.fixture.id}`);
        console.log(`   📅 Date: ${targetFixture.fixture.date}`);
        console.log(`   ⚽ Score: ${targetFixture.goals.home}-${targetFixture.goals.away}`);
        console.log(`   🏆 League: ${targetFixture.league.name}`);
      } else {
        console.log('⚠️  Target fixture not found in H2H results');
        // Use the most recent fixture
        results.apiFootball.fixtureId = fixtures[0].fixture.id;
        console.log(`📋 Using most recent fixture: ${fixtures[0].fixture.id}`);
      }
    } else {
      console.log('❌ No H2H fixtures found');
    }
  } catch (error) {
    console.log(`❌ H2H search error: ${error.response?.status || error.message}`);
  }

  // 1.3. Test all coverage blocks
  if (results.apiFootball.fixtureId) {
    const fixtureId = results.apiFootball.fixtureId;
    console.log(`\n1.3. Testing coverage blocks for fixture ${fixtureId}...`);
    
    const endpoints = [
      { name: 'statistics', path: 'fixtures/statistics' },
      { name: 'events', path: 'fixtures/events' },
      { name: 'lineups', path: 'fixtures/lineups' },
      { name: 'odds', path: 'odds' },
      { name: 'predictions', path: 'predictions' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`);
        const response = await axios.get(`https://v3.football.api-sports.io/${endpoint.path}`, {
          headers: {
            'x-apisports-key': APIFOOTBALL_API_KEY
          },
          params: { fixture: fixtureId },
          timeout: 15000
        });

        const data = response.data?.response || [];
        results.apiFootball[endpoint.name] = data.length;
        console.log(`   ${endpoint.name}: ${data.length} records`);
        
        // Show sample data for events
        if (endpoint.name === 'events' && data.length > 0) {
          console.log(`     Sample: ${data[0].time.elapsed}' ${data[0].type} (${data[0].team.name})`);
        }
        
      } catch (error) {
        console.log(`   ${endpoint.name}: ERROR (${error.response?.status || error.code})`);
        results.apiFootball[endpoint.name] = 0;
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // ========================================
  // 2. ALLSPORTS API (V2) TESTING
  // ========================================

  console.log('\n🔍 2. ALLSPORTS API (V2) TESTING');
  console.log('=' .repeat(50));

  // 2.1. Check fixture directly by matchId
  console.log('\n2.1. Checking fixture by matchId (1499505)...');
  try {
    const matchResponse = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        matchId: '1499505',
        APIkey: ALLSPORTS_API_KEY
      },
      timeout: 20000
    });

    const success = matchResponse.data?.success;
    const matches = matchResponse.data?.result || [];
    results.allSports.matchDirect = { success, count: matches.length };
    
    if (success === 1 && matches.length > 0) {
      const match = matches[0];
      console.log('✅ Match found directly:');
      console.log(`   📋 ${match.event_home_team} vs ${match.event_away_team}`);
      console.log(`   📅 Date: ${match.event_date}`);
      console.log(`   ⚽ Score: ${match.event_final_result}`);
      console.log(`   🏆 League: ${match.league_name}`);
      console.log(`   🆔 Home Team: ${match.home_team_key}`);
      console.log(`   🆔 Away Team: ${match.away_team_key}`);
    } else {
      console.log(`❌ Match not found (success: ${success})`);
    }
  } catch (error) {
    console.log(`❌ Direct match error: ${error.response?.status || error.message}`);
  }

  // 2.2. Team fallback check
  console.log('\n2.2. Team fallback check (teamId 11699)...');
  try {
    const teamResponse = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        teamId: '11699',
        from: '2025-01-01',
        to: '2025-12-31',
        APIkey: ALLSPORTS_API_KEY
      },
      timeout: 20000
    });

    const teamMatches = teamResponse.data?.result || [];
    const targetMatch = teamMatches.find(m => 
      m.away_team_key === 11230 || m.home_team_key === 11230
    );
    
    results.allSports.teamFallback = { 
      totalMatches: teamMatches.length,
      targetFound: !!targetMatch
    };
    
    console.log(`✅ Team matches found: ${teamMatches.length}`);
    if (targetMatch) {
      console.log(`🎯 Target match confirmed via team search`);
      console.log(`   📋 ${targetMatch.event_home_team} vs ${targetMatch.event_away_team}`);
    } else {
      console.log(`⚠️  Target opponent (11230) not found in team matches`);
    }
  } catch (error) {
    console.log(`❌ Team fallback error: ${error.response?.status || error.message}`);
  }

  // 2.3. Test statistics and lineups
  console.log('\n2.3. Testing statistics and lineups...');
  
  const allSportsEndpoints = [
    { name: 'statistics', met: 'Statistics' },
    { name: 'lineups', met: 'Lineups' },
    { name: 'odds', met: 'Odds' }
  ];

  for (const endpoint of allSportsEndpoints) {
    try {
      console.log(`   Testing ${endpoint.name}...`);
      const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: endpoint.met,
          matchId: '1499505',
          APIkey: ALLSPORTS_API_KEY
        },
        timeout: 15000
      });

      const success = response.data?.success;
      const data = response.data?.result || [];
      results.allSports[endpoint.name] = { success, count: Array.isArray(data) ? data.length : (data ? 1 : 0) };
      
      console.log(`   ${endpoint.name}: success=${success}, records=${results.allSports[endpoint.name].count}`);
      
    } catch (error) {
      console.log(`   ${endpoint.name}: ERROR (${error.response?.status || error.code})`);
      results.allSports[endpoint.name] = { success: 0, count: 0 };
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // ========================================
  // 3. RESULTS INTERPRETATION
  // ========================================

  console.log('\n📋 3. RESULTS INTERPRETATION');
  console.log('=' .repeat(50));

  // API-Football Summary
  console.log('\n🔄 API-FOOTBALL V3 SUMMARY:');
  console.log(`   🏆 League Coverage: ${results.apiFootball.leagueCoverage ? '✅ Yes' : '❌ No'}`);
  console.log(`   🆔 Fixture Found: ${results.apiFootball.fixtureId ? '✅ Yes' : '❌ No'} (${results.apiFootball.fixtureId || 'N/A'})`);
  console.log(`   📈 Statistics: ${results.apiFootball.statistics || 0} records`);
  console.log(`   🎯 Events: ${results.apiFootball.events || 0} records`);
  console.log(`   👔 Lineups: ${results.apiFootball.lineups || 0} records`);
  console.log(`   🎲 Odds: ${results.apiFootball.odds || 0} records`);
  console.log(`   🔮 Predictions: ${results.apiFootball.predictions || 0} records`);

  // AllSports Summary
  console.log('\n🔍 ALLSPORTS API V2 SUMMARY:');
  console.log(`   🎯 Direct Match: ${results.allSports.matchDirect?.success === 1 ? '✅ Found' : '❌ Not Found'}`);
  console.log(`   🔄 Team Fallback: ${results.allSports.teamFallback?.targetFound ? '✅ Confirmed' : '⚠️  Limited'} (${results.allSports.teamFallback?.totalMatches || 0} total matches)`);
  console.log(`   📈 Statistics: ${results.allSports.statistics?.success === 1 ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   👔 Lineups: ${results.allSports.lineups?.success === 1 ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   🎲 Odds: ${results.allSports.odds?.success === 1 ? '✅ Available' : '❌ Not Available'}`);

  // Final Interpretation
  console.log('\n🎯 FINAL INTERPRETATION:');
  
  const apiFootballScore = (results.apiFootball.leagueCoverage ? 1 : 0) + 
                          (results.apiFootball.fixtureId ? 1 : 0) + 
                          (results.apiFootball.events > 0 ? 1 : 0) + 
                          (results.apiFootball.statistics > 0 ? 1 : 0);
  
  const allSportsScore = (results.allSports.matchDirect?.success === 1 ? 2 : 0) + 
                        (results.allSports.teamFallback?.targetFound ? 1 : 0) + 
                        (results.allSports.statistics?.success === 1 ? 1 : 0);

  if (apiFootballScore >= 3 && allSportsScore >= 3) {
    console.log('🌟 EXCELLENT: Both APIs provide comprehensive data');
    console.log('📊 Recommendation: Use both APIs for complete coverage');
  } else if (apiFootballScore >= 2 || allSportsScore >= 2) {
    console.log('✅ GOOD: At least one API provides sufficient data');
    console.log(`📊 Primary: ${apiFootballScore > allSportsScore ? 'API-Football' : 'AllSports'}`);
  } else {
    console.log('⚠️  LIMITED: Both APIs have limited coverage for this match');
    console.log('📊 Recommendation: Use basic data + estimation for missing stats');
  }

  // Save results
  require('fs').writeFileSync('systematic-validation-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to: systematic-validation-results.json');
  console.log('\n✅ 5-MINUTE VALIDATION COMPLETE!');

  return results;
}

systematicAPIValidation().catch(console.error);
