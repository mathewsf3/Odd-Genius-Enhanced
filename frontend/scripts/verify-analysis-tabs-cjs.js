// Check if all analysis tabs are correctly using real data
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const analysisTabsDir = path.join(__dirname, '..', 'src', 'components', 'match');
const mockServerUrl = 'http://localhost:3001';
const testMatchId = '1568037'; // Test match ID

// Analysis tab files to check
const tabFiles = [
  'CardAnalysisTab.tsx',
  'GoalTimingAnalysisTab.tsx',
  'CornerAnalysisTab.tsx',
  'TeamStatsTab.tsx',
  'PredictionsTab.tsx'
];

// Fields that should be accessed with proper null checks
const criticalFields = [
  'match.analysis?.goalTimings',
  'match.analysis?.cardAnalysis',
  'match.analysis?.cornerAnalysis',
  'match.analysis?.teamStats',
  'match.analysis?.predictions',
  'data?.teamStats',
  'home.scoringPatterns',
  'away.scoringPatterns',
  'data.predictions'
];

async function main() {
  console.log('Verifying analysis tabs for proper data handling...');
  
  // 1. Check if mock server is running
  try {
    console.log('Testing mock server connection...');
    const response = await axios.get(`${mockServerUrl}/match/${testMatchId}`);
    console.log('Mock server is running!');
    
    // Log available data fields for reference
    console.log('\nAvailable data fields in mock response:');
    const mockData = response.data;
    const analysisFields = Object.keys(mockData.analysis || {});
    console.log('Analysis fields:', analysisFields);
    
    // Check specific analysis sections
    if (mockData.analysis?.goalTimings) {
      console.log('- goalTimings data is available');
    }
    if (mockData.analysis?.cardAnalysis) {
      console.log('- cardAnalysis data is available');
    }
    if (mockData.analysis?.cornerAnalysis) {
      console.log('- cornerAnalysis data is available');
    }
    if (mockData.analysis?.teamStats) {
      console.log('- teamStats data is available');
    }
    if (mockData.analysis?.predictions) {
      console.log('- predictions data is available');
    }
  } catch (error) {
    console.error('Error connecting to mock server:', error.message);
    console.log('Make sure the mock server is running at', mockServerUrl);
    process.exit(1);
  }
  
  // 2. Check each analysis tab file
  console.log('\nChecking analysis tab files...');
  
  for (const tabFile of tabFiles) {
    const filePath = path.join(analysisTabsDir, tabFile);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${tabFile}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`\nChecking ${tabFile}...`);
    
    // Check for proper null checks on critical fields
    let improperAccessCount = 0;
    let properAccessCount = 0;
    
    for (const field of criticalFields) {
      // Regex to find proper access with optional chaining or null coalescing
      const properAccessPattern = new RegExp(`${field.replace(/\./g, '\\.').replace(/\?/g, '\\?')}(\\?\\.|\\?\\s*\\.|\\s*\\|\\|)`, 'g');
      // Regex to find improper direct access without null checks
      const improperAccessPattern = new RegExp(`${field.replace(/\./g, '\\.').replace(/\?\./g, '\\.')}[^\\?\\|]`, 'g');
      
      const properMatches = content.match(properAccessPattern) || [];
      const improperMatches = content.match(improperAccessPattern) || [];
      
      properAccessCount += properMatches.length;
      improperAccessCount += improperMatches.length;
      
      if (properMatches.length > 0) {
        console.log(`✓ Found ${properMatches.length} proper access(es) of ${field}`);
      }
      
      if (improperMatches.length > 0) {
        console.log(`✗ Found ${improperMatches.length} improper access(es) of ${field}`);
        console.log('  Examples:');
        for (let i = 0; i < Math.min(improperMatches.length, 3); i++) {
          console.log(`  - ${improperMatches[i]}`);
        }
      }
    }
    
    // Check for error handling
    const hasErrorHandling = content.includes('if (error)') || 
                             content.includes('if (loading)') || 
                             content.includes('!data') ||
                             content.includes('data === null');
    
    console.log('\nSummary:');
    console.log(`- Proper null checks: ${properAccessCount}`);
    console.log(`- Potentially improper access: ${improperAccessCount}`);
    console.log(`- Error handling: ${hasErrorHandling ? 'Present' : 'Missing'}`);
    
    // Check data fetching from API
    const usesApiService = content.includes('soccerApiService.getPreMatchAnalysis');
    console.log(`- Uses API service: ${usesApiService ? 'Yes' : 'No'}`);
    
    // Overall assessment
    if (improperAccessCount === 0 && hasErrorHandling && usesApiService) {
      console.log('\n✅ This tab appears to be correctly handling real data!');
    } else {
      console.log('\n⚠️ This tab may need improvements in data handling.');
    }
  }
  
  console.log('\nVerification complete!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
