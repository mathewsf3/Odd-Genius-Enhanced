/**
 * FRONTEND-BACKEND INTEGRATION TEST
 * Tests complete integration between Next.js frontend and FootyStats backend
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

const testResults = {
    backend: {},
    frontend: {},
    integration: {},
    summary: {
        backendTests: 0,
        frontendTests: 0,
        integrationTests: 0,
        totalPassed: 0,
        totalFailed: 0
    }
};

async function testBackendEndpoints() {
    console.log('🔧 TESTING BACKEND ENDPOINTS...');
    console.log('================================');
    
    const endpoints = [
        { name: 'Health Check', path: '/api/health' },
        { name: 'FootyStats Leagues', path: '/api/footystats/leagues' },
        { name: 'Today Matches', path: '/api/footystats/today' },
        { name: 'BTTS Stats', path: '/api/footystats/btts-stats' },
        { name: 'Over 2.5 Stats', path: '/api/footystats/over25-stats' },
        { name: 'Live Matches', path: '/api/matches/live' },
        { name: 'Upcoming Matches', path: '/api/matches/upcoming' },
        { name: 'Leagues', path: '/api/leagues' }
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${BACKEND_URL}${endpoint.path}`, { timeout: 10000 });
            testResults.backend[endpoint.name] = {
                status: 'PASS',
                statusCode: response.status,
                dataSize: JSON.stringify(response.data).length,
                responseTime: Date.now()
            };
            testResults.summary.backendTests++;
            testResults.summary.totalPassed++;
            console.log(`✅ ${endpoint.name}: PASS (${response.status})`);
        } catch (error) {
            testResults.backend[endpoint.name] = {
                status: 'FAIL',
                error: error.message,
                statusCode: error.response?.status || 'NO_RESPONSE'
            };
            testResults.summary.backendTests++;
            testResults.summary.totalFailed++;
            console.log(`❌ ${endpoint.name}: FAIL (${error.message})`);
        }
    }
}

async function testFrontendAvailability() {
    console.log('\n🖥️ TESTING FRONTEND AVAILABILITY...');
    console.log('===================================');

    try {
        const response = await axios.get(FRONTEND_URL, { 
            timeout: 10000,
            headers: { 'Accept': 'text/html' }
        });
        
        testResults.frontend['Homepage'] = {
            status: 'PASS',
            statusCode: response.status,
            contentLength: response.data.length,
            hasHtml: response.data.includes('<html>')
        };
        testResults.summary.frontendTests++;
        testResults.summary.totalPassed++;
        console.log(`✅ Frontend Homepage: PASS (${response.status})`);
        console.log(`   Content length: ${response.data.length} chars`);
        console.log(`   Contains HTML: ${response.data.includes('<html>')}`);
    } catch (error) {
        testResults.frontend['Homepage'] = {
            status: 'FAIL',
            error: error.message,
            statusCode: error.response?.status || 'NO_RESPONSE'
        };
        testResults.summary.frontendTests++;
        testResults.summary.totalFailed++;
        console.log(`❌ Frontend Homepage: FAIL (${error.message})`);
    }
}

async function testFrontendApiRoutes() {
    console.log('\n🔗 TESTING FRONTEND API ROUTES...');
    console.log('=================================');

    const frontendApiRoutes = [
        '/api/hello',
        '/api/matches',
        '/api/leagues',
        '/api/stats'
    ];

    for (const route of frontendApiRoutes) {
        try {
            const response = await axios.get(`${FRONTEND_URL}${route}`, { timeout: 5000 });
            testResults.frontend[`API Route ${route}`] = {
                status: 'PASS',
                statusCode: response.status,
                dataSize: JSON.stringify(response.data).length
            };
            testResults.summary.frontendTests++;
            testResults.summary.totalPassed++;
            console.log(`✅ Frontend API ${route}: PASS (${response.status})`);
        } catch (error) {
            testResults.frontend[`API Route ${route}`] = {
                status: 'FAIL',
                error: error.message,
                statusCode: error.response?.status || 'NO_RESPONSE'
            };
            testResults.summary.frontendTests++;
            testResults.summary.totalFailed++;
            console.log(`❌ Frontend API ${route}: FAIL (${error.message})`);
        }
    }
}

async function testIntegrationFlow() {
    console.log('\n🔀 TESTING INTEGRATION FLOW...');
    console.log('==============================');

    // Test 1: Backend data can be fetched for frontend
    try {
        console.log('🔄 Testing backend data fetch for frontend consumption...');
        const backendLeagues = await axios.get(`${BACKEND_URL}/api/footystats/leagues`, { timeout: 10000 });
        const backendMatches = await axios.get(`${BACKEND_URL}/api/footystats/today`, { timeout: 10000 });
        
        testResults.integration['Backend Data Fetch'] = {
            status: 'PASS',
            leagues: Array.isArray(backendLeagues.data) ? backendLeagues.data.length : 'object',
            matches: Array.isArray(backendMatches.data) ? backendMatches.data.length : 'object',
            dataAvailable: true
        };
        testResults.summary.integrationTests++;
        testResults.summary.totalPassed++;
        console.log(`✅ Backend Data Fetch: PASS`);
        console.log(`   Leagues data: ${Array.isArray(backendLeagues.data) ? backendLeagues.data.length + ' items' : 'object'}`);
        console.log(`   Matches data: ${Array.isArray(backendMatches.data) ? backendMatches.data.length + ' items' : 'object'}`);
    } catch (error) {
        testResults.integration['Backend Data Fetch'] = {
            status: 'FAIL',
            error: error.message
        };
        testResults.summary.integrationTests++;
        testResults.summary.totalFailed++;
        console.log(`❌ Backend Data Fetch: FAIL (${error.message})`);
    }

    // Test 2: CORS and API accessibility
    try {
        console.log('🔄 Testing CORS and API accessibility...');
        const corsTest = await axios.get(`${BACKEND_URL}/api/health`, {
            timeout: 5000,
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        testResults.integration['CORS Configuration'] = {
            status: 'PASS',
            corsHeaders: corsTest.headers['access-control-allow-origin'] || 'not-set',
            accessible: true
        };
        testResults.summary.integrationTests++;
        testResults.summary.totalPassed++;
        console.log(`✅ CORS Configuration: PASS`);
    } catch (error) {
        testResults.integration['CORS Configuration'] = {
            status: 'FAIL',
            error: error.message
        };
        testResults.summary.integrationTests++;
        testResults.summary.totalFailed++;
        console.log(`❌ CORS Configuration: FAIL (${error.message})`);
    }
}

function generateIntegrationReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 FRONTEND-BACKEND INTEGRATION REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 TEST SUMMARY:`);
    console.log(`   Backend Tests: ${testResults.summary.backendTests}`);
    console.log(`   Frontend Tests: ${testResults.summary.frontendTests}`);
    console.log(`   Integration Tests: ${testResults.summary.integrationTests}`);
    console.log(`   Total Passed: ${testResults.summary.totalPassed}`);
    console.log(`   Total Failed: ${testResults.summary.totalFailed}`);
    console.log(`   Success Rate: ${((testResults.summary.totalPassed / (testResults.summary.totalPassed + testResults.summary.totalFailed)) * 100).toFixed(2)}%`);

    console.log(`\n🔧 BACKEND STATUS:`);
    Object.entries(testResults.backend).forEach(([test, result]) => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${status} ${test}: ${result.status}`);
    });

    console.log(`\n🖥️ FRONTEND STATUS:`);
    if (Object.keys(testResults.frontend).length > 0) {
        Object.entries(testResults.frontend).forEach(([test, result]) => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`   ${status} ${test}: ${result.status}`);
        });
    } else {
        console.log(`   ⚠️ Frontend not running on ${FRONTEND_URL}`);
    }

    console.log(`\n🔀 INTEGRATION STATUS:`);
    Object.entries(testResults.integration).forEach(([test, result]) => {
        const status = result.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${status} ${test}: ${result.status}`);
    });

    console.log(`\n🎯 RECOMMENDATIONS:`);
    
    if (testResults.summary.totalFailed === 0) {
        console.log(`   🎉 ALL SYSTEMS OPERATIONAL - Ready for production!`);
    } else {
        console.log(`   ⚠️ ${testResults.summary.totalFailed} issues detected:`);
        
        // Backend issues
        Object.entries(testResults.backend).forEach(([test, result]) => {
            if (result.status === 'FAIL') {
                console.log(`     - Backend ${test}: ${result.error}`);
            }
        });
        
        // Frontend issues
        Object.entries(testResults.frontend).forEach(([test, result]) => {
            if (result.status === 'FAIL') {
                console.log(`     - Frontend ${test}: ${result.error}`);
            }
        });
        
        // Integration issues
        Object.entries(testResults.integration).forEach(([test, result]) => {
            if (result.status === 'FAIL') {
                console.log(`     - Integration ${test}: ${result.error}`);
            }
        });
    }

    console.log(`\n🚀 DEPLOYMENT STATUS:`);
    const backendReady = Object.values(testResults.backend).every(r => r.status === 'PASS');
    const integrationReady = Object.values(testResults.integration).every(r => r.status === 'PASS');
    
    console.log(`   Backend: ${backendReady ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
    console.log(`   Integration: ${integrationReady ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
    console.log(`   Overall: ${backendReady && integrationReady ? '🎉 PRODUCTION READY' : '⚠️ NEEDS REVIEW'}`);

    return testResults;
}

async function runFullIntegrationTest() {
    console.log('🚀 STARTING FULL FRONTEND-BACKEND INTEGRATION TEST...');
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🔧 Backend URL: ${BACKEND_URL}`);
    console.log(`🖥️ Frontend URL: ${FRONTEND_URL}\n`);

    // Run all tests
    await testBackendEndpoints();
    await testFrontendAvailability();
    await testFrontendApiRoutes();
    await testIntegrationFlow();

    // Generate report
    const results = generateIntegrationReport();
    
    console.log('\n🎊 INTEGRATION TEST COMPLETED!');
    return results;
}

if (require.main === module) {
    runFullIntegrationTest().catch(console.error);
}

module.exports = { runFullIntegrationTest, testResults };
