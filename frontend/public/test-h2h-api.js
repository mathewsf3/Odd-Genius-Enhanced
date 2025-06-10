// This script allows us to test the API directly in the browser console
// UPDATED with valid API key - May 20, 2025

/**
 * Default API configuration
 */
const DEFAULT_CONFIG = {
  API_KEY: '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4',
  FIRST_TEAM_ID: '93', // Lazio
  SECOND_TEAM_ID: '4973' // Torino
};

/**
 * Test the AllSportsAPI H2H endpoint
 * @param {string} apiKey - Your AllSportsAPI key (defaults to the one from May 20, 2025)
 * @param {string} firstTeamId - ID of first team
 * @param {string} secondTeamId - ID of second team
 */
async function testH2HApi(
  apiKey = DEFAULT_CONFIG.API_KEY, 
  firstTeamId = DEFAULT_CONFIG.FIRST_TEAM_ID, 
  secondTeamId = DEFAULT_CONFIG.SECOND_TEAM_ID
) {
  console.log(`Testing H2H API for teams ${firstTeamId} vs ${secondTeamId}`);
  
  try {
    const url = `https://apiv2.allsportsapi.com/football/?met=H2H&APIkey=${apiKey}&firstTeamId=${firstTeamId}&secondTeamId=${secondTeamId}`;
    
    console.log(`API URL: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.success === 1) {
      console.log(`Successfully fetched ${data.result.H2H?.length || 0} H2H matches`);
      console.log('First match:', data.result.H2H?.[0]);
    } else {
      console.error('API Error:', data);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Export the test function to the window object for easy access in the browser console
window.testH2HApi = testH2HApi;

console.log('H2H API test script loaded. Use window.testH2HApi(apiKey, firstTeamId, secondTeamId) to test.');
console.log('Example: testH2HApi("your-api-key", "93", "4973")');
