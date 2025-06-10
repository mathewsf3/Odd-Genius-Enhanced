/**
 * Simple FootyStats API Test
 * Test basic connectivity and endpoint format
 */

const axios = require('axios');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';

async function testBasicEndpoint() {
  try {
    console.log('🔍 Testing basic FootyStats API connectivity...');
    
    // Test with a simple endpoint
    const response = await axios.get('https://api.football-data-api.com/league-list', {
      params: {
        key: API_KEY
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'OddGenius/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data type:', typeof response.data);
    console.log('Data sample:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    return response.data;
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Status text:', error.response?.statusText);
    console.log('Error message:', error.message);
    
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check if it's authentication issue
    if (error.response?.status === 401) {
      console.log('🔑 Authentication issue - check API key');
    } else if (error.response?.status === 403) {
      console.log('🚫 Access denied - check subscription');
    } else if (error.response?.status === 500) {
      console.log('🔧 Server error - may be endpoint or parameter issue');
    }
    
    throw error;
  }
}

// Test different endpoint formats
async function testEndpointFormats() {
  const endpoints = [
    'https://api.football-data-api.com/league-list',
    'https://api.footystats.org/league-list', // Alternative base URL
    'https://api.football-data-api.com/leagues', // Alternative endpoint name
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      
      const response = await axios.get(endpoint, {
        params: { key: API_KEY },
        timeout: 5000
      });
      
      console.log(`✅ SUCCESS: ${endpoint}`);
      console.log('Status:', response.status);
      return response.data;
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint} - ${error.response?.status || error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 FootyStats API Basic Connectivity Test');
  console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
  
  try {
    await testBasicEndpoint();
  } catch (error) {
    console.log('\n🔄 Trying alternative endpoint formats...');
    await testEndpointFormats();
  }
}

main().catch(console.error);
