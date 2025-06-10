/**
 * Comprehensive API Endpoint Validation Script
 * Tests all endpoints in the Odd Genius soccer data system
 * 
 * This script validates:
 * 1. All match-related endpoints
 * 2. Statistical endpoints (corners, cards, BTTS, players)
 * 3. Analysis endpoints  
 * 4. Admin and system endpoints
 * 5. Response structure and data quality
 */

const axios = require('axios');

// Simple color functions without chalk dependency
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TIMEOUT = 30000; // 30 seconds timeout
const RETRY_ATTEMPTS = 2;

// Test match IDs - these should be real match IDs from your database
const TEST_MATCH_IDS = [
  '1499505', // Oran U21 vs USM 
  '1559455', // Another test match
  '1570056', // Third test match
  // Add more match IDs as needed
];

// Test results tracking
const testResults = {
  endpoints: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  errors: [],
  warnings: []
};

/**
 * Enhanced HTTP request with retry logic
 */
const makeRequest = async (endpoint, method = 'GET', data = null, retries = RETRY_ATTEMPTS) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OddGenius-API-Validator/1.0'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers,
      responseTime: response.config.metadata?.endTime - response.config.metadata?.startTime || 0
    };
  } catch (error) {
    if (retries > 0 && error.code !== 'ECONNREFUSED') {
      console.log(colors.yellow(`  ⏳ Retrying... (${RETRY_ATTEMPTS - retries + 1}/${RETRY_ATTEMPTS})`));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return makeRequest(endpoint, method, data, retries - 1);
    }

    return {
      success: false,
      status: error.response?.status || 0,
      error: error.message,
      data: error.response?.data || null,
      code: error.code
    };
  }
};

/**
 * Validate response structure and data quality
 */
const validateResponse = (result, endpoint, expectedFields = []) => {
  const validation = {
    hasValidStructure: false,
    hasSuccessFlag: false,
    hasResult: false,
    hasExpectedFields: false,
    dataQuality: 'unknown',
    warnings: [],
    errors: []
  };

  try {
    // Check basic structure
    if (result.data && typeof result.data === 'object') {
      validation.hasValidStructure = true;

      // Check success flag
      if (result.data.success === true) {
        validation.hasSuccessFlag = true;
      } else if (result.data.success === false) {
        validation.errors.push(`API returned success: false - ${result.data.message || 'No message'}`);
      }

      // Check for result field
      if (result.data.result !== undefined) {
        validation.hasResult = true;

        // Check expected fields if provided
        if (expectedFields.length > 0) {
          const missingFields = expectedFields.filter(field => {
            const fieldValue = getNestedProperty(result.data.result, field);
            return fieldValue === undefined || fieldValue === null;
          });

          validation.hasExpectedFields = missingFields.length === 0;
          if (missingFields.length > 0) {
            validation.warnings.push(`Missing expected fields: ${missingFields.join(', ')}`);
          }
        } else {
          validation.hasExpectedFields = true; // No specific fields required
        }

        // Data quality assessment
        if (result.data.result) {
          validation.dataQuality = assessDataQuality(result.data.result, endpoint);
        }
      } else if (result.data.data !== undefined) {
        // Some endpoints use 'data' instead of 'result'
        validation.hasResult = true;
        validation.hasExpectedFields = true;
        validation.dataQuality = assessDataQuality(result.data.data, endpoint);
      } else {
        validation.errors.push('Response missing result/data field');
      }
    } else {
      validation.errors.push('Invalid response structure');
    }
  } catch (error) {
    validation.errors.push(`Validation error: ${error.message}`);
  }

  return validation;
};

/**
 * Get nested property from object
 */
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Assess data quality based on endpoint type
 */
const assessDataQuality = (data, endpoint) => {
  if (!data) return 'no-data';

  // Match details quality
  if (endpoint.includes('/matches/') && !endpoint.includes('/players') && !endpoint.includes('/corners')) {
    if (data.homeTeam && data.awayTeam && data.status) {
      return 'good';
    }
    return 'partial';
  }

  // Statistics quality
  if (endpoint.includes('/corners') || endpoint.includes('/cards') || endpoint.includes('/btts')) {
    if (Array.isArray(data) && data.length > 0) {
      return 'good';
    } else if (data.statistics || data.stats) {
      return 'good';
    }
    return 'limited';
  }

  // Player statistics quality
  if (endpoint.includes('/players')) {
    if (Array.isArray(data) && data.length > 0) {
      const hasRealPlayers = data.some(player => 
        player.name && !player.name.includes('Player') && !player.name.includes('Unknown')
      );
      return hasRealPlayers ? 'good' : 'placeholder';
    }
    return 'no-data';
  }

  // Live/upcoming matches quality
  if (endpoint.includes('/live') || endpoint.includes('/upcoming')) {
    if (Array.isArray(data) && data.length > 0) {
      return 'good';
    }
    return 'no-matches';
  }

  return 'unknown';
};

