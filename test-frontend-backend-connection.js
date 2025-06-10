const axios = require('axios');

const MATCH_ID = '1524058';
const BASE_URL = 'http://localhost:5000/api';

async function testFrontendBackendConnection() {
  console.log('🧪 Testing Frontend-Backend Connection');
  console.log(`📍 Match ID: ${MATCH_ID}`);
  console.log(`🌐 Backend URL: ${BASE_URL}`);
  console.log('');

  const tests = [
    {
      name: 'Match Details',
      url: `${BASE_URL}/matches/${MATCH_ID}`,
      timeout: 10000
    },
    {
      name: 'Unified Match Data',
      url: `${BASE_URL}/admin/matches/${MATCH_ID}/unified`,
      timeout: 10000
    },
    {
      name: 'H2H Data',
      url: `${BASE_URL}/matches/${MATCH_ID}/h2h`,
      timeout: 10000
    },
    {
      name: 'Corner Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/corners?matches=10`,
      timeout: 10000
    },
    {
      name: 'Card Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/cards?matches=10`,
      timeout: 15000
    },
    {
      name: 'BTTS Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/btts?matches=10`,
      timeout: 15000
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔄 Testing: ${test.name}`);
      
      const startTime = Date.now();
      const response = await axios.get(test.url, { 
        timeout: test.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      
      if (response.status === 200 && response.data) {
        console.log(`✅ ${test.name}: SUCCESS (${endTime - startTime}ms)`);
        
        if (response.data.success) {
          console.log(`   - API Success: ${response.data.success}`);
          
          if (response.data.result) {
            if (test.name === 'Match Details' || test.name === 'Unified Match Data') {
              const result = response.data.result;
              console.log(`   - Home Team: ${result.event_home_team || result.homeTeam?.name || result.universal?.homeTeam?.name || 'Unknown'}`);
              console.log(`   - Away Team: ${result.event_away_team || result.awayTeam?.name || result.universal?.awayTeam?.name || 'Unknown'}`);
            } else if (test.name === 'H2H Data') {
              console.log(`   - Total H2H Matches: ${response.data.result.summary?.totalMatches || 0}`);
            } else if (test.name === 'Corner Stats') {
              const result = response.data.result;
              if (result.homeStats && result.awayStats) {
                console.log(`   - Home Avg Corners: ${result.homeStats.averageCorners}`);
                console.log(`   - Away Avg Corners: ${result.awayStats.averageCorners}`);
              } else {
                console.log(`   - Corner Data: ${result.message || 'No data available'}`);
              }
            } else if (test.name === 'Card Stats') {
              const result = response.data.result;
              if (result.homeStats && result.awayStats) {
                console.log(`   - Home Avg Cards: ${result.homeStats.averageCardsPerMatch}`);
                console.log(`   - Away Avg Cards: ${result.awayStats.averageCardsPerMatch}`);
              } else {
                console.log(`   - Card Data: No data available`);
              }
            } else if (test.name === 'BTTS Stats') {
              const result = response.data.result;
              if (result.homeStats && result.awayStats) {
                console.log(`   - Home BTTS: ${result.homeStats.bttsYesPercentage}%`);
                console.log(`   - Away BTTS: ${result.awayStats.bttsYesPercentage}%`);
              } else {
                console.log(`   - BTTS Data: No data available`);
              }
            }
          } else {
            console.log(`   - No result data`);
          }
        } else {
          console.log(`   - API Success: false`);
          console.log(`   - Error: ${response.data.error || 'Unknown error'}`);
        }
        
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED - Invalid response`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.log(`   - Timeout after ${test.timeout}ms`);
        } else if (error.response) {
          console.log(`   - Status: ${error.response.status}`);
          console.log(`   - Message: ${error.response.data?.error || error.message}`);
        } else if (error.request) {
          console.log(`   - No response received`);
          console.log(`   - Request error: ${error.message}`);
        } else {
          console.log(`   - Request setup error: ${error.message}`);
        }
      } else {
        console.log(`   - Error: ${error.message}`);
      }
    }
    
    console.log('');
  }

  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('');
    console.log('🔍 If frontend tabs are not working, the issue is likely:');
    console.log('   1. JavaScript errors in browser console');
    console.log('   2. CORS issues (check browser network tab)');
    console.log('   3. Frontend not making requests properly');
    console.log('   4. Component rendering errors');
    console.log('');
    console.log('🌐 Frontend URL: http://localhost:3001/match/1524058');
    console.log('🔧 Check browser console for errors');
  } else {
    console.log('⚠️ Some backend endpoints are not working properly.');
  }
}

// Run the test
testFrontendBackendConnection().catch(error => {
  console.error('❌ Test suite failed:', error);
});
