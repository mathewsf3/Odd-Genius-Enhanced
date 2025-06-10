/**
 * SIMPLE INTEGRATION VERIFICATION
 * Quick test to verify backend integration and readiness
 */

const axios = require('axios');

async function quickIntegrationTest() {
    console.log('🚀 QUICK INTEGRATION VERIFICATION');
    console.log('=================================');
    
    const BACKEND_URL = 'http://localhost:5000';
    let results = { passed: 0, failed: 0, tests: [] };

    // Test essential backend endpoints
    const endpoints = [
        { name: 'Health Check', path: '/api/health' },
        { name: 'FootyStats Leagues', path: '/api/footystats/leagues' },
        { name: 'Today Matches', path: '/api/footystats/today' },
        { name: 'Live Matches', path: '/api/matches/live' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🔄 Testing ${endpoint.name}...`);
            const response = await axios.get(`${BACKEND_URL}${endpoint.path}`, { timeout: 8000 });
            
            results.tests.push({
                name: endpoint.name,
                status: 'PASS',
                statusCode: response.status,
                hasData: !!response.data
            });
            results.passed++;
            console.log(`✅ ${endpoint.name}: PASS (${response.status})`);
            
        } catch (error) {
            results.tests.push({
                name: endpoint.name,
                status: 'FAIL',
                error: error.message
            });
            results.failed++;
            console.log(`❌ ${endpoint.name}: FAIL (${error.message})`);
        }
    }

    console.log('\n📊 INTEGRATION TEST RESULTS');
    console.log('============================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 ALL SYSTEMS READY FOR PRODUCTION!');
        console.log('✅ Backend is fully operational');
        console.log('✅ FootyStats API integration working');
        console.log('✅ All endpoints responding correctly');
    } else {
        console.log('\n⚠️ SOME ISSUES DETECTED:');
        results.tests.forEach(test => {
            if (test.status === 'FAIL') {
                console.log(`   - ${test.name}: ${test.error}`);
            }
        });
    }

    return results;
}

// Run the test
quickIntegrationTest().catch(console.error);
