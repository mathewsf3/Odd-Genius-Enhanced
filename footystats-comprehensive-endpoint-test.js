/**
 * FOOTYSTATS API COMPREHENSIVE ENDPOINT TESTING
 * 
 * Tests all required endpoints for frontend development:
 * - Team Information (logos, form)
 * - League Information (logos, standings)
 * - Head-to-Head Data
 * - Statistical Data (corners, cards, goals, BTTS)
 * - Referee Information
 * - Player Statistics
 * - Prediction Data
 * - Live Games
 * - Upcoming Games
 * 
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';
const TIMEOUT = 30000; // 30 seconds

// Test results storage
let testResults = {
    timestamp: new Date().toISOString(),
    apiKey: API_KEY,
    baseUrl: BASE_URL,
    summary: {
        totalEndpoints: 0,
        successfulEndpoints: 0,
        failedEndpoints: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
    },
    categories: {
        teamInformation: { status: 'pending', endpoints: [], sampleData: {} },
        leagueInformation: { status: 'pending', endpoints: [], sampleData: {} },
        headToHead: { status: 'pending', endpoints: [], sampleData: {} },
        statisticalData: { status: 'pending', endpoints: [], sampleData: {} },
        refereeInformation: { status: 'pending', endpoints: [], sampleData: {} },
        playerStatistics: { status: 'pending', endpoints: [], sampleData: {} },
        predictionData: { status: 'pending', endpoints: [], sampleData: {} },
        liveGames: { status: 'pending', endpoints: [], sampleData: {} },
        upcomingGames: { status: 'pending', endpoints: [], sampleData: {} }
    },
    detailedResults: [],
    dataCompleteness: {
        teamLogos: false,
        leagueLogos: false,
        formData: false,
        cornersData: false,
        cardsData: false,
        goalsData: false,
        bttsData: false,
        refereeData: false,
        playerData: false,
        liveMatchData: false,
        upcomingMatchData: false,
        predictionData: false
    },
    missingDataPoints: [],
    recommendations: []
};

/**
 * Make API request with comprehensive error handling
 */
async function makeApiRequest(endpoint, params = {}, testName = '', category = '') {
    const startTime = Date.now();
    
    try {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            params: { key: API_KEY, ...params },
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'OddGenius-FootyStats-Comprehensive-Test/1.0',
                'Accept': 'application/json'
            }
        };

        console.log(`🔄 Testing: ${testName}`);
        console.log(`   URL: ${url}`);
        console.log(`   Params: ${JSON.stringify(params)}`);

        const response = await axios.get(url, config);
        const responseTime = Date.now() - startTime;
        
        const result = {
            testName,
            category,
            endpoint,
            params,
            success: true,
            statusCode: response.status,
            responseTime,
            dataSize: JSON.stringify(response.data).length,
            hasData: !!response.data,
            sampleData: response.data,
            timestamp: new Date().toISOString()
        };

        console.log(`   ✅ SUCCESS (${response.status}) - ${responseTime}ms - ${result.dataSize} bytes`);
        
        testResults.summary.successfulRequests++;
        testResults.detailedResults.push(result);
        
        return result;
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        const result = {
            testName,
            category,
            endpoint,
            params,
            success: false,
            statusCode: error.response?.status || 0,
            responseTime,
            error: error.message,
            errorDetails: error.response?.data,
            timestamp: new Date().toISOString()
        };

        console.log(`   ❌ FAILED (${result.statusCode}) - ${responseTime}ms - ${error.message}`);
        
        testResults.summary.failedRequests++;
        testResults.detailedResults.push(result);
        
        return result;
    } finally {
        testResults.summary.totalRequests++;
    }
}

/**
 * Analyze data completeness for specific requirements
 */
