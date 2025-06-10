/**
 * Quick API Validation Test
 * Tests the key endpoints after fixes
 */

const axios = require('axios');

// Simple color functions
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

const BASE_URL = 'http://localhost:5000/api';
const TIMEOUT = 10000;

async function testEndpoint(endpoint, description) {
  try {
    console.log(colors.blue(`\n🔍 Testing: ${endpoint}`));
    console.log(`   ${description}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: TIMEOUT });
    
    if (response.status === 200) {
      const hasSuccess = response.data && response.data.success === true;
      const dataSize = JSON.stringify(response.data).length;
      
      if (hasSuccess) {
        console.log(colors.green(`   ✅ SUCCESS (${response.status}) - ${dataSize} bytes - Valid response structure`));
        return true;
      } else {
        console.log(colors.yellow(`   ⚠️ SUCCESS (${response.status}) - ${dataSize} bytes - Missing success field`));
        return true;
      }
    } else {
      console.log(colors.red(`   ❌ FAILED (${response.status})`));
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(colors.red(`   ❌ CONNECTION REFUSED - Server not running`));
    } else if (error.response) {
      console.log(colors.red(`   ❌ FAILED (${error.response.status}) - ${error.response.statusText}`));
    } else {
      console.log(colors.red(`   ❌ ERROR - ${error.message}`));
    }
    return false;
  }
}

async function runQuickValidation() {
  console.log(colors.cyan(colors.bold('\n🚀 QUICK API VALIDATION AFTER FIXES')));
  console.log(colors.cyan('=' .repeat(50)));
  
  const tests = [
    // Core endpoints
    { endpoint: '/health', description: 'Health check endpoint' },
    { endpoint: '/', description: 'API root endpoint' },
    
    // Working endpoints  
    { endpoint: '/leagues', description: 'Get all leagues' },
    { endpoint: '/leagues/countries', description: 'Get countries (FootyStats integration)' },
    
    // Match endpoints - test with working ID
    { endpoint: '/matches/1559455/stats', description: 'Match stats (working ID)' },
    { endpoint: '/matches/1559455/complete', description: 'Complete match data (working ID)' },
    
    // Test matches endpoints that might work now
    { endpoint: '/matches/live', description: 'Live matches (FootyStats)' },
    { endpoint: '/matches/upcoming', description: 'Upcoming matches (FootyStats)' }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) passed++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(colors.cyan('\n' + '=' .repeat(50)));
  console.log(colors.cyan(colors.bold('📊 QUICK VALIDATION RESULTS')));
  console.log(colors.cyan('=' .repeat(50)));
  
  const successRate = ((passed / total) * 100).toFixed(1);
  console.log(`✅ Passed: ${colors.green(passed)}/${total} (${colors.green(successRate + '%')})`);
  console.log(`❌ Failed: ${colors.red(total - passed)}/${total}`);
  
  if (successRate >= 75) {
    console.log(colors.green(colors.bold('\n🎉 EXCELLENT: Most endpoints working correctly!')));
  } else if (successRate >= 50) {
    console.log(colors.yellow(colors.bold('\n👍 GOOD: Significant improvement achieved!')));
  } else {
    console.log(colors.red(colors.bold('\n⚠️ NEEDS WORK: More fixes required')));
  }
  
  console.log(`\nNext steps: ${successRate < 100 ? 'Fix remaining failed endpoints' : 'All endpoints validated successfully!'}`);
}

// Run the validation
runQuickValidation().catch(error => {
  console.error(colors.red('Validation failed:'), error.message);
  process.exit(1);
});
