// Simple test script to check if the match analysis API is responding correctly
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const TEST_MATCH_ID = '12345'; // Using a known match ID that returns mock data

const testMatchAnalysisApi = async () => {
  try {
    console.log('Testing match analysis API...');
    console.log(`Sending request to: ${API_BASE_URL}/analysis/matches/${TEST_MATCH_ID}`);
    
    const response = await axios.get(`${API_BASE_URL}/analysis/matches/${TEST_MATCH_ID}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ API is responding correctly');
      
      if (response.data && response.data.success === true && response.data.result) {
        console.log('✅ API returned successful response with data');
        
        // Check if the data has the expected format
        const result = response.data.result;
        
        if (result.matchDetails) {
          console.log('✅ matchDetails is present');
        } else {
          console.log('❌ matchDetails is missing');
        }
        
        if (result.teamStats) {
          console.log('✅ teamStats is present');
          console.log(`   Home team stats: ${Object.keys(result.teamStats.home || {}).length} properties`);
          console.log(`   Away team stats: ${Object.keys(result.teamStats.away || {}).length} properties`);
        } else {
          console.log('❌ teamStats is missing');
        }
      } else {
        console.log('❌ API returned invalid data structure:', response.data);
      }
    } else {
      console.log('❌ API returned error status code');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Run the test
testMatchAnalysisApi();

// Run the test
testMatchAnalysisApi();