/**
 * Test individual endpoint
 */
const testEndpoint = async (endpoint, description, expectedFields = [], method = 'GET', data = null) => {
  testResults.summary.total++;
    console.log(colors.blue(`\n🔍 Testing: ${endpoint}`));
  console.log(colors.gray(`   Description: ${description}`));

  const result = await makeRequest(endpoint, method, data);
  
  const endpointResult = {
    endpoint,
    description,
    method,
    status: result.status,
    success: result.success,
    responseTime: result.responseTime || 0,
    validation: null,
    errors: [],
    warnings: []
  };

  if (result.success) {
    // Validate response structure and data quality
    const validation = validateResponse(result, endpoint, expectedFields);
    endpointResult.validation = validation;
    endpointResult.errors = validation.errors;
    endpointResult.warnings = validation.warnings;

    if (validation.hasValidStructure && validation.hasSuccessFlag && validation.hasResult) {
      testResults.summary.passed++;
      console.log(colors.green(`   ✅ SUCCESS (${result.status}) - Data Quality: ${validation.dataQuality}`));
      
      if (validation.warnings.length > 0) {
        testResults.summary.warnings++;
        console.log(colors.yellow(`   ⚠️ Warnings: ${validation.warnings.join(', ')}`));
      }
    } else {
      testResults.summary.failed++;
      console.log(colors.red(`   ❌ FAILED - Invalid response structure`));
      validation.errors.forEach(error => {
        console.log(colors.red(`      • ${error}`));
      });
    }
  } else {
    testResults.summary.failed++;
    endpointResult.errors.push(result.error || 'Request failed');
    
    if (result.code === 'ECONNREFUSED') {
      console.log(colors.red(`   ❌ CONNECTION REFUSED - Server not running on port 5000`));
    } else {
      console.log(colors.red(`   ❌ FAILED (${result.status}) - ${result.error}`));
    }
  }

  testResults.endpoints[endpoint] = endpointResult;
  
  // Small delay between requests
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return endpointResult;
};

/**
 * Test all endpoints systematically
 */