function analyzeDataCompleteness(data, category, testName) {
    if (!data || typeof data !== 'object') return;

    // Check for team logos
    if (category === 'teamInformation') {
        const hasLogos = findInObject(data, ['logo', 'image', 'badge', 'crest']);
        if (hasLogos.length > 0) {
            testResults.dataCompleteness.teamLogos = true;
            console.log(`   📷 Found team logos: ${hasLogos.length} entries`);
        }
    }

    // Check for league logos
    if (category === 'leagueInformation') {
        const hasLogos = findInObject(data, ['logo', 'image', 'badge']);
        if (hasLogos.length > 0) {
            testResults.dataCompleteness.leagueLogos = true;
            console.log(`   📷 Found league logos: ${hasLogos.length} entries`);
        }
    }

    // Check for form data
    if (testName.toLowerCase().includes('form') || testName.toLowerCase().includes('last')) {
        const hasFormData = findInObject(data, ['result', 'win', 'loss', 'draw', 'goals']);
        if (hasFormData.length > 0) {
            testResults.dataCompleteness.formData = true;
            console.log(`   📈 Found form data: ${hasFormData.length} entries`);
        }
    }

    // Check for corners data
    if (testName.toLowerCase().includes('corner')) {
        const hasCornersData = findInObject(data, ['corner', 'corners']);
        if (hasCornersData.length > 0) {
            testResults.dataCompleteness.cornersData = true;
            console.log(`   ⚡ Found corners data: ${hasCornersData.length} entries`);
        }
    }

    // Check for cards data
    if (testName.toLowerCase().includes('card')) {
        const hasCardsData = findInObject(data, ['card', 'yellow', 'red']);
        if (hasCardsData.length > 0) {
            testResults.dataCompleteness.cardsData = true;
            console.log(`   🟨 Found cards data: ${hasCardsData.length} entries`);
        }
    }

    // Check for goals data
    if (testName.toLowerCase().includes('goal') || testName.toLowerCase().includes('over')) {
        const hasGoalsData = findInObject(data, ['goal', 'score', 'over', 'under']);
        if (hasGoalsData.length > 0) {
            testResults.dataCompleteness.goalsData = true;
            console.log(`   ⚽ Found goals data: ${hasGoalsData.length} entries`);
        }
    }

    // Check for BTTS data
    if (testName.toLowerCase().includes('btts')) {
        const hasBttsData = findInObject(data, ['btts', 'both', 'score']);
        if (hasBttsData.length > 0) {
            testResults.dataCompleteness.bttsData = true;
            console.log(`   🎯 Found BTTS data: ${hasBttsData.length} entries`);
        }
    }

    // Check for referee data
    if (category === 'refereeInformation') {
        const hasRefereeData = findInObject(data, ['referee', 'official', 'name']);
        if (hasRefereeData.length > 0) {
            testResults.dataCompleteness.refereeData = true;
            console.log(`   👨‍⚖️ Found referee data: ${hasRefereeData.length} entries`);
        }
    }

    // Check for player data
    if (category === 'playerStatistics') {
        const hasPlayerData = findInObject(data, ['player', 'name', 'position', 'stats']);
        if (hasPlayerData.length > 0) {
            testResults.dataCompleteness.playerData = true;
            console.log(`   👤 Found player data: ${hasPlayerData.length} entries`);
        }
    }

    // Check for live match data
    if (category === 'liveGames') {
        const hasLiveData = findInObject(data, ['live', 'status', 'minute', 'score']);
        if (hasLiveData.length > 0) {
            testResults.dataCompleteness.liveMatchData = true;
            console.log(`   🔴 Found live match data: ${hasLiveData.length} entries`);
        }
    }
}

/**
 * Helper function to find specific fields in nested objects
 */
function findInObject(obj, searchTerms, results = []) {
    if (!obj || typeof obj !== 'object') return results;

    Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = obj[key];

        // Check if key matches any search terms
        if (searchTerms.some(term => lowerKey.includes(term.toLowerCase()))) {
            results.push({ key, value, path: key });
        }

        // Recurse into nested objects and arrays
        if (typeof value === 'object') {
            findInObject(value, searchTerms, results);
        }
    });

    return results;
}

/**
 * 1. Test Team Information
 */
