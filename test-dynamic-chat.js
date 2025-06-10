/**
 * Test script for the dynamic chat functionality
 * This script will test the chat service's ability to dynamically find matches
 * and provide comprehensive analysis
 */

const axios = require('axios');

// Sample match IDs for testing
const TEST_MATCH_ID = '1559456'; // Spain vs France match

async function testDynamicMatchSearch() {
  console.log('Testing dynamic match search functionality...');
  
  try {
    // Test the backend API endpoints
    const baseUrl = 'http://localhost:5000/api';
      // Test match details endpoint
    console.log('\n1. Testing match details API:');
    const matchDetails = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}`);
    const matchData = matchDetails.data.result || matchDetails.data;
    console.log(`Match details: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
    console.log(`Date: ${matchData.date} ${matchData.time}`);
    console.log(`League: ${matchData.league.name}`);
    
    // Test H2H endpoint
    console.log('\n2. Testing H2H API:');
    const h2h = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}/h2h`);
    const h2hData = h2h.data.result || h2h.data;
    console.log(`H2H data available: ${h2hData ? 'Yes' : 'No'}`);
    if (h2hData) {
      console.log(`Total H2H matches: ${Array.isArray(h2hData) ? h2hData.length : 'Data structure is different'}`);
    }
    
    // Test corners endpoint
    console.log('\n3. Testing corners API:');
    const corners = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}/corners`);
    const cornersData = corners.data.result || corners.data;
    console.log(`Corners data available: ${cornersData ? 'Yes' : 'No'}`);
    
    // Test BTTS endpoint
    console.log('\n4. Testing BTTS API:');
    const btts = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}/btts`);
    const bttsData = btts.data.result || btts.data;
    console.log(`BTTS data available: ${bttsData ? 'Yes' : 'No'}`);
    
    // Test cards endpoint
    console.log('\n5. Testing cards API:');
    const cards = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}/cards`);
    const cardsData = cards.data.result || cards.data;
    console.log(`Cards data available: ${cardsData ? 'Yes' : 'No'}`);
    
    // Test analysis endpoint
    console.log('\n6. Testing analysis API:');
    const analysis = await axios.get(`${baseUrl}/matches/${TEST_MATCH_ID}/analysis`);
    const analysisData = analysis.data.result || analysis.data;
    console.log(`Analysis data available: ${analysisData ? 'Yes' : 'No'}`);
    
    // Test team form endpoint (if team IDs available)
    if (matchData.homeTeam.id && matchData.awayTeam.id) {
      console.log('\n7. Testing team form APIs:');
        const homeForm = await axios.get(`${baseUrl}/teams/${matchData.homeTeam.id}/form`);
      const homeFormData = homeForm.data.result || homeForm.data;
      console.log(`Home team (${matchData.homeTeam.name}) form data available: ${homeFormData ? 'Yes' : 'No'}`);
      
      const awayForm = await axios.get(`${baseUrl}/teams/${matchData.awayTeam.id}/form`);
      const awayFormData = awayForm.data.result || awayForm.data;
      console.log(`Away team (${matchData.awayTeam.name}) form data available: ${awayFormData ? 'Yes' : 'No'}`);
    }
    
    console.log('\nAll API tests completed successfully!');
    console.log('The backend APIs are providing the necessary data for dynamic match analysis.');
    
  } catch (error) {
    console.error('Error during API testing:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
  }
}

// Run the test
testDynamicMatchSearch().catch(console.error);
