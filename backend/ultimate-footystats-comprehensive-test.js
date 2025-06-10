/**
 * ULTIMATE COMPREHENSIVE FOOTYSTATS API TEST
 * Tests ALL 16 endpoints with EVERY possible parameter
 * Includes: logos, statistics, corners, goals over/under, players, referees, and ALL data fields
 * 
 * API KEY: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';

// Test results storage
let testResults = {
    summary: {
        totalEndpoints: 16,
        successfulEndpoints: 0,
        failedEndpoints: 0,
        totalDataPoints: 0,
        logoUrlsFound: 0,
        imageUrlsFound: 0,
        statisticsFields: 0,
        playerData: 0,
        refereeData: 0,
        matchData: 0
    },
    endpoints: {},
    dataAnalysis: {
        logos: [],
        images: [],
        statistics: {},
        corners: {},
        goalsOverUnder: {},
        btts: {},
        cards: {},
        players: {},
        referees: {},
        matches: {}
    }
};

/**
 * Make API request with comprehensive error handling
 */
async function makeApiRequest(endpoint, params = {}, testName = '') {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            params: { key: API_KEY, ...params },
            timeout: 30000,
            headers: {
                'User-Agent': 'OddGenius-FootyStats-Test/1.0'
            }
        };

        console.log(`\n🔄 Testing: ${testName || endpoint}`);
        console.log(`📡 URL: ${url}`);
        console.log(`🔧 Params:`, JSON.stringify(params, null, 2));

        const response = await axios.get(url, config);
        
        return {
            success: true,
            data: response.data,
            status: response.status,
            headers: response.headers,
            url: url,
            params: params
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: `${BASE_URL}${endpoint}`,
            params: params
        };
    }
}

/**
 * Analyze data for images, logos, and statistical content
 */
function analyzeDataContent(data, endpointName) {
    const analysis = {
        logoUrls: [],
        imageUrls: [],
        statisticsFields: [],
        dataPoints: 0
    };

    function searchObject(obj, path = '') {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;

            // Count data points
            if (value !== null && value !== undefined) {
                analysis.dataPoints++;
            }

            // Look for image/logo URLs
            if (typeof value === 'string') {
                if (key.toLowerCase().includes('logo') || 
                    key.toLowerCase().includes('image') ||
                    value.includes('/img/') ||
                    value.includes('logo') ||
                    value.includes('.png') ||
                    value.includes('.jpg') ||
                    value.includes('.svg')) {
                    
                    if (key.toLowerCase().includes('logo')) {
                        analysis.logoUrls.push({ path: currentPath, url: value });
                    } else {
                        analysis.imageUrls.push({ path: currentPath, url: value });
                    }
                }
            }

            // Look for statistical fields
            if (key.toLowerCase().includes('goal') ||
                key.toLowerCase().includes('corner') ||
                key.toLowerCase().includes('card') ||
                key.toLowerCase().includes('btts') ||
                key.toLowerCase().includes('over') ||
                key.toLowerCase().includes('under') ||
                key.toLowerCase().includes('stat') ||
                key.toLowerCase().includes('percentage') ||
                key.toLowerCase().includes('average') ||
                key.toLowerCase().includes('total')) {
                analysis.statisticsFields.push({ 
                    path: currentPath, 
                    key: key, 
                    value: value 
                });
            }

            // Recurse into objects and arrays
            if (typeof value === 'object') {
                searchObject(value, currentPath);
            }
        });
    }

    searchObject(data);
    return analysis;
}

/**
 * Test 1: League List - All variations
 */