async function testTeamInformation() {
    console.log('\n=== 1. TESTING TEAM INFORMATION ===');
    const category = 'teamInformation';
    const results = [];

    // Test team data for popular teams
    const teamIds = [1, 2, 4, 5, 10]; // Major teams
    
    for (const teamId of teamIds) {
        // Basic team info
        const teamResult = await makeApiRequest('/team', { team_id: teamId }, `Team ${teamId} Information`, category);
        results.push(teamResult);
        
        if (teamResult.success) {
            analyzeDataCompleteness(teamResult.sampleData, category, teamResult.testName);
            
            // Store sample data
            if (!testResults.categories.teamInformation.sampleData.teamInfo) {
                testResults.categories.teamInformation.sampleData.teamInfo = teamResult.sampleData;
            }
        }

        // Team form data
        const formResult = await makeApiRequest('/lastx', { team_id: teamId }, `Team ${teamId} Form Data`, category);
        results.push(formResult);
        
        if (formResult.success) {
            analyzeDataCompleteness(formResult.sampleData, category, formResult.testName);
            
            if (!testResults.categories.teamInformation.sampleData.formData) {
                testResults.categories.teamInformation.sampleData.formData = formResult.sampleData;
            }
        }
    }

    testResults.categories.teamInformation.endpoints = results;
    testResults.categories.teamInformation.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 2. Test League Information
 */
async function testLeagueInformation() {
    console.log('\n=== 2. TESTING LEAGUE INFORMATION ===');
    const category = 'leagueInformation';
    const results = [];

    // Get league list
    const leaguesResult = await makeApiRequest('/league-list', {}, 'League List', category);
    results.push(leaguesResult);
    
    let seasonIds = [];
    if (leaguesResult.success && Array.isArray(leaguesResult.data)) {
        seasonIds = leaguesResult.data.slice(0, 5).map(league => league.id);
        analyzeDataCompleteness(leaguesResult.sampleData, category, leaguesResult.testName);
        testResults.categories.leagueInformation.sampleData.leagues = leaguesResult.sampleData;
    } else {
        seasonIds = [1625, 1635, 1645]; // Fallback
    }

    // Test league seasons and tables
    for (const seasonId of seasonIds) {
        // League season info
        const seasonResult = await makeApiRequest('/league-season', { season_id: seasonId }, `League Season ${seasonId}`, category);
        results.push(seasonResult);
        
        if (seasonResult.success) {
            analyzeDataCompleteness(seasonResult.sampleData, category, seasonResult.testName);
            if (!testResults.categories.leagueInformation.sampleData.seasonInfo) {
                testResults.categories.leagueInformation.sampleData.seasonInfo = seasonResult.sampleData;
            }
        }

        // League table
        const tableResult = await makeApiRequest('/league-tables', { season_id: seasonId }, `League Table ${seasonId}`, category);
        results.push(tableResult);
        
        if (tableResult.success) {
            analyzeDataCompleteness(tableResult.sampleData, category, tableResult.testName);
            if (!testResults.categories.leagueInformation.sampleData.tableData) {
                testResults.categories.leagueInformation.sampleData.tableData = tableResult.sampleData;
            }
        }
    }

    testResults.categories.leagueInformation.endpoints = results;
    testResults.categories.leagueInformation.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 3. Test Head-to-Head Data
 */
async function testHeadToHeadData() {
    console.log('\n=== 3. TESTING HEAD-TO-HEAD DATA ===');
    const category = 'headToHead';
    const results = [];

    // Get some matches to extract team pairs
    const matchesResult = await makeApiRequest('/todays-matches', {}, 'Today Matches for H2H', category);
    results.push(matchesResult);

    let teamPairs = [];
    if (matchesResult.success && Array.isArray(matchesResult.data)) {
        teamPairs = matchesResult.data.slice(0, 3).map(match => ({
            homeTeam: match.home_id,
            awayTeam: match.away_id
        })).filter(pair => pair.homeTeam && pair.awayTeam);
    }

    // If no matches today, use sample team pairs
    if (teamPairs.length === 0) {
        teamPairs = [
            { homeTeam: 1, awayTeam: 2 },
            { homeTeam: 4, awayTeam: 5 },
            { homeTeam: 10, awayTeam: 15 }
        ];
    }

    // Test H2H for each team pair
    for (const pair of teamPairs) {
        const h2hResult = await makeApiRequest('/h2h', 
            { home_team: pair.homeTeam, away_team: pair.awayTeam }, 
            `H2H: Team ${pair.homeTeam} vs ${pair.awayTeam}`, 
            category
        );
        results.push(h2hResult);
        
        if (h2hResult.success) {
            analyzeDataCompleteness(h2hResult.sampleData, category, h2hResult.testName);
            if (!testResults.categories.headToHead.sampleData.h2hData) {
                testResults.categories.headToHead.sampleData.h2hData = h2hResult.sampleData;
            }
        }
    }

    testResults.categories.headToHead.endpoints = results;
    testResults.categories.headToHead.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 4. Test Statistical Data (Corners, Cards, Goals, BTTS)
 */
async function testStatisticalData() {
    console.log('\n=== 4. TESTING STATISTICAL DATA ===');
    const category = 'statisticalData';
    const results = [];

    // BTTS Statistics
    const bttsResult = await makeApiRequest('/stats-data-btts', {}, 'BTTS Statistics', category);
    results.push(bttsResult);
    if (bttsResult.success) {
        analyzeDataCompleteness(bttsResult.sampleData, category, bttsResult.testName);
        testResults.categories.statisticalData.sampleData.bttsStats = bttsResult.sampleData;
    }

    // Over 2.5 Goals Statistics
    const over25Result = await makeApiRequest('/stats-data-over25', {}, 'Over 2.5 Goals Statistics', category);
    results.push(over25Result);
    if (over25Result.success) {
        analyzeDataCompleteness(over25Result.sampleData, category, over25Result.testName);
        testResults.categories.statisticalData.sampleData.over25Stats = over25Result.sampleData;
    }

    // League matches for detailed statistics
    const seasonIds = [1625, 1635];
    for (const seasonId of seasonIds) {
        const matchesResult = await makeApiRequest('/league-matches', 
            { season_id: seasonId, max_per_page: 100 }, 
            `League ${seasonId} Matches Statistics`, 
            category
        );
        results.push(matchesResult);
        
        if (matchesResult.success) {
            analyzeDataCompleteness(matchesResult.sampleData, category, matchesResult.testName);
            if (!testResults.categories.statisticalData.sampleData.matchesStats) {
                testResults.categories.statisticalData.sampleData.matchesStats = matchesResult.sampleData;
            }
        }
    }

    testResults.categories.statisticalData.endpoints = results;
    testResults.categories.statisticalData.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 5. Test Referee Information
 */
async function testRefereeInformation() {
    console.log('\n=== 5. TESTING REFEREE INFORMATION ===');
    const category = 'refereeInformation';
    const results = [];

    // League referees
    const seasonIds = [1625, 1635];
    for (const seasonId of seasonIds) {
        const refereesResult = await makeApiRequest('/league-referees', 
            { season_id: seasonId }, 
            `League ${seasonId} Referees`, 
            category
        );
        results.push(refereesResult);
        
        if (refereesResult.success) {
            analyzeDataCompleteness(refereesResult.sampleData, category, refereesResult.testName);
            if (!testResults.categories.refereeInformation.sampleData.leagueReferees) {
                testResults.categories.refereeInformation.sampleData.leagueReferees = refereesResult.sampleData;
            }
        }
    }

    // Individual referee stats
    const refereeIds = [1, 2, 3, 4, 5];
    for (const refereeId of refereeIds) {
        const refereeResult = await makeApiRequest('/referee', 
            { referee_id: refereeId }, 
            `Referee ${refereeId} Statistics`, 
            category
        );
        results.push(refereeResult);
        
        if (refereeResult.success) {
            analyzeDataCompleteness(refereeResult.sampleData, category, refereeResult.testName);
            if (!testResults.categories.refereeInformation.sampleData.refereeStats) {
                testResults.categories.refereeInformation.sampleData.refereeStats = refereeResult.sampleData;
            }
        }
    }

    testResults.categories.refereeInformation.endpoints = results;
    testResults.categories.refereeInformation.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 6. Test Player Statistics
 */
async function testPlayerStatistics() {
    console.log('\n=== 6. TESTING PLAYER STATISTICS ===');
    const category = 'playerStatistics';
    const results = [];

    // League players
    const seasonIds = [1625, 1635];
    for (const seasonId of seasonIds) {
        const playersResult = await makeApiRequest('/league-players', 
            { season_id: seasonId, include: 'stats' }, 
            `League ${seasonId} Players`, 
            category
        );
        results.push(playersResult);
        
        if (playersResult.success) {
            analyzeDataCompleteness(playersResult.sampleData, category, playersResult.testName);
            if (!testResults.categories.playerStatistics.sampleData.leaguePlayers) {
                testResults.categories.playerStatistics.sampleData.leaguePlayers = playersResult.sampleData;
            }
        }
    }

    // Individual player stats
    const playerIds = [1, 2, 3, 4, 5];
    for (const playerId of playerIds) {
        const playerResult = await makeApiRequest('/player-stats', 
            { player_id: playerId }, 
            `Player ${playerId} Statistics`, 
            category
        );
        results.push(playerResult);
        
        if (playerResult.success) {
            analyzeDataCompleteness(playerResult.sampleData, category, playerResult.testName);
            if (!testResults.categories.playerStatistics.sampleData.playerStats) {
                testResults.categories.playerStatistics.sampleData.playerStats = playerResult.sampleData;
            }
        }
    }

    testResults.categories.playerStatistics.endpoints = results;
    testResults.categories.playerStatistics.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 7. Test Live Games
 */
async function testLiveGames() {
    console.log('\n=== 7. TESTING LIVE GAMES ===');
    const category = 'liveGames';
    const results = [];

    // Today's matches (includes live games)
    const todayResult = await makeApiRequest('/todays-matches', {}, 'Live/Today Games', category);
    results.push(todayResult);
    
    if (todayResult.success) {
        analyzeDataCompleteness(todayResult.sampleData, category, todayResult.testName);
        testResults.categories.liveGames.sampleData.todayMatches = todayResult.sampleData;

        // Check for live matches in the response
        if (Array.isArray(todayResult.sampleData)) {
            const liveMatches = todayResult.sampleData.filter(match => 
                match.status === 'live' || match.status === 'in-play' || 
                match.status === 'HT' || match.status === '1H' || match.status === '2H'
            );
            
            console.log(`   🔴 Found ${liveMatches.length} live matches`);
            
            if (liveMatches.length > 0) {
                testResults.categories.liveGames.sampleData.liveMatches = liveMatches.slice(0, 5);
            }
        }
    }

    // Test specific live match details if available
    const matchIds = [1000000, 1000001, 1000002];
    for (const matchId of matchIds) {
        const matchResult = await makeApiRequest('/match', 
            { match_id: matchId }, 
            `Live Match ${matchId} Details`, 
            category
        );
        results.push(matchResult);
        
        if (matchResult.success) {
            analyzeDataCompleteness(matchResult.sampleData, category, matchResult.testName);
            if (!testResults.categories.liveGames.sampleData.matchDetails) {
                testResults.categories.liveGames.sampleData.matchDetails = matchResult.sampleData;
            }
        }
    }

    testResults.categories.liveGames.endpoints = results;
    testResults.categories.liveGames.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 8. Test Upcoming Games
 */
async function testUpcomingGames() {
    console.log('\n=== 8. TESTING UPCOMING GAMES ===');
    const category = 'upcomingGames';
    const results = [];

    // Today's matches (includes upcoming)
    const todayResult = await makeApiRequest('/todays-matches', {}, 'Today/Upcoming Games', category);
    results.push(todayResult);
    
    if (todayResult.success) {
        analyzeDataCompleteness(todayResult.sampleData, category, todayResult.testName);
        testResults.categories.upcomingGames.sampleData.todayMatches = todayResult.sampleData;

        // Filter for upcoming matches
        if (Array.isArray(todayResult.sampleData)) {
            const upcomingMatches = todayResult.sampleData.filter(match => 
                match.status === 'scheduled' || match.status === 'not-started' || 
                match.status === 'upcoming' || match.status === ''
            );
            
            console.log(`   📅 Found ${upcomingMatches.length} upcoming matches`);
            
            if (upcomingMatches.length > 0) {
                testResults.categories.upcomingGames.sampleData.upcomingMatches = upcomingMatches.slice(0, 10);
            }
        }
    }

    // Test future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const tomorrowResult = await makeApiRequest('/todays-matches', 
        { date: tomorrowStr }, 
        `Tomorrow Games (${tomorrowStr})`, 
        category
    );
    results.push(tomorrowResult);
    
    if (tomorrowResult.success) {
        analyzeDataCompleteness(tomorrowResult.sampleData, category, tomorrowResult.testName);
        testResults.categories.upcomingGames.sampleData.tomorrowMatches = tomorrowResult.sampleData;
    }

    testResults.categories.upcomingGames.endpoints = results;
    testResults.categories.upcomingGames.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * 9. Test API Health and Basic Functionality
 */
async function testApiHealth() {
    console.log('\n=== 9. TESTING API HEALTH ===');
    const category = 'predictionData';
    const results = [];

    // API health check
    const healthResult = await makeApiRequest('/test-call', {}, 'API Health Check', category);
    results.push(healthResult);

    // Country list (basic functionality test)
    const countryResult = await makeApiRequest('/country-list', {}, 'Country List', category);
    results.push(countryResult);

    testResults.categories.predictionData.endpoints = results;
    testResults.categories.predictionData.status = results.some(r => r.success) ? 'success' : 'failed';
    
    return results;
}

/**
 * Generate comprehensive test report
 */
function generateTestReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🏆 FOOTYSTATS API COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));

    // Calculate summary statistics
    testResults.summary.totalEndpoints = Object.keys(testResults.categories).length;
    testResults.summary.successfulEndpoints = Object.values(testResults.categories).filter(cat => cat.status === 'success').length;
    testResults.summary.failedEndpoints = testResults.summary.totalEndpoints - testResults.summary.successfulEndpoints;

    // Print summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`   API Key: ${API_KEY.substring(0, 20)}...`);
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Test Duration: ${new Date().toISOString()}`);
    console.log(`   Total Endpoint Categories: ${testResults.summary.totalEndpoints}`);
    console.log(`   Successful Categories: ${testResults.summary.successfulEndpoints}`);
    console.log(`   Failed Categories: ${testResults.summary.failedEndpoints}`);
    console.log(`   Total Requests: ${testResults.summary.totalRequests}`);
    console.log(`   Successful Requests: ${testResults.summary.successfulRequests}`);
    console.log(`   Failed Requests: ${testResults.summary.failedRequests}`);
    console.log(`   Overall Success Rate: ${((testResults.summary.successfulRequests/testResults.summary.totalRequests)*100).toFixed(2)}%`);

    // Print data completeness
    console.log(`\n✅ DATA COMPLETENESS:`);
    Object.entries(testResults.dataCompleteness).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`   ${status} ${label}: ${value ? 'AVAILABLE' : 'NOT FOUND'}`);
    });

    // Print category status
    console.log(`\n📋 CATEGORY STATUS:`);
    Object.entries(testResults.categories).forEach(([categoryName, categoryData]) => {
        const status = categoryData.status === 'success' ? '✅' : '❌';
        const label = categoryName.replace(/([A-Z])/g, ' $1').toLowerCase();
        const endpointCount = categoryData.endpoints.length;
        const successCount = categoryData.endpoints.filter(ep => ep.success).length;
        console.log(`   ${status} ${label}: ${successCount}/${endpointCount} endpoints working`);
    });

    // Identify missing data points
    testResults.missingDataPoints = [];
    Object.entries(testResults.dataCompleteness).forEach(([key, value]) => {
        if (!value) {
            testResults.missingDataPoints.push(key);
        }
    });

    if (testResults.missingDataPoints.length > 0) {
        console.log(`\n⚠️ MISSING DATA POINTS:`);
        testResults.missingDataPoints.forEach(missing => {
            console.log(`   - ${missing.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        });
    }

    // Generate recommendations
    generateRecommendations();

    if (testResults.recommendations.length > 0) {
        console.log(`\n💡 RECOMMENDATIONS:`);
        testResults.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }

    console.log(`\n🎯 FRONTEND DEVELOPMENT READINESS:`);
    const readinessScore = (testResults.summary.successfulRequests / testResults.summary.totalRequests) * 100;
    if (readinessScore >= 90) {
        console.log(`   🟢 EXCELLENT (${readinessScore.toFixed(1)}%) - Ready for full frontend development`);
    } else if (readinessScore >= 75) {
        console.log(`   🟡 GOOD (${readinessScore.toFixed(1)}%) - Ready with some limitations`);
    } else {
        console.log(`   🔴 NEEDS WORK (${readinessScore.toFixed(1)}%) - Address missing endpoints before frontend development`);
    }

    return testResults;
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations() {
    testResults.recommendations = [];

    if (!testResults.dataCompleteness.teamLogos) {
        testResults.recommendations.push("Team logos not found in standard endpoints. Check for image_path or logo_url fields, or use alternative logo sources.");
    }

    if (!testResults.dataCompleteness.liveMatchData) {
        testResults.recommendations.push("Live match data may require different endpoints or status field filtering. Check match status values.");
    }

    if (testResults.summary.failedRequests > testResults.summary.successfulRequests * 0.1) {
        testResults.recommendations.push("High failure rate detected. Verify API key validity and rate limiting settings.");
    }

    if (!testResults.dataCompleteness.predictionData) {
        testResults.recommendations.push("Prediction data endpoints may need custom calculation based on statistical data provided.");
    }
}

/**
 * Save detailed results to files
 */
function saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save full results
    const resultsFile = `footystats-comprehensive-test-results-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Full results saved to: ${resultsFile}`);
    
    // Save sample data for frontend reference
    const sampleDataFile = `footystats-sample-data-${timestamp}.json`;
    const sampleData = {};
    Object.entries(testResults.categories).forEach(([category, data]) => {
        sampleData[category] = data.sampleData;
    });
    fs.writeFileSync(sampleDataFile, JSON.stringify(sampleData, null, 2));
    console.log(`📋 Sample data saved to: ${sampleDataFile}`);
    
    // Save summary report
    const summaryFile = `footystats-test-summary-${timestamp}.txt`;
    let summary = `FOOTYSTATS API COMPREHENSIVE TEST SUMMARY\n`;
    summary += `Generated: ${testResults.timestamp}\n`;
    summary += `API Key: ${API_KEY}\n`;
    summary += `Base URL: ${BASE_URL}\n\n`;
    summary += `OVERALL RESULTS:\n`;
    summary += `Total Requests: ${testResults.summary.totalRequests}\n`;
    summary += `Successful: ${testResults.summary.successfulRequests}\n`;
    summary += `Failed: ${testResults.summary.failedRequests}\n`;
    summary += `Success Rate: ${((testResults.summary.successfulRequests/testResults.summary.totalRequests)*100).toFixed(2)}%\n\n`;
    
    summary += `DATA COMPLETENESS:\n`;
    Object.entries(testResults.dataCompleteness).forEach(([key, value]) => {
        summary += `${key}: ${value ? 'AVAILABLE' : 'MISSING'}\n`;
    });
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary report saved to: ${summaryFile}`);
}

/**
 * Main test execution
 */
async function runComprehensiveTest() {
    console.log('🚀 FOOTYSTATS API COMPREHENSIVE ENDPOINT TESTING');
    console.log('================================================');
    console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`⏱️ Timeout: ${TIMEOUT}ms`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    const testFunctions = [
        testTeamInformation,
        testLeagueInformation,
        testHeadToHeadData,
        testStatisticalData,
        testRefereeInformation,
        testPlayerStatistics,
        testLiveGames,
        testUpcomingGames,
        testApiHealth
    ];

    // Execute all test categories
    for (let i = 0; i < testFunctions.length; i++) {
        try {
            await testFunctions[i]();
            console.log(`\n⏱️ Progress: ${i + 1}/${testFunctions.length} categories completed\n`);
        } catch (error) {
            console.error(`\n💥 Error in test category ${i + 1}:`, error.message);
        }
        
        // Rate limiting delay
        if (i < testFunctions.length - 1) {
            console.log('⏳ Waiting 3 seconds before next category...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Generate final report
    const finalResults = generateTestReport();
    saveResults();

    console.log('\n🎉 COMPREHENSIVE FOOTYSTATS API TEST COMPLETED!');
    console.log(`📊 Final Success Rate: ${((finalResults.summary.successfulRequests/finalResults.summary.totalRequests)*100).toFixed(2)}%`);
    
    return finalResults;
}

// Run the comprehensive test
if (require.main === module) {
    runComprehensiveTest().catch(console.error);
}

module.exports = {
    runComprehensiveTest,
    testResults
};
