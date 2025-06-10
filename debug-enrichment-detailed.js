const axios = require('axios');

const BASE_URL = 'https://allsportsapi.com/api/football';
const API_KEY = process.env.ALLSPORTS_API_KEY || 'bbc36e8d00a7b838d956ce7c1ee19a02b1fcc89d7c6c71a4aa8e85c6dcd5cf72';

async function debugEnrichment() {
  try {
    console.log('🔍 Debugging enrichWithStats function in detail...');
    
    // Get team 7417 matches directly
    console.log('Fetching team 7417 matches directly...');
    const response = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '7417',
        from: '2024-05-27',
        to: '2025-05-27'
      },
      timeout: 10000
    });
    
    if (!response.data || !response.data.result) {
      console.log('❌ No data returned for team 7417');
      return;
    }
    
    const team7417Matches = response.data.result.slice(0, 5);    console.log(`\n✅ Found ${team7417Matches.length} matches for team 7417`);
    
    // Take first match and examine it
    if (team7417Matches.length > 0) {
      const firstMatch = team7417Matches[0];
      console.log('\n=== FIRST MATCH BEFORE ENRICHMENT ===');
      console.log('Event Key:', firstMatch.event_key);
      console.log('Home Team:', firstMatch.event_home_team);
      console.log('Away Team:', firstMatch.event_away_team);
      console.log('Date:', firstMatch.event_date);
      console.log('Time:', firstMatch.event_time);
      console.log('Status:', firstMatch.event_status);
      console.log('Corner Home:', firstMatch.corner_home);
      console.log('Corner Away:', firstMatch.corner_away);
      console.log('Has Statistics Array:', !!firstMatch.statistics);
      console.log('Statistics Length:', firstMatch.statistics ? firstMatch.statistics.length : 0);
      
      // Check all possible corner field names
      const cornerFields = [
        'corner_home', 'corner_away',
        'corners_home', 'corners_away', 
        'home_corners', 'away_corners',
        'match_hometeam_corners', 'match_awayteam_corners',
        'event_home_corners', 'event_away_corners'
      ];
      
      console.log('\n=== CHECKING ALL CORNER FIELDS ===');
      cornerFields.forEach(field => {
        if (firstMatch[field] !== undefined) {
          console.log(`${field}:`, firstMatch[field]);
        }
      });
      
      // Now test enrichment manually
      console.log('\n=== TESTING ENRICHMENT ===');
      
      // Direct Statistics API call
      console.log('Making direct Statistics API call...');
      const statsResponse = await axios.get(`${BASE_URL}/`, {
        params: {
          met: 'Statistics',
          APIkey: API_KEY,
          matchId: firstMatch.event_key
        },
        timeout: 10000
      });
      
      console.log('Statistics API Response:', JSON.stringify(statsResponse.data, null, 2));
      
      // Try with numeric ID
      const numericId = firstMatch.event_key.toString().replace(/[^0-9]/g, '');
      if (numericId !== firstMatch.event_key) {
        console.log(`\nTrying with numeric ID: ${numericId}`);
        const numericStatsResponse = await axios.get(`${BASE_URL}/`, {
          params: {
            met: 'Statistics',
            APIkey: API_KEY,
            matchId: numericId
          },
          timeout: 10000
        });
        console.log('Numeric Statistics API Response:', JSON.stringify(numericStatsResponse.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error in debug enrichment:', error);
  }
}

debugEnrichment();