async function testLeagueList() {
    console.log('\n=== 1. TESTING LEAGUE LIST ENDPOINT ===');
    
    const tests = [
        { params: {}, name: 'Basic League List' },
        { params: { chosen_leagues_only: true }, name: 'Chosen Leagues Only' },
        { params: { chosen_leagues_only: false }, name: 'All Available Leagues' },
    ];

    let endpointResults = [];

    for (const test of tests) {
        const result = await makeApiRequest('/league-list', test.params, test.name);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'league-list');
            console.log(`✅ ${test.name}: ${analysis.dataPoints} data points`);
            console.log(`📊 Found ${analysis.logoUrls.length} logo URLs, ${analysis.statisticsFields.length} stats fields`);
            
            // Store league logos
            analysis.logoUrls.forEach(logo => testResults.dataAnalysis.logos.push(logo));
            analysis.imageUrls.forEach(img => testResults.dataAnalysis.images.push(img));
        } else {
            console.log(`❌ ${test.name}: ${result.error}`);
        }
    }

    testResults.endpoints['league-list'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 2: Country List
 */
async function testCountryList() {
    console.log('\n=== 2. TESTING COUNTRY LIST ENDPOINT ===');
    
    const result = await makeApiRequest('/country-list', {}, 'Country List');
    testResults.endpoints['country-list'] = [result];

    if (result.success) {
        const analysis = analyzeDataContent(result.data, 'country-list');
        console.log(`✅ Country List: ${analysis.dataPoints} data points`);
        console.log(`🏳️ Found countries with potential flag URLs`);
    }

    return result.success;
}

/**
 * Test 3: Today's Matches - All variations
 */
async function testTodaysMatches() {
    console.log('\n=== 3. TESTING TODAY\'S MATCHES ENDPOINT ===');
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
    
    const tests = [
        { params: {}, name: 'Today\'s Matches (default)' },
        { params: { date: today }, name: `Today's Matches (${today})` },
        { params: { date: yesterday }, name: `Yesterday's Matches (${yesterday})` },
        { params: { date: '2024-12-01' }, name: 'Specific Date Matches' },
    ];

    let endpointResults = [];

    for (const test of tests) {
        const result = await makeApiRequest('/todays-matches', test.params, test.name);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'todays-matches');
            console.log(`✅ ${test.name}: ${analysis.dataPoints} data points`);
            
            // Analyze match statistics
            if (Array.isArray(result.data)) {
                result.data.forEach(match => {
                    if (match.corners_total) testResults.dataAnalysis.corners[match.id] = match.corners_total;
                    if (match.goals_total) testResults.dataAnalysis.goalsOverUnder[match.id] = match.goals_total;
                    if (match.btts) testResults.dataAnalysis.btts[match.id] = match.btts;
                });
            }
        } else {
            console.log(`❌ ${test.name}: ${result.error}`);
        }
    }

    testResults.endpoints['todays-matches'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 4: League Season Stats - Comprehensive
 */
async function testLeagueSeasonStats() {
    console.log('\n=== 4. TESTING LEAGUE SEASON STATS ENDPOINT ===');
    
    // First get leagues to find valid season IDs
    const leaguesResult = await makeApiRequest('/league-list', {});
    let seasonIds = [];
    
    if (leaguesResult.success && Array.isArray(leaguesResult.data)) {
        seasonIds = leaguesResult.data.slice(0, 5).map(league => league.id);
    } else {
        // Fallback season IDs for major leagues
        seasonIds = [1625, 1635, 1645, 1655, 1665];
    }

    let endpointResults = [];

    for (const seasonId of seasonIds) {
        const result = await makeApiRequest('/league-season', { season_id: seasonId }, `League Season ${seasonId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'league-season');
            console.log(`✅ League Season ${seasonId}: ${analysis.dataPoints} data points`);
            console.log(`🏆 League logos: ${analysis.logoUrls.length}, Stats fields: ${analysis.statisticsFields.length}`);
            
            // Store league images and statistics
            analysis.logoUrls.forEach(logo => testResults.dataAnalysis.logos.push(logo));
            analysis.statisticsFields.forEach(stat => {
                if (!testResults.dataAnalysis.statistics[stat.key]) {
                    testResults.dataAnalysis.statistics[stat.key] = [];
                }
                testResults.dataAnalysis.statistics[stat.key].push(stat.value);
            });
        } else {
            console.log(`❌ League Season ${seasonId}: ${result.error}`);
        }
    }

    testResults.endpoints['league-season'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 5: League Matches - All parameters
 */
async function testLeagueMatches() {
    console.log('\n=== 5. TESTING LEAGUE MATCHES ENDPOINT ===');
    
    const seasonIds = [1625, 1635]; // Test with 2 seasons
    let endpointResults = [];

    for (const seasonId of seasonIds) {
        const tests = [
            { params: { season_id: seasonId }, name: `League Matches ${seasonId} (default)` },
            { params: { season_id: seasonId, page: 1, max_per_page: 100 }, name: `League Matches ${seasonId} (page 1, 100 per page)` },
            { params: { season_id: seasonId, page: 2, max_per_page: 50 }, name: `League Matches ${seasonId} (page 2, 50 per page)` },
            { params: { season_id: seasonId, max_per_page: 500 }, name: `League Matches ${seasonId} (500 per page)` },
        ];

        for (const test of tests) {
            const result = await makeApiRequest('/league-matches', test.params, test.name);
            endpointResults.push(result);

            if (result.success) {
                const analysis = analyzeDataContent(result.data, 'league-matches');
                console.log(`✅ ${test.name}: ${analysis.dataPoints} data points`);
                
                // Analyze match statistics in detail
                if (Array.isArray(result.data)) {
                    result.data.forEach(match => {
                        testResults.dataAnalysis.matches[match.id] = {
                            corners: match.corners_total || 0,
                            goals: match.goals_total || 0,
                            cards: match.cards_total || 0,
                            btts: match.btts || false
                        };
                    });
                }
            } else {
                console.log(`❌ ${test.name}: ${result.error}`);
            }
        }
    }

    testResults.endpoints['league-matches'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 6: League Tables
 */
async function testLeagueTables() {
    console.log('\n=== 6. TESTING LEAGUE TABLES ENDPOINT ===');
    
    const seasonIds = [1625, 1635];
    let endpointResults = [];

    for (const seasonId of seasonIds) {
        const result = await makeApiRequest('/league-tables', { season_id: seasonId }, `League Table ${seasonId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'league-tables');
            console.log(`✅ League Table ${seasonId}: ${analysis.dataPoints} data points`);
            console.log(`📊 Statistics fields: ${analysis.statisticsFields.length}`);
        } else {
            console.log(`❌ League Table ${seasonId}: ${result.error}`);
        }
    }

    testResults.endpoints['league-tables'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 7: Team Data - Individual teams
 */
async function testTeamData() {
    console.log('\n=== 7. TESTING TEAM DATA ENDPOINT ===');
    
    const teamIds = [1, 2, 3, 4, 5]; // Test with sample team IDs
    let endpointResults = [];

    for (const teamId of teamIds) {
        const tests = [
            { params: { team_id: teamId }, name: `Team ${teamId} (basic)` },
            { params: { team_id: teamId, include: 'stats' }, name: `Team ${teamId} (with stats)` },
        ];

        for (const test of tests) {
            const result = await makeApiRequest('/team', test.params, test.name);
            endpointResults.push(result);

            if (result.success) {
                const analysis = analyzeDataContent(result.data, 'team');
                console.log(`✅ ${test.name}: ${analysis.dataPoints} data points`);
                console.log(`🏟️ Statistics fields: ${analysis.statisticsFields.length}`);
            } else {
                console.log(`❌ ${test.name}: ${result.error}`);
            }
        }
    }

    testResults.endpoints['team'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 8: Team Last X Games - Recent form
 */
async function testTeamLastXGames() {
    console.log('\n=== 8. TESTING TEAM LAST X GAMES ENDPOINT ===');
    
    const teamIds = [1, 2, 3];
    let endpointResults = [];

    for (const teamId of teamIds) {
        const result = await makeApiRequest('/lastx', { team_id: teamId }, `Team ${teamId} Last X Games`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'lastx');
            console.log(`✅ Team ${teamId} Last X: ${analysis.dataPoints} data points`);
            console.log(`📈 Recent form statistics: ${analysis.statisticsFields.length}`);
        } else {
            console.log(`❌ Team ${teamId} Last X: ${result.error}`);
        }
    }

    testResults.endpoints['lastx'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 9: Match Details - Comprehensive match data
 */
async function testMatchDetails() {
    console.log('\n=== 9. TESTING MATCH DETAILS ENDPOINT ===');
    
    const matchIds = [1000000, 1000001, 1000002]; // Sample match IDs
    let endpointResults = [];

    for (const matchId of matchIds) {
        const result = await makeApiRequest('/match', { match_id: matchId }, `Match Details ${matchId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'match');
            console.log(`✅ Match ${matchId}: ${analysis.dataPoints} data points`);
            console.log(`⚽ Match statistics: ${analysis.statisticsFields.length}`);
            
            // Store detailed match analysis
            if (result.data) {
                testResults.dataAnalysis.matches[matchId] = {
                    detailed: true,
                    dataPoints: analysis.dataPoints,
                    statisticsFields: analysis.statisticsFields.length
                };
            }
        } else {
            console.log(`❌ Match ${matchId}: ${result.error}`);
        }
    }

    testResults.endpoints['match'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 10: League Players - All parameters
 */
async function testLeaguePlayers() {
    console.log('\n=== 10. TESTING LEAGUE PLAYERS ENDPOINT ===');
    
    const seasonIds = [1625, 1635];
    let endpointResults = [];

    for (const seasonId of seasonIds) {
        const tests = [
            { params: { season_id: seasonId }, name: `League Players ${seasonId} (basic)` },
            { params: { season_id: seasonId, include: 'stats' }, name: `League Players ${seasonId} (with stats)` },
            { params: { season_id: seasonId, include: 'stats', page: 1 }, name: `League Players ${seasonId} (page 1)` },
            { params: { season_id: seasonId, include: 'stats', page: 2 }, name: `League Players ${seasonId} (page 2)` },
        ];

        for (const test of tests) {
            const result = await makeApiRequest('/league-players', test.params, test.name);
            endpointResults.push(result);

            if (result.success) {
                const analysis = analyzeDataContent(result.data, 'league-players');
                console.log(`✅ ${test.name}: ${analysis.dataPoints} data points`);
                console.log(`👤 Player statistics: ${analysis.statisticsFields.length}`);
                
                // Count players
                if (Array.isArray(result.data)) {
                    testResults.dataAnalysis.players[seasonId] = result.data.length;
                }
            } else {
                console.log(`❌ ${test.name}: ${result.error}`);
            }
        }
    }

    testResults.endpoints['league-players'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 11: Individual Player Stats
 */
async function testPlayerStats() {
    console.log('\n=== 11. TESTING INDIVIDUAL PLAYER STATS ENDPOINT ===');
    
    const playerIds = [1, 2, 3, 4, 5];
    let endpointResults = [];

    for (const playerId of playerIds) {
        const result = await makeApiRequest('/player-stats', { player_id: playerId }, `Player Stats ${playerId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'player-stats');
            console.log(`✅ Player ${playerId}: ${analysis.dataPoints} data points`);
            console.log(`📊 Career statistics: ${analysis.statisticsFields.length}`);
        } else {
            console.log(`❌ Player ${playerId}: ${result.error}`);
        }
    }

    testResults.endpoints['player-stats'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 12: League Referees
 */
async function testLeagueReferees() {
    console.log('\n=== 12. TESTING LEAGUE REFEREES ENDPOINT ===');
    
    const seasonIds = [1625, 1635];
    let endpointResults = [];

    for (const seasonId of seasonIds) {
        const result = await makeApiRequest('/league-referees', { season_id: seasonId }, `League Referees ${seasonId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'league-referees');
            console.log(`✅ League Referees ${seasonId}: ${analysis.dataPoints} data points`);
            console.log(`🟨 Referee statistics: ${analysis.statisticsFields.length}`);
            
            // Count referees
            if (Array.isArray(result.data)) {
                testResults.dataAnalysis.referees[seasonId] = result.data.length;
            }
        } else {
            console.log(`❌ League Referees ${seasonId}: ${result.error}`);
        }
    }

    testResults.endpoints['league-referees'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 13: Individual Referee Stats
 */
async function testRefereeStats() {
    console.log('\n=== 13. TESTING INDIVIDUAL REFEREE STATS ENDPOINT ===');
    
    const refereeIds = [1, 2, 3, 4, 5];
    let endpointResults = [];

    for (const refereeId of refereeIds) {
        const result = await makeApiRequest('/referee', { referee_id: refereeId }, `Referee Stats ${refereeId}`);
        endpointResults.push(result);

        if (result.success) {
            const analysis = analyzeDataContent(result.data, 'referee');
            console.log(`✅ Referee ${refereeId}: ${analysis.dataPoints} data points`);
            console.log(`🟨 Referee career statistics: ${analysis.statisticsFields.length}`);
        } else {
            console.log(`❌ Referee ${refereeId}: ${result.error}`);
        }
    }

    testResults.endpoints['referee'] = endpointResults;
    return endpointResults.some(r => r.success);
}

/**
 * Test 14: BTTS Statistics Rankings
 */
async function testBTTSStats() {
    console.log('\n=== 14. TESTING BTTS STATISTICS RANKINGS ENDPOINT ===');
    
    const result = await makeApiRequest('/stats-data-btts', {}, 'BTTS Statistics Rankings');
    testResults.endpoints['stats-data-btts'] = [result];

    if (result.success) {
        const analysis = analyzeDataContent(result.data, 'stats-data-btts');
        console.log(`✅ BTTS Stats: ${analysis.dataPoints} data points`);
        console.log(`🎯 BTTS rankings and statistics: ${analysis.statisticsFields.length}`);
        
        // Store BTTS analysis
        if (result.data) {
            testResults.dataAnalysis.btts.rankings = result.data;
        }
    } else {
        console.log(`❌ BTTS Stats: ${result.error}`);
    }

    return result.success;
}

/**
 * Test 15: Over 2.5 Goals Statistics Rankings
 */
async function testOver25Stats() {
    console.log('\n=== 15. TESTING OVER 2.5 GOALS STATISTICS RANKINGS ENDPOINT ===');
    
    const result = await makeApiRequest('/stats-data-over25', {}, 'Over 2.5 Goals Statistics Rankings');
    testResults.endpoints['stats-data-over25'] = [result];

    if (result.success) {
        const analysis = analyzeDataContent(result.data, 'stats-data-over25');
        console.log(`✅ Over 2.5 Stats: ${analysis.dataPoints} data points`);
        console.log(`⚽ Over 2.5 rankings and statistics: ${analysis.statisticsFields.length}`);
        
        // Store Over 2.5 analysis
        if (result.data) {
            testResults.dataAnalysis.goalsOverUnder.over25Rankings = result.data;
        }
    } else {
        console.log(`❌ Over 2.5 Stats: ${result.error}`);
    }

    return result.success;
}

/**
 * Test 16: API Health Check / Test Call
 */
async function testApiHealthCheck() {
    console.log('\n=== 16. TESTING API HEALTH CHECK ENDPOINT ===');
    
    const result = await makeApiRequest('/test-call', {}, 'API Health Check');
    testResults.endpoints['test-call'] = [result];

    if (result.success) {
        console.log(`✅ API Health Check: Working`);
    } else {
        console.log(`❌ API Health Check: ${result.error}`);
    }

    return result.success;
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🏆 ULTIMATE FOOTYSTATS API COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));

    // Calculate success rates
    let totalTests = 0;
    let successfulTests = 0;

    Object.values(testResults.endpoints).forEach(endpointTests => {
        endpointTests.forEach(test => {
            totalTests++;
            if (test.success) successfulTests++;
        });
    });

    // Update summary
    testResults.summary.successfulEndpoints = Object.keys(testResults.endpoints).filter(endpoint => 
        testResults.endpoints[endpoint].some(test => test.success)
    ).length;
    testResults.summary.failedEndpoints = testResults.summary.totalEndpoints - testResults.summary.successfulEndpoints;
    testResults.summary.logoUrlsFound = testResults.dataAnalysis.logos.length;
    testResults.summary.imageUrlsFound = testResults.dataAnalysis.images.length;
    testResults.summary.statisticsFields = Object.keys(testResults.dataAnalysis.statistics).length;

    // Print summary
    console.log(`\n📊 TEST SUMMARY:`);
    console.log(`   Total Endpoints Tested: ${testResults.summary.totalEndpoints}`);
    console.log(`   Successful Endpoints: ${testResults.summary.successfulEndpoints}`);
    console.log(`   Failed Endpoints: ${testResults.summary.failedEndpoints}`);
    console.log(`   Total Individual Tests: ${totalTests}`);
    console.log(`   Successful Tests: ${successfulTests}`);
    console.log(`   Success Rate: ${((successfulTests/totalTests)*100).toFixed(2)}%`);

    console.log(`\n🖼️ IMAGE & LOGO ANALYSIS:`);
    console.log(`   Logo URLs Found: ${testResults.summary.logoUrlsFound}`);
    console.log(`   Image URLs Found: ${testResults.summary.imageUrlsFound}`);
    
    if (testResults.dataAnalysis.logos.length > 0) {
        console.log(`   Sample Logo URLs:`);
        testResults.dataAnalysis.logos.slice(0, 5).forEach(logo => {
            console.log(`     - ${logo.path}: ${logo.url}`);
        });
    }

    console.log(`\n📈 STATISTICS ANALYSIS:`);
    console.log(`   Unique Statistics Fields: ${testResults.summary.statisticsFields}`);
    console.log(`   Sample Statistics:`);
    Object.keys(testResults.dataAnalysis.statistics).slice(0, 10).forEach(stat => {
        console.log(`     - ${stat}: ${testResults.dataAnalysis.statistics[stat].length} occurrences`);
    });

    console.log(`\n⚽ MATCH DATA ANALYSIS:`);
    console.log(`   Matches Analyzed: ${Object.keys(testResults.dataAnalysis.matches).length}`);
    console.log(`   Players Data: ${Object.keys(testResults.dataAnalysis.players).length} leagues`);
    console.log(`   Referees Data: ${Object.keys(testResults.dataAnalysis.referees).length} leagues`);

    console.log(`\n🎯 CORNER & GOALS ANALYSIS:`);
    const cornerMatches = Object.values(testResults.dataAnalysis.matches).filter(m => m.corners > 0).length;
    const goalMatches = Object.values(testResults.dataAnalysis.matches).filter(m => m.goals > 0).length;
    console.log(`   Matches with Corner Data: ${cornerMatches}`);
    console.log(`   Matches with Goals Data: ${goalMatches}`);

    console.log(`\n🏃‍♂️ ENDPOINT STATUS:`);
    Object.keys(testResults.endpoints).forEach(endpoint => {
        const tests = testResults.endpoints[endpoint];
        const successful = tests.filter(t => t.success).length;
        const total = tests.length;
        const status = successful > 0 ? '✅' : '❌';
        console.log(`   ${status} ${endpoint}: ${successful}/${total} tests passed`);
    });

    return testResults;
}

/**
 * Save test results to file
 */
function saveTestResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ultimate-footystats-test-results-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n💾 Test results saved to: ${filename}`);
    
    // Also save a summary report
    const summaryFilename = `ultimate-footystats-summary-${timestamp}.txt`;
    const summaryPath = path.join(__dirname, summaryFilename);
    
    let summaryText = `ULTIMATE FOOTYSTATS API TEST SUMMARY\n`;
    summaryText += `Generated: ${new Date().toISOString()}\n`;
    summaryText += `API Key: ${API_KEY}\n\n`;
    summaryText += `Total Endpoints: ${results.summary.totalEndpoints}\n`;
    summaryText += `Successful Endpoints: ${results.summary.successfulEndpoints}\n`;
    summaryText += `Logo URLs Found: ${results.summary.logoUrlsFound}\n`;
    summaryText += `Statistics Fields Found: ${results.summary.statisticsFields}\n\n`;
    
    Object.keys(results.endpoints).forEach(endpoint => {
        const tests = results.endpoints[endpoint];
        const successful = tests.filter(t => t.success).length;
        summaryText += `${endpoint}: ${successful}/${tests.length} tests passed\n`;
    });
    
    fs.writeFileSync(summaryPath, summaryText, 'utf8');
    console.log(`📝 Summary report saved to: ${summaryFilename}`);
}

/**
 * Main test execution function
 */
async function runUltimateFootyStatsTest() {
    console.log('🚀 ULTIMATE FOOTYSTATS API COMPREHENSIVE TEST STARTING...');
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`📅 Test Started: ${new Date().toISOString()}\n`);

    const testFunctions = [
        testLeagueList,           // 1. League List
        testCountryList,          // 2. Country List  
        testTodaysMatches,        // 3. Today's Matches
        testLeagueSeasonStats,    // 4. League Season Stats
        testLeagueMatches,        // 5. League Matches
        testLeagueTables,         // 6. League Tables
        testTeamData,             // 7. Team Data
        testTeamLastXGames,       // 8. Team Last X Games
        testMatchDetails,         // 9. Match Details
        testLeaguePlayers,        // 10. League Players
        testPlayerStats,          // 11. Player Stats
        testLeagueReferees,       // 12. League Referees
        testRefereeStats,         // 13. Referee Stats
        testBTTSStats,           // 14. BTTS Stats
        testOver25Stats,         // 15. Over 2.5 Stats
        testApiHealthCheck       // 16. API Health Check
    ];

    // Execute all tests
    for (let i = 0; i < testFunctions.length; i++) {
        try {
            await testFunctions[i]();
            console.log(`\n⏱️ Progress: ${i + 1}/${testFunctions.length} endpoint groups completed`);
        } catch (error) {
            console.error(`\n💥 Error in test ${i + 1}:`, error.message);
        }
        
        // Add delay between endpoint groups to avoid rate limiting
        if (i < testFunctions.length - 1) {
            console.log('⏳ Waiting 2 seconds before next endpoint group...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Generate and save final report
    const finalResults = generateTestReport();
    saveTestResults(finalResults);

    console.log('\n🎉 ULTIMATE FOOTYSTATS API TEST COMPLETED!');
    console.log(`📊 Final Success Rate: ${((finalResults.summary.successfulEndpoints/finalResults.summary.totalEndpoints)*100).toFixed(2)}%`);
}

// Run the ultimate test
if (require.main === module) {
    runUltimateFootyStatsTest().catch(console.error);
}

module.exports = {
    runUltimateFootyStatsTest,
    testResults
};
