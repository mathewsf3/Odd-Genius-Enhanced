/**
 * Debug FootyStats Leagues Endpoint
 */

const axios = require('axios');

async function debugLeaguesEndpoint() {
  console.log('🔍 Debugging FootyStats leagues endpoint...\n');

  // Test 1: Direct FootyStats API
  console.log('1️⃣ Testing direct FootyStats API...');
  try {
    const response = await axios.get('https://api.football-data-api.com/league-list', {
      params: {
        key: '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756'
      },
      timeout: 10000
    });
    
    console.log(`✅ Direct API Success - ${response.status}`);
    console.log(`📊 Data size: ${JSON.stringify(response.data).length} bytes`);
    console.log(`📋 Success: ${response.data.success}`);
    console.log(`📋 Total results: ${response.data.pager?.total_results || 'unknown'}`);
    if (response.data.data && response.data.data.length > 0) {
      console.log(`📋 First league: ${response.data.data[0].name}`);
    }
    
  } catch (error) {
    console.log(`❌ Direct API Failed: ${error.message}`);
  }

  // Test 2: Our backend service
  console.log('\n2️⃣ Testing backend FootyStats service...');
  try {
    const footyStatsApiService = require('./src/services/footyStatsApiService');
    const leagues = await footyStatsApiService.getLeagueList();
    
    console.log(`✅ Backend Service Success`);
    console.log(`📊 Data type: ${typeof leagues}`);
    console.log(`📋 Data: ${JSON.stringify(leagues).substring(0, 200)}...`);
    
  } catch (error) {
    console.log(`❌ Backend Service Failed: ${error.message}`);
    console.log(`📋 Stack: ${error.stack}`);
  }

  // Test 3: Our backend API endpoint
  console.log('\n3️⃣ Testing backend API endpoint...');
  try {
    const response = await axios.get('http://localhost:5000/api/footystats/leagues', {
      timeout: 10000
    });
    
    console.log(`✅ Backend API Success - ${response.status}`);
    console.log(`📊 Data size: ${JSON.stringify(response.data).length} bytes`);
    console.log(`📋 Success: ${response.data.success}`);
    
  } catch (error) {
    console.log(`❌ Backend API Failed: ${error.message}`);
    if (error.response) {
      console.log(`📊 Status: ${error.response.status}`);
      console.log(`📋 Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

debugLeaguesEndpoint().catch(console.error);
