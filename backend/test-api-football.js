const axios = require('axios');

async function testApiFootball() {
  try {
    console.log('🔍 Testing API Football service...');
    
    const API_KEY = '26703e5120975e64fc728bb2661f9acd';
    const BASE_URL = 'https://v3.football.api-sports.io';
    
    // Test 1: Basic API connection
    console.log('\n1. Testing basic API connection...');
    const response = await axios.get(`${BASE_URL}/status`, {
      headers: {
        'x-apisports-key': API_KEY
      },
      timeout: 10000
    });
    
    console.log('✅ API Football connection successful');
    console.log('📊 API Status:', {
      account: response.data.response.account,
      subscription: response.data.response.subscription,
      requests: response.data.response.requests
    });
    
    // Test 2: Search for a team
    console.log('\n2. Testing team search...');
    const teamResponse = await axios.get(`${BASE_URL}/teams`, {
      headers: {
        'x-apisports-key': API_KEY
      },
      params: {
        search: 'Brommapojkarna'
      },
      timeout: 10000
    });
    
    if (teamResponse.data.response && teamResponse.data.response.length > 0) {
      const team = teamResponse.data.response[0].team;
      console.log('✅ Team search successful');
      console.log('📋 Team found:', {
        id: team.id,
        name: team.name,
        country: team.country,
        logo: team.logo
      });
      
      // Test 3: Get team fixtures
      console.log('\n3. Testing team fixtures...');
      const fixturesResponse = await axios.get(`${BASE_URL}/fixtures`, {
        headers: {
          'x-apisports-key': API_KEY
        },
        params: {
          team: team.id,
          last: 5,
          status: 'FT'
        },
        timeout: 10000
      });
      
      console.log('✅ Fixtures request successful');
      console.log('📊 Fixtures found:', fixturesResponse.data.response.length);
      
      if (fixturesResponse.data.response.length > 0) {
        const fixture = fixturesResponse.data.response[0];
        console.log('📋 Sample fixture:', {
          id: fixture.fixture.id,
          date: fixture.fixture.date,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          status: fixture.fixture.status.long
        });
        
        // Test 4: Get match statistics
        console.log('\n4. Testing match statistics...');
        const statsResponse = await axios.get(`${BASE_URL}/fixtures/statistics`, {
          headers: {
            'x-apisports-key': API_KEY
          },
          params: {
            fixture: fixture.fixture.id
          },
          timeout: 10000
        });
        
        console.log('✅ Statistics request successful');
        console.log('📊 Statistics found:', statsResponse.data.response.length);
        
        if (statsResponse.data.response.length > 0) {
          const homeStats = statsResponse.data.response[0];
          const cornerStat = homeStats.statistics?.find(stat => stat.type === 'Corner Kicks');
          
          console.log('📋 Corner statistics:', {
            team: homeStats.team.name,
            corners: cornerStat ? cornerStat.value : 'Not found'
          });
        }
      }
    } else {
      console.log('❌ Team search failed - no results');
    }
    
    console.log('\n🏁 API Football test completed successfully');
    
  } catch (error) {
    console.error('❌ API Football test failed:', error.message);
    if (error.response) {
      console.error('📋 Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
}

// Run the test
testApiFootball().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
