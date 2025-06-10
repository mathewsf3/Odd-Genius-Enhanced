// H2H API Diagnostic Script
// This script will compare official data with our current implementation

/**
 * Verify if we're using mock data or real API data
 * @returns Promise with analysis results
 */
async function analyzeH2HDataSource() {
  const results = {
    apiKeyValid: false,
    usingMockData: true,
    totalMatchesFound: 0,
    latestMatchDate: null,
    recommendations: []
  };
  
  console.log('🔍 Starting H2H data analysis...');
  
  // 1. Check if we can access the API with the current key
  try {
    // Use a different API key for testing - this should be replaced with your valid key
    const testApiKey = document.getElementById('test-api-key')?.value || 
                       '25f510e3ccc10bdc446db9233094f03bcf9bcdbcda4e97bee206eadd09fbf51d';
    const firstTeam = '93'; // Lazio
    const secondTeam = '4973'; // Torino
    
    console.log(`Testing API with key: ${testApiKey.substring(0, 5)}...${testApiKey.substring(testApiKey.length - 5)}`);
    
    const url = `https://apiv2.allsportsapi.com/football/?met=H2H&APIkey=${testApiKey}&firstTeamId=${firstTeam}&secondTeamId=${secondTeam}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success === 1) {
      results.apiKeyValid = true;
      results.usingMockData = false;
      results.totalMatchesFound = data.result.H2H?.length || 0;
      
      if (data.result.H2H && data.result.H2H.length > 0) {
        const latestMatch = data.result.H2H.sort((a, b) => 
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )[0];
        
        results.latestMatchDate = latestMatch.event_date;
        console.log('Latest real match:', latestMatch);
      }
      
      console.log(`✅ API key is valid. Found ${results.totalMatchesFound} H2H matches.`);
    } else {
      console.error('❌ API key is invalid:', data);
      results.recommendations.push('Update your API key in the api-config.ts file');
    }
  } catch (error) {
    console.error('❌ API request failed:', error);
    results.recommendations.push('Check your internet connection or API endpoint');
  }
  
  // 2. Check our mock data
  try {
    console.log('Analyzing mock data...');
    
    // Get the mock data from our app
    const mockModule = await import('../src/services/h2hService.js');
    const mockData = mockModule.default ? mockModule.default.MOCK_H2H_DATA : null;
    
    if (!mockData) {
      console.log('Could not access mock data directly, checking SpecialMatch component...');
    } else {
      const mockMatches = mockData.result.H2H;
      console.log(`Mock data has ${mockMatches.length} matches`);
      
      if (results.apiKeyValid && results.totalMatchesFound > mockMatches.length) {
        results.recommendations.push(`Your mock data has fewer matches (${mockMatches.length}) than real API data (${results.totalMatchesFound})`);
      }
      
      // Check dates
      if (mockMatches.length > 0) {
        const latestMockMatch = mockMatches.sort((a, b) => 
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )[0];
        
        console.log('Latest mock match:', latestMockMatch);
        
        if (results.latestMatchDate && new Date(results.latestMatchDate) > new Date(latestMockMatch.event_date)) {
          results.recommendations.push(`Your mock data is outdated. Latest mock match: ${latestMockMatch.event_date}, latest real match: ${results.latestMatchDate}`);
        }
      }
    }
  } catch (error) {
    console.error('Error analyzing mock data:', error);
  }
  
  // 3. Generate final report
  if (results.usingMockData) {
    console.warn('⚠️ WARNING: You are currently using MOCK DATA, not real API data');
    if (!results.apiKeyValid) {
      results.recommendations.push('Get a valid API key from AllSportsAPI to see real H2H data');
    }
  }
  
  console.log('📊 Analysis Results:', results);
  return results;
}

// Create HTML interface for testing the API
document.addEventListener('DOMContentLoaded', function() {
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  container.innerHTML = `
    <h2>H2H Data Diagnostic Tool</h2>
    <p>This tool will help diagnose issues with head-to-head data in Odd Genius.</p>
    
    <div style="margin-bottom: 20px;">
      <label for="test-api-key">API Key:</label>
      <input type="text" id="test-api-key" style="width: 300px; padding: 8px; margin-right: 10px;" 
             placeholder="Enter your AllSportsAPI key here" />
      <button id="run-test" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; cursor: pointer;">
        Run Diagnostic
      </button>
    </div>
    
    <div id="results" style="background: #f5f5f5; padding: 15px; border-radius: 5px; display: none;">
      <h3>Diagnostic Results</h3>
      <pre id="results-data" style="background: #333; color: #fff; padding: 10px; overflow: auto;"></pre>
    </div>
    
    <div style="margin-top: 20px;">
      <h3>How to Fix Common Issues:</h3>
      <ul>
        <li><strong>Invalid API key</strong>: Update your API key in src/config/api-config.ts</li>
        <li><strong>Mock data is outdated</strong>: Update the mock data in src/services/h2hService.ts</li>
        <li><strong>API rate limit</strong>: Consider implementing caching or reducing API calls</li>
      </ul>
    </div>
  `;
  
  document.body.appendChild(container);
  
  document.getElementById('run-test').addEventListener('click', async function() {
    const resultsDiv = document.getElementById('results');
    const resultsData = document.getElementById('results-data');
    
    resultsDiv.style.display = 'block';
    resultsData.textContent = 'Running diagnostic...';
    
    try {
      const results = await analyzeH2HDataSource();
      resultsData.textContent = JSON.stringify(results, null, 2);
    } catch (error) {
      resultsData.textContent = `Error: ${error.message}\n\nStack Trace:\n${error.stack}`;
    }
  });
});

// Export the function to window for console usage
window.analyzeH2HDataSource = analyzeH2HDataSource;
