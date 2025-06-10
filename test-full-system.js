#!/usr/bin/env node

/**
 * 🧪 TEST FULL SYSTEM INTEGRATION
 *
 * Test all three services working together:
 * - Frontend (port 3000)
 * - Backend API (port 5001)
 * - Fast AI Team (port 3002)
 */

const axios = require('axios');

async function testFullSystem() {
  console.log('🧪 Testing Full System Integration');
  console.log('===================================\n');

  const tests = [
    {
      name: 'Backend API Health',
      url: 'http://localhost:5001/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Fast AI Team Health',
      url: 'http://localhost:3002/api/ai-team/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Frontend Accessibility',
      url: 'http://localhost:3000',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'AI Team Chat (Simple)',
      url: 'http://localhost:3002/api/ai-team/chat',
      method: 'POST',
      data: { message: 'hello', projectContext: {} },
      expectedStatus: 200
    },
    {
      name: 'AI Team Documentation Check',
      url: 'http://localhost:3002/api/ai-team/chat',
      method: 'POST',
      data: { message: 'Check AllSportsAPI documentation for leagues', projectContext: {} },
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`🔍 Test ${i + 1}/${totalTests}: ${test.name}`);

    const startTime = Date.now();

    try {
      let response;
      if (test.method === 'GET') {
        response = await axios.get(test.url, { timeout: 10000 });
      } else if (test.method === 'POST') {
        response = await axios.post(test.url, test.data, { timeout: 10000 });
      }

      const duration = Date.now() - startTime;

      if (response.status === test.expectedStatus) {
        console.log(`✅ PASSED in ${duration}ms`);

        // Show some response details for AI team tests
        if (test.name.includes('AI Team') && response.data) {
          console.log(`   📄 Response: ${response.data.message ? response.data.message.substring(0, 100) + '...' : 'No message'}`);
          console.log(`   🤖 Agents: ${response.data.agentsUsed ? response.data.agentsUsed.join(', ') : 'none'}`);
          console.log(`   ⚡ Type: ${response.data.type || 'unknown'}`);
        }

        passedTests++;
      } else {
        console.log(`❌ FAILED - Expected status ${test.expectedStatus}, got ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ FAILED in ${duration}ms`);
      console.log(`   Error: ${error.message}`);

      if (error.code === 'ECONNREFUSED') {
        console.log(`   🔧 Service appears to be down or unreachable`);
      }
    }

    console.log(''); // Empty line between tests
  }

  console.log('🏁 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Full system is working correctly.');
    console.log('');
    console.log('🌐 Access Points:');
    console.log('- Frontend: http://localhost:3000');
    console.log('- AI Team: http://localhost:3000/ai-team');
    console.log('- Backend API: http://localhost:5001/api');
    console.log('- Fast AI Team: http://localhost:3002/api/ai-team');
  } else {
    console.log('⚠️  Some tests failed. Check the services and try again.');
  }
}

// Run the tests
testFullSystem().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
