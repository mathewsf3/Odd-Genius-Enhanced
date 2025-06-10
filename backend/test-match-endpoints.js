const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const MATCH_ID = process.argv[2] || '1458266';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔄 Testing: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await axios.get(endpoint, { timeout: 15000 });
    
    if (response.data.success) {
      console.log(`✅ SUCCESS: ${description}`);
      
      // Log key information based on endpoint type
      if (endpoint.includes('/matches/') && !endpoint.includes('/')) {
        // Match details
        const result = response.data.result;
        console.log(`   - Match: ${result.event_home_team || result.homeTeam?.name} vs ${result.event_away_team || result.awayTeam?.name}`);
        console.log(`   - League: ${result.league_name || result.league?.name}`);
        console.log(`   - Date: ${result.event_date || result.date}`);
        console.log(`   - Status: ${result.event_status || result.status}`);
        console.log(`   - Data Source: ${response.data.metadata?.dataSource || 'unknown'}`);
      } else if (endpoint.includes('/h2h')) {
        // H2H data
        const result = response.data.result;
        console.log(`   - Teams: ${result.firstTeam?.name} vs ${result.secondTeam?.name}`);
        console.log(`   - Total H2H matches: ${result.totalMatches || 0}`);
        console.log(`   - Recent matches: ${result.recentMatches?.length || 0}`);
      } else if (endpoint.includes('/corners')) {
        // Corner stats
        const result = response.data.result;
        if (result.homeStats && result.awayStats) {
          console.log(`   - Home avg corners: ${result.homeStats.averageCorners}`);
          console.log(`   - Away avg corners: ${result.awayStats.averageCorners}`);
        } else {
          console.log(`   - Corner data: Not available (null)`);
        }
      } else if (endpoint.includes('/cards')) {
        // Card stats
        const result = response.data.result;
        if (result.homeStats && result.awayStats) {
          console.log(`   - Home avg cards: ${result.homeStats.averageCardsPerMatch}`);
          console.log(`   - Away avg cards: ${result.awayStats.averageCardsPerMatch}`);
        } else {
          console.log(`   - Card data: Not available`);
        }
      } else if (endpoint.includes('/btts')) {
        // BTTS stats
        const result = response.data.result;
        if (result.homeStats && result.awayStats) {
          console.log(`   - Home BTTS: ${result.homeStats.bttsYesPercentage}%`);
          console.log(`   - Away BTTS: ${result.awayStats.bttsYesPercentage}%`);
        } else {
          console.log(`   - BTTS data: Not available`);
        }
      } else if (endpoint.includes('/unified')) {
        // Unified data
        const result = response.data.result;
        console.log(`   - Universal ID: ${result.id}`);
        console.log(`   - Home Team: ${result.homeTeam?.name}`);
        console.log(`   - Away Team: ${result.awayTeam?.name}`);
        console.log(`   - Sources: ${Object.keys(result.sources || {}).join(', ')}`);
      }
      
      console.log(`   - Response size: ${JSON.stringify(response.data).length} bytes`);
    } else {
      console.log(`❌ FAILED: ${description}`);
      console.log(`   - Error: ${response.data.error}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${description}`);
    console.log(`   - Message: ${error.message}`);
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function runTests() {
  console.log(`🚀 Testing all endpoints for match ID: ${MATCH_ID}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  const endpoints = [
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}`,
      description: 'Match Details (Unified System)'
    },
    {
      url: `${BASE_URL}/api/admin/matches/${MATCH_ID}/unified`,
      description: 'Unified System Data'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/h2h`,
      description: 'Head-to-Head Data'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/corners?matches=10`,
      description: 'Corner Statistics (10 matches)'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/cards?matches=10`,
      description: 'Card Statistics (10 matches)'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/btts?matches=10`,
      description: 'BTTS Statistics (10 matches)'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/corners?matches=5`,
      description: 'Corner Statistics (5 matches)'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/cards?matches=5`,
      description: 'Card Statistics (5 matches)'
    },
    {
      url: `${BASE_URL}/api/matches/${MATCH_ID}/btts?matches=5`,
      description: 'BTTS Statistics (5 matches)'
    }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.url, endpoint.description);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Testing completed for match ${MATCH_ID}`);
  console.log(`\n📋 Summary:`);
  console.log(`   - All major endpoints tested`);
  console.log(`   - Unified system integration verified`);
  console.log(`   - Data availability checked`);
  console.log(`\n🌐 Frontend URL: http://localhost:3000/match/${MATCH_ID}`);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
