const axios = require('axios');

// Test script to debug the corner stats issue for live matches
async function debugLiveMatchCornerIssue() {
  console.log('🔍 Debugging Live Match Corner Stats Issue...\n');

  try {
    // Get a live match
    console.log('1. Fetching live matches...');
    const liveResponse = await axios.get('http://localhost:5000/api/matches/live');
    const liveMatches = liveResponse.data.result || [];

    if (liveMatches.length === 0) {
      console.log('❌ No live matches found');
      return;
    }

    const testMatch = liveMatches[0];
    console.log(`✅ Using live match: ${testMatch.homeTeam.name} vs ${testMatch.awayTeam.name} (ID: ${testMatch.id})`);
    console.log(`   Home Team ID: ${testMatch.homeTeam.id}`);
    console.log(`   Away Team ID: ${testMatch.awayTeam.id}`);

    // Test corner stats with detailed logging
    console.log('\n2. Testing corner stats...');
    try {
      const response = await axios.get(`http://localhost:5000/api/matches/${testMatch.id}/corners`);
      const cornerStats = response.data.result;

      console.log('\n=== CORNER STATS RESULT ===');
      console.log('Home Stats:');
      console.log(`  Matches Analyzed: ${cornerStats.homeStats?.matchesAnalyzed || 0}`);
      console.log(`  Average Corners: ${cornerStats.homeStats?.averageCorners || 0}`);
      console.log(`  Recent Form: ${JSON.stringify(cornerStats.homeStats?.recentForm || [])}`);

      console.log('\nAway Stats:');
      console.log(`  Matches Analyzed: ${cornerStats.awayStats?.matchesAnalyzed || 0}`);
      console.log(`  Average Corners: ${cornerStats.awayStats?.averageCorners || 0}`);
      console.log(`  Recent Form: ${JSON.stringify(cornerStats.awayStats?.recentForm || [])}`);

      // Check if we can fetch raw team data directly
      console.log('\n3. Testing direct team data fetch...');
      
      // Extract clean team IDs
      const homeTeamId = testMatch.homeTeam.id.replace('team-', '');
      const awayTeamId = testMatch.awayTeam.id.replace('team-', '');
      
      console.log(`   Clean Home Team ID: ${homeTeamId}`);
      console.log(`   Clean Away Team ID: ${awayTeamId}`);

      // Test direct API call for away team
      const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
      const fromDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];

      const directResponse = await axios.get(`https://apiv2.allsportsapi.com/football/`, {
        params: {
          met: 'Fixtures',
          APIkey: API_KEY,
          teamId: awayTeamId,
          from: fromDate,
          to: toDate
        },
        timeout: 10000
      });

      console.log(`\n4. Direct API Response for Away Team (${awayTeamId}):`);
      console.log(`   Total matches returned: ${directResponse.data.result?.length || 0}`);
      
      if (directResponse.data.result && directResponse.data.result.length > 0) {
        const matches = directResponse.data.result;
        console.log(`   First 3 match dates: ${matches.slice(0, 3).map(m => m.event_date || m.match_date).join(', ')}`);
        console.log(`   First 3 match statuses: ${matches.slice(0, 3).map(m => m.event_status || m.match_status).join(', ')}`);
        
        // Check if any matches have corner data
        const matchesWithCorners = matches.filter(m => m.match_hometeam_corner_count || m.match_awayteam_corner_count);
        console.log(`   Matches with corner data: ${matchesWithCorners.length}`);
      }

    } catch (error) {
      console.error('❌ Error testing corner stats:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLiveMatchCornerIssue().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});
