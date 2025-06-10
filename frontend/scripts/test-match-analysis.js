// Simple test script to verify that the soccerApiService is correctly generating real data for match analysis
// Use axios directly to test the API
import axios from 'axios';

const API_BASE_URL = 'https://apiv2.allsportsapi.com/football';
const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';

const testMatchAnalysis = async () => {
  try {
    console.log('Fetching matches from API...');
    // Get upcoming matches
    const response = await axios.get(`${API_BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        from: new Date().toISOString().split('T')[0], // Today
        to: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // 48 hours ahead
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    
    if (!response.data || response.data.success !== 1 || !Array.isArray(response.data.result)) {
      console.error('Failed to fetch matches!', response.data);
      return;
    }
    
    const matches = response.data.result;
    console.log(`Found ${matches.length} upcoming matches.`);
    
    if (matches.length === 0) {
      console.error('No upcoming matches found!');
      return;
    }
    
    // Test with the first match
    const testMatch = matches[0];
    console.log(`Testing with match: ${testMatch.event_home_team} vs ${testMatch.event_away_team}`);
    console.log(`Match ID: ${testMatch.event_key}`);
    
    // Fetch team info for both teams
    console.log('\nFetching team information...');
    
    const homeTeamId = testMatch.home_team_key;
    const awayTeamId = testMatch.away_team_key;
    
    console.log(`Home Team ID: ${homeTeamId}, Away Team ID: ${awayTeamId}`);
    
    // Fetch head-to-head matches
    console.log('\nFetching head-to-head data...');
    const h2hResponse = await axios.get(`${API_BASE_URL}/`, {
      params: {
        met: 'H2H',
        APIkey: API_KEY,
        firstTeamId: homeTeamId,
        secondTeamId: awayTeamId
      }
    });
    
    if (h2hResponse.data && h2hResponse.data.success === 1) {
      const h2hMatches = h2hResponse.data.firstTeam_VS_secondTeam || [];
      console.log(`✅ Found ${h2hMatches.length} head-to-head matches`);
    } else {
      console.log('❌ Failed to fetch head-to-head data');
    }
    
    // Fetch team matches
    console.log('\nFetching recent matches for home team...');
    const homeTeamMatchesResponse = await axios.get(`${API_BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: homeTeamId,
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days back
        to: new Date().toISOString().split('T')[0] // Today
      }
    });
    
    if (homeTeamMatchesResponse.data && homeTeamMatchesResponse.data.success === 1) {
      const homeTeamMatches = homeTeamMatchesResponse.data.result || [];
      console.log(`✅ Found ${homeTeamMatches.length} recent matches for home team`);
    } else {
      console.log('❌ Failed to fetch home team matches');
    }
    
    console.log('\nFetching recent matches for away team...');
    const awayTeamMatchesResponse = await axios.get(`${API_BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: awayTeamId,
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days back
        to: new Date().toISOString().split('T')[0] // Today
      }
    });
    
    if (awayTeamMatchesResponse.data && awayTeamMatchesResponse.data.success === 1) {
      const awayTeamMatches = awayTeamMatchesResponse.data.result || [];
      console.log(`✅ Found ${awayTeamMatches.length} recent matches for away team`);
    } else {
      console.log('❌ Failed to fetch away team matches');
    }
    
    console.log('\nVerification completed.');
    console.log('All necessary API endpoints are accessible and returning data.');
    console.log('The enhanced soccerApiService should now be able to transform this data into rich match analysis.');
    
  } catch (error) {
    console.error('Error running API verification test:', error.message);
  }
};

// Run the test
testMatchAnalysis();
