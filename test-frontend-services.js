// This script simulates what the frontend services should be doing
const axios = require('axios');

const MATCH_ID = '1524058';
const BACKEND_BASE_URL = 'http://localhost:5000/api';

// Simulate cornerStatsService.fetchCornerStats
async function testCornerStatsService() {
  try {
    console.log('🔄 Testing Corner Stats Service');
    
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${MATCH_ID}/corners`, {
      params: { matches: 10 },
      timeout: 15000
    });
    
    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend corner statistics endpoint');
    }
    
    console.log('✅ Corner Stats Service: SUCCESS');
    console.log('   - Response structure valid');
    console.log(`   - Data source: ${response.data.result.dataSource}`);
    return response.data.result;
  } catch (error) {
    console.log('❌ Corner Stats Service: FAILED');
    console.log(`   - Error: ${error.message}`);
    throw error;
  }
}

// Simulate cardStatsService.fetchCardStats
async function testCardStatsService() {
  try {
    console.log('🔄 Testing Card Stats Service');
    
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${MATCH_ID}/cards`, {
      params: { matches: 10 },
      timeout: 15000
    });
    
    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend card statistics endpoint');
    }
    
    console.log('✅ Card Stats Service: SUCCESS');
    console.log('   - Response structure valid');
    console.log(`   - Home avg cards: ${response.data.result.homeStats?.averageCardsPerMatch || 'N/A'}`);
    console.log(`   - Away avg cards: ${response.data.result.awayStats?.averageCardsPerMatch || 'N/A'}`);
    return response.data.result;
  } catch (error) {
    console.log('❌ Card Stats Service: FAILED');
    console.log(`   - Error: ${error.message}`);
    throw error;
  }
}

// Simulate bttsStatsService.fetchBTTSStats
async function testBTTSStatsService() {
  try {
    console.log('🔄 Testing BTTS Stats Service');
    
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${MATCH_ID}/btts`, {
      params: { matches: 10 },
      timeout: 15000
    });
    
    if (!response.data || !response.data.success || !response.data.result) {
      throw new Error('Invalid response from backend BTTS statistics endpoint');
    }
    
    console.log('✅ BTTS Stats Service: SUCCESS');
    console.log('   - Response structure valid');
    console.log(`   - Home BTTS: ${response.data.result.homeStats?.bttsYesPercentage || 'N/A'}%`);
    console.log(`   - Away BTTS: ${response.data.result.awayStats?.bttsYesPercentage || 'N/A'}%`);
    return response.data.result;
  } catch (error) {
    console.log('❌ BTTS Stats Service: FAILED');
    console.log(`   - Error: ${error.message}`);
    throw error;
  }
}

// Simulate direct H2H call (like in SpecialMatch.tsx)
async function testH2HService() {
  try {
    console.log('🔄 Testing H2H Service (Direct Call)');
    
    const response = await axios.get(`${BACKEND_BASE_URL}/matches/${MATCH_ID}/h2h`, {
      timeout: 15000
    });
    
    if (!response.data?.success || !response.data.result) {
      throw new Error('Invalid H2H response');
    }
    
    const h2hData = response.data.result;
    
    // Validate H2H data structure (like in SpecialMatch.tsx)
    if (h2hData.matches && h2hData.summary) {
      console.log('✅ H2H Service: SUCCESS');
      console.log('   - Response structure valid');
      console.log(`   - Total matches: ${h2hData.matches.length}`);
      console.log(`   - Summary available: ${!!h2hData.summary}`);
      return h2hData;
    } else {
      console.log('⚠️ H2H Service: Invalid data structure');
      return null;
    }
  } catch (error) {
    console.log('❌ H2H Service: FAILED');
    console.log(`   - Error: ${error.message}`);
    return null;
  }
}

// Test match data fetching (like in SpecialMatch.tsx)
async function testMatchDataFetching() {
  try {
    console.log('🔄 Testing Match Data Fetching');
    
    // Try unified endpoint first (like in SpecialMatch.tsx)
    let response;
    try {
      response = await axios.get(`${BACKEND_BASE_URL}/admin/matches/${MATCH_ID}/unified`, {
        timeout: 15000
      });
      console.log('   - Using unified match endpoint');
    } catch (unifiedError) {
      console.log('   - Unified endpoint failed, trying standard endpoint');
      response = await axios.get(`${BACKEND_BASE_URL}/matches/${MATCH_ID}`, {
        timeout: 15000
      });
    }
    
    if (response.data && response.data.success && response.data.result) {
      console.log('✅ Match Data Fetching: SUCCESS');
      
      const result = response.data.result;
      
      // Check if it's unified format
      if (result.universal) {
        console.log('   - Format: Unified system data');
        console.log(`   - Home Team: ${result.universal.homeTeam?.name || 'Unknown'}`);
        console.log(`   - Away Team: ${result.universal.awayTeam?.name || 'Unknown'}`);
      } else {
        console.log('   - Format: Standard format data');
        console.log(`   - Home Team: ${result.event_home_team || result.homeTeam?.name || 'Unknown'}`);
        console.log(`   - Away Team: ${result.event_away_team || result.awayTeam?.name || 'Unknown'}`);
      }
      
      return result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.log('❌ Match Data Fetching: FAILED');
    console.log(`   - Error: ${error.message}`);
    throw error;
  }
}

async function runAllTests() {
  console.log('🧪 Testing Frontend Services Simulation');
  console.log(`📍 Match ID: ${MATCH_ID}`);
  console.log(`🌐 Backend URL: ${BACKEND_BASE_URL}`);
  console.log('');
  
  const tests = [
    { name: 'Match Data Fetching', fn: testMatchDataFetching },
    { name: 'H2H Service', fn: testH2HService },
    { name: 'Corner Stats Service', fn: testCornerStatsService },
    { name: 'Card Stats Service', fn: testCardStatsService },
    { name: 'BTTS Stats Service', fn: testBTTSStatsService }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passedTests++;
    } catch (error) {
      // Error already logged in individual test functions
    }
    console.log('');
  }
  
  console.log('📊 Frontend Services Test Summary:');
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('');
    console.log('🎉 All frontend services should work correctly!');
    console.log('');
    console.log('🔍 If tabs are still not working, check:');
    console.log('   1. Browser console for JavaScript errors');
    console.log('   2. Network tab for failed requests');
    console.log('   3. Component state management');
    console.log('   4. React rendering errors');
    console.log('');
    console.log('💡 Possible solutions:');
    console.log('   - Hard refresh the browser (Ctrl+F5)');
    console.log('   - Clear browser cache');
    console.log('   - Check if frontend is making requests to correct URL');
    console.log('   - Verify component error boundaries');
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
});
