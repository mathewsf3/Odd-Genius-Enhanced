const axios = require('axios');

async function debugLiveMatches() {
  try {
    console.log('🔍 Debugging live matches data structure...');
    
    // Test the FootyStats API directly
    console.log('📡 Testing FootyStats API direct call...');
    const footyResponse = await axios.get('https://api.football-data-api.com/todays-matches', {
      params: { key: '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756' },
      timeout: 15000
    });
    
    console.log('✅ FootyStats Response:', {
      status: footyResponse.status,
      dataSize: JSON.stringify(footyResponse.data).length,
      dataStructure: Object.keys(footyResponse.data),
      matchCount: footyResponse.data?.data?.length || 0
    });
    
    if (footyResponse.data?.data && footyResponse.data.data.length > 0) {
      const firstMatches = footyResponse.data.data.slice(0, 5);
      console.log('📋 Status values found in first 5 matches:');
      firstMatches.forEach((match, i) => {
        console.log(`  Match ${i + 1}: status="${match.status}" - ${match.home_name} vs ${match.away_name}`);
      });
      
      // Count all unique status values
      const statusCounts = {};
      footyResponse.data.data.forEach(match => {
        const status = match.status || 'null';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log('📊 All unique status values:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  "${status}": ${count} matches`);
      });
    }
    
    // Test our backend endpoint
    console.log('\n🔍 Testing our backend live matches endpoint...');
    const backendResponse = await axios.get('http://localhost:5000/api/matches/live', { timeout: 10000 });    console.log('✅ Backend Response:', {
      success: backendResponse.data.success,
      count: backendResponse.data.count,
      resultLength: backendResponse.data.result?.length || 0,
      message: backendResponse.data.message
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugLiveMatches();
