#!/usr/bin/env node

/**
 * 🔍 DEBUG LEAGUES API CALLS
 * 
 * Test the actual API calls to see why leagues are not loading
 */

const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const ALLSPORTS_BASE_URL = 'https://apiv2.allsportsapi.com/football';
const BACKEND_BASE_URL = 'http://localhost:5000/api';

async function debugLeaguesAPI() {
  console.log('🔍 DEBUGGING LEAGUES API CALLS');
  console.log('===============================\n');

  try {
    // Test 1: Direct AllSportsAPI leagues call
    console.log('📊 TEST 1: Direct AllSportsAPI Leagues Call');
    console.log('-------------------------------------------');
    
    const leaguesResponse = await axios.get(ALLSPORTS_BASE_URL, {
      params: {
        met: 'Leagues',
        APIkey: API_KEY
      },
      timeout: 15000
    });

    console.log(`✅ Status: ${leaguesResponse.status}`);
    console.log(`📊 Success: ${leaguesResponse.data?.success}`);
    console.log(`📊 Result count: ${leaguesResponse.data?.result?.length || 0}`);
    
    if (leaguesResponse.data?.result && leaguesResponse.data.result.length > 0) {
      console.log('\n📋 Sample leagues:');
      leaguesResponse.data.result.slice(0, 5).forEach((league, i) => {
        console.log(`   ${i + 1}. ${league.league_name} (${league.country_name}) - ID: ${league.league_key}`);
      });
    } else {
      console.log('❌ No leagues data returned');
      console.log('Response data:', JSON.stringify(leaguesResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ AllSportsAPI Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  try {
    // Test 2: Backend live matches call
    console.log('\n📊 TEST 2: Backend Live Matches Call');
    console.log('------------------------------------');
    
    const liveResponse = await axios.get(`${BACKEND_BASE_URL}/matches/live`, {
      timeout: 10000
    });

    console.log(`✅ Status: ${liveResponse.status}`);
    console.log(`📊 Success: ${liveResponse.data?.success}`);
    console.log(`📊 Result count: ${liveResponse.data?.result?.length || 0}`);
    
    if (liveResponse.data?.result && liveResponse.data.result.length > 0) {
      console.log('\n📋 Sample live matches:');
      liveResponse.data.result.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.event_home_team} vs ${match.event_away_team}`);
        console.log(`      League: ${match.league_name || 'Unknown'} (ID: ${match.league_key || match.league_id || 'Unknown'})`);
      });
    } else {
      console.log('❌ No live matches data returned');
    }

  } catch (error) {
    console.error('❌ Backend Live Matches Error:', error.response?.status, error.message);
  }

  try {
    // Test 3: Backend upcoming matches call
    console.log('\n📊 TEST 3: Backend Upcoming Matches Call');
    console.log('----------------------------------------');
    
    const upcomingResponse = await axios.get(`${BACKEND_BASE_URL}/matches/upcoming`, {
      timeout: 10000
    });

    console.log(`✅ Status: ${upcomingResponse.status}`);
    console.log(`📊 Success: ${upcomingResponse.data?.success}`);
    console.log(`📊 Result count: ${upcomingResponse.data?.result?.length || 0}`);
    
    if (upcomingResponse.data?.result && upcomingResponse.data.result.length > 0) {
      console.log('\n📋 Sample upcoming matches:');
      upcomingResponse.data.result.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.event_home_team} vs ${match.event_away_team}`);
        console.log(`      League: ${match.league_name || 'Unknown'} (ID: ${match.league_key || match.league_id || 'Unknown'})`);
      });
    } else {
      console.log('❌ No upcoming matches data returned');
    }

  } catch (error) {
    console.error('❌ Backend Upcoming Matches Error:', error.response?.status, error.message);
  }

  // Test 4: Simulate the enhanced leagues function
  console.log('\n📊 TEST 4: Simulate Enhanced Leagues Function');
  console.log('---------------------------------------------');
  
  try {
    // This simulates what fetchEnhancedLeagues does
    const [leaguesResp, liveResp, upcomingResp] = await Promise.allSettled([
      axios.get(ALLSPORTS_BASE_URL, {
        params: { met: 'Leagues', APIkey: API_KEY },
        timeout: 15000
      }),
      axios.get(`${BACKEND_BASE_URL}/matches/live`, { timeout: 10000 }),
      axios.get(`${BACKEND_BASE_URL}/matches/upcoming`, { timeout: 10000 })
    ]);

    console.log('📊 Leagues API:', leaguesResp.status === 'fulfilled' ? '✅ Success' : '❌ Failed');
    console.log('📊 Live Matches:', liveResp.status === 'fulfilled' ? '✅ Success' : '❌ Failed');
    console.log('📊 Upcoming Matches:', upcomingResp.status === 'fulfilled' ? '✅ Success' : '❌ Failed');

    if (leaguesResp.status === 'fulfilled') {
      const leagues = leaguesResp.value.data?.result || [];
      const liveMatches = liveResp.status === 'fulfilled' ? (liveResp.value.data?.result || []) : [];
      const upcomingMatches = upcomingResp.status === 'fulfilled' ? (upcomingResp.value.data?.result || []) : [];

      console.log(`\n📊 Processing ${leagues.length} leagues with ${liveMatches.length} live and ${upcomingMatches.length} upcoming matches`);

      if (leagues.length > 0) {
        // Process first few leagues
        const processedLeagues = leagues.slice(0, 5).map(apiLeague => {
          const leagueId = apiLeague.league_key;
          
          // Count matches for this league
          const liveCount = liveMatches.filter(match => {
            const matchLeagueId = match.league?.id || match.league?.key || match.league_key || match.league_id;
            return matchLeagueId === leagueId || matchLeagueId === String(leagueId);
          }).length;
          
          const upcomingCount = upcomingMatches.filter(match => {
            const matchLeagueId = match.league?.id || match.league?.key || match.league_key || match.league_id;
            return matchLeagueId === leagueId || matchLeagueId === String(leagueId);
          }).length;
          
          // Determine status
          let status = 'finished';
          if (liveCount > 0) status = 'live';
          else if (upcomingCount > 0) status = 'upcoming';

          return {
            id: leagueId,
            name: apiLeague.league_name,
            country: apiLeague.country_name,
            status,
            liveMatches: liveCount,
            upcomingMatches: upcomingCount
          };
        });

        console.log('\n📋 Processed leagues sample:');
        processedLeagues.forEach((league, i) => {
          console.log(`   ${i + 1}. ${league.name} (${league.country})`);
          console.log(`      Status: ${league.status}, Live: ${league.liveMatches}, Upcoming: ${league.upcomingMatches}`);
        });

        // Check filtering
        const allStatusLeagues = processedLeagues.filter(() => true); // No filter
        const liveOnlyLeagues = processedLeagues.filter(l => l.status === 'live');
        const upcomingOnlyLeagues = processedLeagues.filter(l => l.status === 'upcoming');
        const withMatchesLeagues = processedLeagues.filter(l => l.liveMatches > 0 || l.upcomingMatches > 0);

        console.log('\n📊 Filtering results:');
        console.log(`   All leagues: ${allStatusLeagues.length}`);
        console.log(`   Live only: ${liveOnlyLeagues.length}`);
        console.log(`   Upcoming only: ${upcomingOnlyLeagues.length}`);
        console.log(`   With matches: ${withMatchesLeagues.length}`);

        if (allStatusLeagues.length === 0) {
          console.log('\n❌ ISSUE FOUND: No leagues after processing!');
        } else {
          console.log('\n✅ Leagues processing working correctly');
        }
      } else {
        console.log('\n❌ ISSUE FOUND: No leagues returned from API!');
      }
    }

  } catch (error) {
    console.error('❌ Enhanced leagues simulation error:', error.message);
  }

  console.log('\n🎯 DEBUGGING COMPLETE');
  console.log('====================');
}

// Run the debug
debugLeaguesAPI().catch(console.error);
