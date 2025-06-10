#!/usr/bin/env node

/**
 * 🧪 TEST FAST AI SERVER
 * 
 * Test the new fast AI server on port 3002
 */

const axios = require('axios');

const FAST_AI_URL = 'http://localhost:3002/api/ai-team/chat';
const HEALTH_URL = 'http://localhost:3002/api/ai-team/health';

async function testFastAIServer() {
  console.log('🧪 Testing Fast AI Server');
  console.log('==========================\n');

  // Test health check first
  try {
    console.log('🔍 Testing health check...');
    const healthResponse = await axios.get(HEALTH_URL);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  const tests = [
    {
      name: 'Simple Greeting',
      message: 'hello',
      expectedDuration: '<2000ms'
    },
    {
      name: 'Documentation Check',
      message: 'Check AllSportsAPI documentation for leagues',
      expectedDuration: '<3000ms'
    },
    {
      name: 'Quick Question',
      message: 'How do I get team logos?',
      expectedDuration: '<3000ms'
    }
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n🔍 Test ${i + 1}: ${test.name}`);
    console.log(`📝 Message: "${test.message}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(FAST_AI_URL, {
        message: test.message,
        projectContext: {}
      });

      const duration = Date.now() - startTime;
      const data = response.data;

      console.log(`✅ Response received in ${duration}ms`);
      console.log(`🎯 Type: ${data.type || 'unknown'}`);
      console.log(`🤖 Agents: ${data.agentsUsed ? data.agentsUsed.join(', ') : 'none'}`);
      console.log(`📄 Message: ${data.message ? data.message.substring(0, 150) + '...' : 'No message'}`);
      console.log(`✅ Success: ${data.success}`);
      
      // Check if response meets expectations
      const durationOK = duration < 5000; // Max 5 seconds for any response
      const hasMessage = data.message && data.message.length > 0;
      const hasAgents = data.agentsUsed && data.agentsUsed.length > 0;
      const isSuccessful = data.success !== false;
      
      if (durationOK && hasMessage && hasAgents && isSuccessful) {
        console.log(`🎉 Test PASSED`);
      } else {
        console.log(`❌ Test FAILED`);
        if (!durationOK) console.log(`   - Duration too long: ${duration}ms`);
        if (!hasMessage) console.log(`   - No message received`);
        if (!hasAgents) console.log(`   - No agents used`);
        if (!isSuccessful) console.log(`   - Request not successful`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Test FAILED in ${duration}ms`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  console.log('\n🏁 All tests completed!');
  console.log('\n📊 Summary:');
  console.log('- Fast AI server is running on port 3002');
  console.log('- Simple responses should be <2 seconds');
  console.log('- Documentation responses should be <3 seconds');
  console.log('- All responses should include agent information');
  console.log('- All responses should be successful');
}

// Run the tests
testFastAIServer().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