const runComprehensiveTests = async () => {
  console.log(colors.cyan('🚀 COMPREHENSIVE API ENDPOINT VALIDATION'));
  console.log(colors.cyan('=' .repeat(60)));
  console.log(colors.gray(`Base URL: ${BASE_URL}`));
  console.log(colors.gray(`Test Match IDs: ${TEST_MATCH_IDS.join(', ')}`));
  console.log(colors.gray(`Timeout: ${TIMEOUT}ms`));

  // 1. SYSTEM HEALTH ENDPOINTS
  console.log(colors.magenta('\n📊 1. SYSTEM HEALTH ENDPOINTS'));
  await testEndpoint('/health', 'System health check', ['status', 'timestamp']);
  await testEndpoint('/', 'API root endpoint', ['message', 'version']);

  // 2. LIVE & UPCOMING MATCHES
  console.log(colors.magenta('\n⚡ 2. LIVE & UPCOMING MATCHES'));
  await testEndpoint('/matches/live', 'Get live matches', ['length']);
  await testEndpoint('/matches/upcoming', 'Get upcoming matches', ['length']);
  await testEndpoint('/matches/premium-picks', 'Get premium picks', ['length']);

  // 3. LEAGUES & COUNTRIES
  console.log(colors.magenta('\n🌍 3. LEAGUES & COUNTRIES'));
  await testEndpoint('/leagues', 'Get all leagues', ['length']);
  await testEndpoint('/leagues/live', 'Get live leagues', ['length']);
  await testEndpoint('/leagues/countries', 'Get countries', ['length']);

  // 4. MATCH DETAILS (Test with multiple match IDs)
  console.log(colors.magenta('\n⚽ 4. MATCH DETAILS'));
  for (const matchId of TEST_MATCH_IDS) {
    await testEndpoint(
      `/matches/${matchId}`, 
      `Get match ${matchId} details`, 
      ['homeTeam', 'awayTeam', 'status']
    );
    
    await testEndpoint(
      `/matches/${matchId}/stats`, 
      `Get match ${matchId} stats`, 
      ['statistics']
    );
    
    await testEndpoint(
      `/matches/${matchId}/complete`, 
      `Get complete match ${matchId} data`, 
      ['homeTeam', 'awayTeam']
    );
  }

  // 5. STATISTICAL ENDPOINTS
  console.log(colors.magenta('\n📈 5. STATISTICAL ENDPOINTS'));
  
  for (const matchId of TEST_MATCH_IDS) {
    // Corner statistics
    await testEndpoint(
      `/matches/${matchId}/corners?matches=5`, 
      `Get match ${matchId} corner stats (5 matches)`, 
      []
    );
    
    await testEndpoint(
      `/matches/${matchId}/corners?matches=10`, 
      `Get match ${matchId} corner stats (10 matches)`, 
      []
    );

    // Card statistics
    await testEndpoint(
      `/matches/${matchId}/cards?matches=5`, 
      `Get match ${matchId} card stats (5 matches)`, 
      []
    );
    
    await testEndpoint(
      `/matches/${matchId}/cards?matches=10`, 
      `Get match ${matchId} card stats (10 matches)`, 
      []
    );

    // BTTS statistics
    await testEndpoint(
      `/matches/${matchId}/btts?matches=5`, 
      `Get match ${matchId} BTTS stats (5 matches)`, 
      []
    );
    
    await testEndpoint(
      `/matches/${matchId}/btts?matches=10`, 
      `Get match ${matchId} BTTS stats (10 matches)`, 
      []
    );

    // Player statistics
    await testEndpoint(
      `/matches/${matchId}/players?matches=10`, 
      `Get match ${matchId} player stats (10 matches)`, 
      []
    );

    // H2H data
    await testEndpoint(
      `/matches/${matchId}/h2h`, 
      `Get match ${matchId} head-to-head data`, 
      []
    );

    // Match analysis
    await testEndpoint(
      `/matches/${matchId}/analysis`, 
      `Get match ${matchId} comprehensive analysis`, 
      []
    );

    // Match odds
    await testEndpoint(
      `/matches/${matchId}/odds`, 
      `Get match ${matchId} odds data`, 
      []
    );
  }

  // 6. ANALYSIS ENDPOINTS
  console.log(colors.magenta('\n🔬 6. ANALYSIS ENDPOINTS'));
  for (const matchId of TEST_MATCH_IDS.slice(0, 2)) { // Test with first 2 match IDs only
    await testEndpoint(
      `/analysis/matches/${matchId}/analysis/stats`, 
      `Get detailed analysis stats for match ${matchId}`, 
      []
    );
    
    await testEndpoint(
      `/analysis/matches/${matchId}/analysis/h2h`, 
      `Get analysis H2H for match ${matchId}`, 
      []
    );
    
    await testEndpoint(
      `/analysis/matches/${matchId}/analysis/form`, 
      `Get team form analysis for match ${matchId}`, 
      []
    );
    
    await testEndpoint(
      `/analysis/matches/${matchId}/analysis/live`, 
      `Get live analysis for match ${matchId}`, 
      []
    );
  }

  // 7. ADMIN ENDPOINTS
  console.log(colors.magenta('\n⚙️ 7. ADMIN ENDPOINTS'));
  await testEndpoint('/admin/sync/status', 'Get sync system status', ['syncStatus']);

  // 8. FOOTYSTATS API ENDPOINTS
  console.log(colors.magenta('\n📡 8. FOOTYSTATS API ENDPOINTS'));
  await testEndpoint('/footystats/today', 'Get today\'s matches from FootyStats', []);
  
  for (const matchId of TEST_MATCH_IDS.slice(0, 1)) { // Test with first match ID only
    await testEndpoint(
      `/footystats/match/${matchId}`, 
      `Get FootyStats data for match ${matchId}`, 
      []
    );
  }

  // 9. SYSTEM PERFORMANCE ENDPOINTS
  console.log(colors.magenta('\n📊 9. SYSTEM PERFORMANCE'));
  await testEndpoint('/stats', 'Get general statistics', []);
  await testEndpoint('/stats/performance', 'Get betting performance stats', []);

  // 10. CACHE MANAGEMENT
  console.log(colors.magenta('\n🗂️ 10. CACHE MANAGEMENT'));
  await testEndpoint('/cache/clear', 'Clear system cache', [], 'POST');
};

/**
 * Generate comprehensive report
 */
