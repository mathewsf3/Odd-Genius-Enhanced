const axios = require('axios');

const MATCH_ID = '1570056';
const BASE_URL = 'http://localhost:5000/api';

async function comprehensiveDiagnostic() {
  console.log('🔍 COMPREHENSIVE DIAGNOSTIC ANALYSIS');
  console.log('=====================================');
  console.log(`📍 Target Match: ${MATCH_ID}`);
  console.log(`🌐 Backend URL: ${BASE_URL}`);
  console.log(`🎯 Frontend URL: http://localhost:3001/match/${MATCH_ID}`);
  console.log('');

  const diagnosticResults = {
    endpoints: {},
    dataFlow: {},
    issues: [],
    recommendations: []
  };

  // 1. Test all API endpoints
  console.log('1️⃣ FRONTEND-BACKEND CONNECTION VERIFICATION');
  console.log('============================================');

  const endpoints = [
    {
      name: 'Match Details',
      url: `${BASE_URL}/matches/${MATCH_ID}`,
      critical: true,
      expectedData: ['homeTeam', 'awayTeam', 'league']
    },
    {
      name: 'Unified Match Data',
      url: `${BASE_URL}/admin/matches/${MATCH_ID}/unified`,
      critical: true,
      expectedData: ['universal', 'merged', 'sources']
    },
    {
      name: 'H2H Data',
      url: `${BASE_URL}/matches/${MATCH_ID}/h2h`,
      critical: true,
      expectedData: ['matches', 'summary']
    },
    {
      name: 'Corner Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/corners?matches=10`,
      critical: false,
      expectedData: ['homeStats', 'awayStats']
    },
    {
      name: 'Card Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/cards?matches=10`,
      critical: true,
      expectedData: ['homeStats', 'awayStats']
    },
    {
      name: 'BTTS Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/btts?matches=10`,
      critical: true,
      expectedData: ['homeStats', 'awayStats']
    },
    {
      name: 'Player Stats',
      url: `${BASE_URL}/matches/${MATCH_ID}/players?matches=10`,
      critical: false,
      expectedData: ['homeTeam', 'awayTeam']
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing: ${endpoint.name}`);
      
      const startTime = Date.now();
      const response = await axios.get(endpoint.url, { 
        timeout: 20000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Diagnostic-Tool/1.0'
        }
      });
      const responseTime = Date.now() - startTime;
      
      const result = {
        status: 'SUCCESS',
        responseTime,
        httpStatus: response.status,
        dataAvailable: false,
        dataStructure: {},
        issues: []
      };

      if (response.data?.success && response.data.result) {
        result.dataAvailable = true;
        
        // Check expected data structure
        for (const expectedField of endpoint.expectedData) {
          if (response.data.result[expectedField]) {
            result.dataStructure[expectedField] = 'PRESENT';
          } else {
            result.dataStructure[expectedField] = 'MISSING';
            if (endpoint.critical) {
              result.issues.push(`Missing critical field: ${expectedField}`);
            }
          }
        }

        // Specific data analysis
        if (endpoint.name === 'Match Details' || endpoint.name === 'Unified Match Data') {
          const data = response.data.result;
          const homeTeam = data.universal?.homeTeam?.name || data.event_home_team || data.homeTeam?.name;
          const awayTeam = data.universal?.awayTeam?.name || data.event_away_team || data.awayTeam?.name;
          
          console.log(`   ✅ SUCCESS (${responseTime}ms)`);
          console.log(`      Home: ${homeTeam || 'Unknown'}`);
          console.log(`      Away: ${awayTeam || 'Unknown'}`);
          
          if (!homeTeam || !awayTeam) {
            result.issues.push('Team names not properly extracted');
          }
        } else if (endpoint.name === 'H2H Data') {
          const matches = response.data.result.matches?.length || 0;
          console.log(`   ✅ SUCCESS (${responseTime}ms) - ${matches} H2H matches`);
          
          if (matches === 0) {
            result.issues.push('No H2H matches found');
          }
        } else if (endpoint.name.includes('Stats')) {
          const hasHomeStats = !!response.data.result.homeStats;
          const hasAwayStats = !!response.data.result.awayStats;
          
          console.log(`   ✅ SUCCESS (${responseTime}ms)`);
          console.log(`      Home Stats: ${hasHomeStats ? 'Available' : 'Missing'}`);
          console.log(`      Away Stats: ${hasAwayStats ? 'Available' : 'Missing'}`);
          
          if (!hasHomeStats || !hasAwayStats) {
            result.issues.push('Statistics data incomplete');
          }
        }
      } else {
        result.status = 'NO_DATA';
        result.issues.push('API returned success=false or no result');
        console.log(`   ⚠️ NO DATA (${responseTime}ms)`);
        console.log(`      Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }

      diagnosticResults.endpoints[endpoint.name] = result;

    } catch (error) {
      const result = {
        status: 'ERROR',
        error: error.message,
        issues: []
      };

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          result.issues.push('Request timeout - backend may be slow');
        } else if (error.response) {
          result.issues.push(`HTTP ${error.response.status}: ${error.response.data?.error || error.message}`);
        } else if (error.request) {
          result.issues.push('No response from backend - connection issue');
        } else {
          result.issues.push(`Request setup error: ${error.message}`);
        }
      } else {
        result.issues.push(`Unexpected error: ${error.message}`);
      }

      console.log(`   ❌ ERROR: ${error.message}`);
      diagnosticResults.endpoints[endpoint.name] = result;
    }
  }

  console.log('');
  console.log('2️⃣ DATA FLOW ANALYSIS');
  console.log('=====================');

  // Analyze data flow patterns
  const workingEndpoints = Object.entries(diagnosticResults.endpoints)
    .filter(([name, result]) => result.status === 'SUCCESS' && result.dataAvailable)
    .map(([name]) => name);

  const failingEndpoints = Object.entries(diagnosticResults.endpoints)
    .filter(([name, result]) => result.status !== 'SUCCESS' || !result.dataAvailable)
    .map(([name]) => name);

  console.log(`✅ Working Endpoints: ${workingEndpoints.join(', ')}`);
  console.log(`❌ Failing Endpoints: ${failingEndpoints.join(', ')}`);

  // Check for critical path issues
  const criticalEndpoints = endpoints.filter(e => e.critical).map(e => e.name);
  const failingCritical = failingEndpoints.filter(name => 
    criticalEndpoints.includes(name)
  );

  if (failingCritical.length > 0) {
    diagnosticResults.issues.push(`Critical endpoints failing: ${failingCritical.join(', ')}`);
  }

  console.log('');
  console.log('3️⃣ FRONTEND SIMULATION TEST');
  console.log('============================');

  // Simulate what the frontend should be doing
  try {
    console.log('🔄 Simulating SpecialMatch.tsx data fetching...');
    
    // Step 1: Fetch match data (like SpecialMatch.tsx does)
    let matchData = null;
    try {
      const unifiedResponse = await axios.get(`${BASE_URL}/admin/matches/${MATCH_ID}/unified`, { timeout: 15000 });
      if (unifiedResponse.data?.success) {
        matchData = unifiedResponse.data.result;
        console.log('   ✅ Unified match data retrieved');
      }
    } catch (e) {
      const standardResponse = await axios.get(`${BASE_URL}/matches/${MATCH_ID}`, { timeout: 15000 });
      if (standardResponse.data?.success) {
        matchData = standardResponse.data.result;
        console.log('   ✅ Standard match data retrieved (fallback)');
      }
    }

    if (matchData) {
      // Extract team IDs like the frontend does
      const homeTeamId = matchData.universal?.homeTeam?.id || matchData.homeTeam?.id || matchData.home_team_key;
      const awayTeamId = matchData.universal?.awayTeam?.id || matchData.awayTeam?.id || matchData.away_team_key;
      
      console.log(`   📊 Team IDs extracted: Home=${homeTeamId}, Away=${awayTeamId}`);
      
      if (homeTeamId && awayTeamId) {
        diagnosticResults.dataFlow.teamIdsExtracted = true;
        diagnosticResults.dataFlow.homeTeamId = homeTeamId;
        diagnosticResults.dataFlow.awayTeamId = awayTeamId;
      } else {
        diagnosticResults.issues.push('Team IDs could not be extracted from match data');
      }
    } else {
      diagnosticResults.issues.push('Match data could not be retrieved');
    }

  } catch (error) {
    diagnosticResults.issues.push(`Frontend simulation failed: ${error.message}`);
    console.log(`   ❌ Simulation failed: ${error.message}`);
  }

  console.log('');
  console.log('4️⃣ DIAGNOSTIC SUMMARY');
  console.log('=====================');

  const totalEndpoints = endpoints.length;
  const successfulEndpoints = workingEndpoints.length;
  const successRate = Math.round((successfulEndpoints / totalEndpoints) * 100);

  console.log(`📊 Endpoint Success Rate: ${successfulEndpoints}/${totalEndpoints} (${successRate}%)`);
  console.log(`🔍 Total Issues Found: ${diagnosticResults.issues.length}`);

  if (diagnosticResults.issues.length > 0) {
    console.log('');
    console.log('⚠️ ISSUES IDENTIFIED:');
    diagnosticResults.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  
  if (successRate === 100) {
    console.log('   ✅ All backend endpoints are working correctly');
    console.log('   🔍 Issue is likely in frontend JavaScript/React components');
    console.log('   📋 Next steps:');
    console.log('      1. Check browser console for JavaScript errors');
    console.log('      2. Verify frontend is making HTTP requests');
    console.log('      3. Check component state management');
    console.log('      4. Test with browser developer tools open');
  } else {
    console.log('   ⚠️ Backend issues detected - fix these first');
    failingEndpoints.forEach(endpoint => {
      console.log(`      - Fix ${endpoint} endpoint`);
    });
  }

  console.log('');
  console.log('🌐 TEST URLS:');
  console.log(`   Frontend: http://localhost:3001/match/${MATCH_ID}`);
  console.log(`   Backend Health: http://localhost:5000/health`);
  console.log(`   Match API: ${BASE_URL}/matches/${MATCH_ID}`);

  return diagnosticResults;
}

// Run comprehensive diagnostic
comprehensiveDiagnostic().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
