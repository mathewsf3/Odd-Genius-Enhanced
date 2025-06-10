/**
 * FootyStats API Integration Test
 * Tests all endpoints to ensure they're working correctly with FootyStats API only
 */

const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 15000;

// Colors for console output
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

/**
 * Test an individual endpoint
 */
async function testEndpoint(endpoint, description, expectedFields = []) {
  try {
    console.log(`\n${colors.blue('🔄')} Testing: ${colors.bold(description)}`);
    console.log(`   ${colors.cyan('URL:')} ${endpoint}`);
    
    const startTime = Date.now();
    const response = await axios.get(endpoint, { timeout: TIMEOUT });
    const responseTime = Date.now() - startTime;
    
    if (response.data.success) {
      console.log(`   ${colors.green('✅ SUCCESS')} - ${responseTime}ms`);
      
      // Log key information
      if (response.data.result) {
        const result = response.data.result;
        if (Array.isArray(result)) {
          console.log(`   ${colors.cyan('📊 Count:')} ${result.length} items`);
          if (result.length > 0) {
            console.log(`   ${colors.cyan('📋 Sample:')} ${JSON.stringify(result[0], null, 2).substring(0, 200)}...`);
          }
        } else {
          console.log(`   ${colors.cyan('📋 Data:')} ${JSON.stringify(result, null, 2).substring(0, 200)}...`);
        }
      }
      
      // Check expected fields
      if (expectedFields.length > 0 && response.data.result) {
        const missingFields = expectedFields.filter(field => !hasField(response.data.result, field));
        if (missingFields.length > 0) {
          console.log(`   ${colors.yellow('⚠️  Missing fields:')} ${missingFields.join(', ')}`);
        }
      }
      
      return { success: true, responseTime, data: response.data };
    } else {
      console.log(`   ${colors.red('❌ FAILED')} - ${response.data.error || 'Unknown error'}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.log(`   ${colors.red('❌ ERROR')} - ${error.message}`);
    if (error.response) {
      console.log(`   ${colors.red('📊 Status:')} ${error.response.status}`);
      console.log(`   ${colors.red('📋 Data:')} ${JSON.stringify(error.response.data, null, 2).substring(0, 200)}`);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Check if an object has a nested field
 */
function hasField(obj, field) {
  const parts = field.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && current[part] !== undefined) {
      current = current[part];
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Run comprehensive FootyStats integration tests
 */
async function runFootyStatsIntegrationTests() {
  console.log(colors.bold('\n🚀 FOOTYSTATS API INTEGRATION TEST'));
  console.log(colors.bold('====================================='));
  console.log(colors.cyan(`🌐 Base URL: ${BASE_URL}`));
  console.log(colors.cyan(`⏱️  Timeout: ${TIMEOUT}ms`));
  console.log(colors.cyan(`📅 Date: ${new Date().toISOString()}`));
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  // Test endpoints
  const endpoints = [
    {
      url: `${BASE_URL}/api/health`,
      description: 'Health Check',
      expectedFields: ['status', 'uptime']
    },
    {
      url: `${BASE_URL}/api/footystats/leagues`,
      description: 'FootyStats Leagues',
      expectedFields: ['data']
    },
    {
      url: `${BASE_URL}/api/footystats/today`,
      description: 'FootyStats Today Matches',
      expectedFields: ['data']
    },
    {
      url: `${BASE_URL}/api/footystats/btts-stats`,
      description: 'FootyStats BTTS Stats',
      expectedFields: ['data']
    },
    {
      url: `${BASE_URL}/api/footystats/over25-stats`,
      description: 'FootyStats Over 2.5 Stats',
      expectedFields: ['data']
    },
    {
      url: `${BASE_URL}/api/matches/live`,
      description: 'Live Matches (via FootyStats)',
      expectedFields: ['result']
    },
    {
      url: `${BASE_URL}/api/matches/upcoming`,
      description: 'Upcoming Matches (via FootyStats)',
      expectedFields: ['result']
    },
    {
      url: `${BASE_URL}/api/leagues`,
      description: 'Leagues (via FootyStats)',
      expectedFields: []
    }
  ];

  // Run tests
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.description, endpoint.expectedFields);
    results.total++;
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.details.push({
      endpoint: endpoint.url,
      description: endpoint.description,
      success: result.success,
      error: result.error,
      responseTime: result.responseTime
    });
  }

  // Test specific match endpoints (if we have matches)
  console.log(colors.bold('\n📊 TESTING MATCH-SPECIFIC ENDPOINTS'));
  console.log(colors.bold('==================================='));
  
  try {
    // Get today's matches first
    const matchesResponse = await axios.get(`${BASE_URL}/api/footystats/today`, { timeout: TIMEOUT });
    if (matchesResponse.data.success && matchesResponse.data.data && matchesResponse.data.data.length > 0) {
      const testMatch = matchesResponse.data.data[0];
      const matchId = testMatch.id;
      
      console.log(`${colors.cyan('🎯 Using match ID:')} ${matchId} (${testMatch.home_name} vs ${testMatch.away_name})`);
      
      const matchEndpoints = [
        {
          url: `${BASE_URL}/api/footystats/match/${matchId}`,
          description: 'FootyStats Match Details',
          expectedFields: ['data']
        },
        {
          url: `${BASE_URL}/api/matches/${matchId}`,
          description: 'Match Details (via FootyStats)',
          expectedFields: ['result']
        },
        {
          url: `${BASE_URL}/api/matches/${matchId}/h2h`,
          description: 'Match H2H (via FootyStats)',
          expectedFields: ['result']
        },
        {
          url: `${BASE_URL}/api/matches/${matchId}/corners`,
          description: 'Match Corner Stats (via FootyStats)',
          expectedFields: ['result']
        },
        {
          url: `${BASE_URL}/api/matches/${matchId}/cards`,
          description: 'Match Card Stats (via FootyStats)',
          expectedFields: ['result']
        },
        {
          url: `${BASE_URL}/api/matches/${matchId}/btts`,
          description: 'Match BTTS Stats (via FootyStats)',
          expectedFields: ['result']
        }
      ];
      
      for (const endpoint of matchEndpoints) {
        const result = await testEndpoint(endpoint.url, endpoint.description, endpoint.expectedFields);
        results.total++;
        if (result.success) {
          results.passed++;
        } else {
          results.failed++;
        }
        results.details.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          success: result.success,
          error: result.error,
          responseTime: result.responseTime
        });
      }
    } else {
      console.log(`${colors.yellow('⚠️  No matches available for testing match-specific endpoints')}`);
    }
  } catch (error) {
    console.log(`${colors.red('❌ Could not fetch matches for testing:')} ${error.message}`);
  }

  // Final summary
  console.log(colors.bold('\n📊 FINAL RESULTS'));
  console.log(colors.bold('================'));
  console.log(`${colors.cyan('Total Tests:')} ${results.total}`);
  console.log(`${colors.green('Passed:')} ${results.passed}`);
  console.log(`${colors.red('Failed:')} ${results.failed}`);
  console.log(`${colors.cyan('Success Rate:')} ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log(colors.bold('\n❌ FAILED TESTS:'));
    results.details.filter(d => !d.success).forEach(detail => {
      console.log(`   • ${detail.description}: ${detail.error}`);
    });
  }
  
  if (results.passed === results.total) {
    console.log(colors.bold(colors.green('\n🎉 ALL TESTS PASSED! FootyStats integration is working correctly.')));
  } else {
    console.log(colors.bold(colors.red('\n⚠️  Some tests failed. Please check the issues above.')));
  }
  
  return results;
}

// Run the tests
if (require.main === module) {
  runFootyStatsIntegrationTests().catch(error => {
    console.error(colors.red('Test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = { runFootyStatsIntegrationTests };