const generateReport = () => {
  console.log(colors.cyan('\n' + '='.repeat(60)));
  console.log(colors.cyan('📋 COMPREHENSIVE TEST REPORT'));
  console.log(colors.cyan('='.repeat(60)));

  // Summary statistics
  const successRate = testResults.summary.total > 0 
    ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)
    : 0;

  console.log(colors.white('\n📊 SUMMARY STATISTICS:'));
  console.log(colors.green(`  ✅ Passed: ${testResults.summary.passed}/${testResults.summary.total} (${successRate}%)`));
  console.log(colors.red(`  ❌ Failed: ${testResults.summary.failed}/${testResults.summary.total}`));
  console.log(colors.yellow(`  ⚠️ Warnings: ${testResults.summary.warnings}`));

  // Success rate assessment
  if (successRate >= 90) {
    console.log(colors.green(`\n🎉 EXCELLENT: ${successRate}% success rate - System is performing very well!`));
  } else if (successRate >= 75) {
    console.log(colors.yellow(`\n👍 GOOD: ${successRate}% success rate - Most endpoints working correctly`));
  } else if (successRate >= 50) {
    console.log(colors.yellow(`\n⚠️ MODERATE: ${successRate}% success rate - Several endpoints need attention`));
  } else {
    console.log(colors.red(`\n🚨 POOR: ${successRate}% success rate - Significant issues detected`));
  }

  // Failed endpoints
  const failedEndpoints = Object.values(testResults.endpoints).filter(e => !e.success);
  if (failedEndpoints.length > 0) {
    console.log(colors.red('\n❌ FAILED ENDPOINTS:'));
    failedEndpoints.forEach(endpoint => {
      console.log(colors.red(`  • ${endpoint.endpoint} - ${endpoint.errors.join(', ')}`));
    });
  }

  // Endpoints with warnings
  const warningEndpoints = Object.values(testResults.endpoints).filter(e => e.warnings.length > 0);
  if (warningEndpoints.length > 0) {
    console.log(colors.yellow('\n⚠️ ENDPOINTS WITH WARNINGS:'));
    warningEndpoints.forEach(endpoint => {
      console.log(colors.yellow(`  • ${endpoint.endpoint} - ${endpoint.warnings.join(', ')}`));
    });
  }

  // Data quality assessment
  console.log(colors.white('\n📈 DATA QUALITY ASSESSMENT:'));
  const qualityStats = {
    good: 0,
    partial: 0,
    limited: 0,
    'no-data': 0,
    placeholder: 0,
    unknown: 0
  };

  Object.values(testResults.endpoints).forEach(endpoint => {
    if (endpoint.validation?.dataQuality) {
      qualityStats[endpoint.validation.dataQuality] = (qualityStats[endpoint.validation.dataQuality] || 0) + 1;
    }
  });

  Object.entries(qualityStats).forEach(([quality, count]) => {
    if (count > 0) {
      const color = quality === 'good' ? 'green' : quality === 'partial' ? 'yellow' : 'red';
      console.log(chalk[color](`  ${quality}: ${count} endpoints`));
    }
  });

  // Recommendations
  console.log(colors.white('\n💡 RECOMMENDATIONS:'));
  
  if (failedEndpoints.length > 0) {
    console.log(colors.yellow('  • Fix failed endpoints before production deployment'));
  }
  
  if (qualityStats['no-data'] > 0) {
    console.log(colors.yellow('  • Investigate endpoints returning no data'));
  }
  
  if (qualityStats.placeholder > 0) {
    console.log(colors.yellow('  • Replace placeholder data with real data sources'));
  }
  
  if (testResults.summary.warnings > 0) {
    console.log(colors.yellow('  • Review and address endpoint warnings'));
  }

  if (successRate >= 90) {
    console.log(colors.green('  • System ready for production deployment! 🚀'));
  }

  // Export results to JSON file
  const fs = require('fs');
  const reportFileName = `api-validation-report-${Date.now()}.json`;
  fs.writeFileSync(reportFileName, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: testResults.summary,
    successRate: parseFloat(successRate),
    endpoints: testResults.endpoints,
    qualityStats
  }, null, 2));

  console.log(colors.gray(`\n💾 Detailed results saved to: ${reportFileName}`));
};

/**
 * Main execution function
 */
const main = async () => {
  try {
    await runComprehensiveTests();
    generateReport();
  } catch (error) {
    console.error(colors.red('\n💥 Test execution failed:'), error.message);
    process.exit(1);
  }
};

// Run the tests
if (require.main === module) {
  main().then(() => {
    const successRate = testResults.summary.total > 0 
      ? ((testResults.summary.passed / testResults.summary.total) * 100)
      : 0;
    
    // Exit with appropriate code
    process.exit(successRate >= 75 ? 0 : 1);
  }).catch(error => {
    console.error(colors.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = { 
  runComprehensiveTests, 
  testEndpoint, 
  testResults, 
  generateReport 
};
