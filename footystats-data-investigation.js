/**
 * FOOTYSTATS API DETAILED DATA INVESTIGATION
 * 
 * Investigates specific issues found in comprehensive test:
 * 1. H2H endpoint (404 errors)
 * 2. Corners data location
 * 3. Cards data location
 * 4. Upcoming match filtering
 * 5. Prediction data alternatives
 */

const axios = require('axios');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';

async function makeRequest(endpoint, params = {}) {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { key: API_KEY, ...params },
            timeout: 15000
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.message, 
            status: error.response?.status,
            data: error.response?.data 
        };
    }
}

function findDataFields(obj, searchTerms, results = [], path = '') {
    if (!obj || typeof obj !== 'object') return results;

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();

        // Check if key matches search terms
        if (searchTerms.some(term => lowerKey.includes(term.toLowerCase()))) {
            results.push({
                path: currentPath,
                key,
                value,
                type: typeof value
            });
        }

        // Recurse into nested objects
        if (typeof value === 'object') {
            findDataFields(value, searchTerms, results, currentPath);
        }
    });

    return results;
}

async function investigateH2HEndpoint() {
    console.log('🔍 INVESTIGATING H2H ENDPOINT');
    console.log('=============================');

    // Try different H2H endpoint variations
    const variations = [
        { endpoint: '/h2h', params: { home_team: 1, away_team: 2 } },
        { endpoint: '/head-to-head', params: { home_team: 1, away_team: 2 } },
        { endpoint: '/h2h', params: { team1: 1, team2: 2 } },
        { endpoint: '/h2h', params: { homeTeam: 1, awayTeam: 2 } },
        { endpoint: '/team-vs-team', params: { home_team: 1, away_team: 2 } }
    ];

    let workingH2H = null;

    for (const variation of variations) {
        console.log(`\n🔄 Testing: ${variation.endpoint} with params ${JSON.stringify(variation.params)}`);
        const result = await makeRequest(variation.endpoint, variation.params);
        
        if (result.success) {
            console.log(`✅ SUCCESS: ${variation.endpoint} works!`);
            workingH2H = variation;
            break;
        } else {
            console.log(`❌ FAILED: ${result.status} - ${result.error}`);
        }
    }

    if (!workingH2H) {
        console.log('\n⚠️ No working H2H endpoint found. May need to use match history from team endpoints.');
        
        // Try getting team match history as alternative
        console.log('\n🔄 Testing team match history as H2H alternative...');
        const teamResult = await makeRequest('/team', { team_id: 1 });
        if (teamResult.success) {
            const matches = findDataFields(teamResult.data, ['match', 'opponent', 'result', 'fixture']);
            console.log(`✅ Found ${matches.length} match-related fields in team data`);
            console.log('Sample matches:', matches.slice(0, 3));
        }
    }

    return workingH2H;
}

async function investigateCornersData() {
    console.log('\n🔍 INVESTIGATING CORNERS DATA');
    console.log('=============================');

    // Check various endpoints for corners data
    const endpoints = [
        { name: 'Team Data', endpoint: '/team', params: { team_id: 1 } },
        { name: 'Team Form', endpoint: '/lastx', params: { team_id: 1 } },
        { name: 'League Matches', endpoint: '/league-matches', params: { season_id: 1625, max_per_page: 10 } },
        { name: 'Match Details', endpoint: '/match', params: { match_id: 1000000 } },
        { name: 'Today Matches', endpoint: '/todays-matches', params: {} }
    ];

    let cornersFound = [];

    for (const ep of endpoints) {
        console.log(`\n🔄 Checking ${ep.name} for corners data...`);
        const result = await makeRequest(ep.endpoint, ep.params);
        
        if (result.success) {
            const corners = findDataFields(result.data, ['corner', 'corners']);
            if (corners.length > 0) {
                console.log(`✅ Found ${corners.length} corner-related fields`);
                cornersFound.push({
                    endpoint: ep.name,
                    fields: corners.slice(0, 5) // Sample
                });
                
                corners.slice(0, 3).forEach(corner => {
                    console.log(`   - ${corner.path}: ${corner.value} (${corner.type})`);
                });
            } else {
                console.log(`❌ No corner data found`);
            }
        }
    }

    console.log(`\n📊 CORNERS DATA SUMMARY:`);
    console.log(`Found corners data in ${cornersFound.length} endpoints:`);
    cornersFound.forEach(found => {
        console.log(`   - ${found.endpoint}: ${found.fields.length} fields`);
    });

    return cornersFound;
}

async function investigateCardsData() {
    console.log('\n🔍 INVESTIGATING CARDS DATA');
    console.log('==========================');

    const endpoints = [
        { name: 'Team Data', endpoint: '/team', params: { team_id: 1 } },
        { name: 'Team Form', endpoint: '/lastx', params: { team_id: 1 } },
        { name: 'League Matches', endpoint: '/league-matches', params: { season_id: 1625, max_per_page: 10 } },
        { name: 'Match Details', endpoint: '/match', params: { match_id: 1000000 } },
        { name: 'Referee Data', endpoint: '/referee', params: { referee_id: 3 } },
        { name: 'Today Matches', endpoint: '/todays-matches', params: {} }
    ];

    let cardsFound = [];

    for (const ep of endpoints) {
        console.log(`\n🔄 Checking ${ep.name} for cards data...`);
        const result = await makeRequest(ep.endpoint, ep.params);
        
        if (result.success) {
            const cards = findDataFields(result.data, ['card', 'yellow', 'red', 'booking']);
            if (cards.length > 0) {
                console.log(`✅ Found ${cards.length} card-related fields`);
                cardsFound.push({
                    endpoint: ep.name,
                    fields: cards.slice(0, 5)
                });
                
                cards.slice(0, 3).forEach(card => {
                    console.log(`   - ${card.path}: ${card.value} (${card.type})`);
                });
            } else {
                console.log(`❌ No card data found`);
            }
        }
    }

    console.log(`\n📊 CARDS DATA SUMMARY:`);
    console.log(`Found cards data in ${cardsFound.length} endpoints:`);
    cardsFound.forEach(found => {
        console.log(`   - ${found.endpoint}: ${found.fields.length} fields`);
    });

    return cardsFound;
}

async function investigateUpcomingMatches() {
    console.log('\n🔍 INVESTIGATING UPCOMING MATCHES');
    console.log('=================================');

    // Test today's matches and check status values
    const todayResult = await makeRequest('/todays-matches', {});
    
    if (todayResult.success && Array.isArray(todayResult.data)) {
        console.log(`📊 Total matches today: ${todayResult.data.length}`);
        
        // Analyze status values
        const statusCounts = {};
        todayResult.data.forEach(match => {
            const status = match.status || 'unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        console.log('\n📋 Match status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   - ${status}: ${count} matches`);
        });

        // Find upcoming matches
        const upcomingStatuses = ['scheduled', 'not-started', 'upcoming', '', 'timed', 'fixture'];
        let upcomingMatches = [];
        
        upcomingStatuses.forEach(status => {
            const matches = todayResult.data.filter(match => match.status === status);
            if (matches.length > 0) {
                upcomingMatches.push(...matches);
                console.log(`✅ Found ${matches.length} matches with status "${status}"`);
            }
        });

        console.log(`\n🎯 Total upcoming matches identified: ${upcomingMatches.length}`);
        
        if (upcomingMatches.length > 0) {
            console.log('Sample upcoming match:', {
                id: upcomingMatches[0].id,
                home: upcomingMatches[0].home_name,
                away: upcomingMatches[0].away_name,
                status: upcomingMatches[0].status,
                date: upcomingMatches[0].date_unix || upcomingMatches[0].match_start
            });
        }

        return upcomingMatches;
    }

    return [];
}

async function investigatePredictionData() {
    console.log('\n🔍 INVESTIGATING PREDICTION DATA');
    console.log('================================');

    // Check if prediction data exists in any endpoints
    const endpoints = [
        { name: 'BTTS Stats', endpoint: '/stats-data-btts', params: {} },
        { name: 'Over 2.5 Stats', endpoint: '/stats-data-over25', params: {} },
        { name: 'Team Data', endpoint: '/team', params: { team_id: 1 } },
        { name: 'Match Details', endpoint: '/match', params: { match_id: 1000000 } }
    ];

    let predictionFields = [];

    for (const ep of endpoints) {
        console.log(`\n🔄 Checking ${ep.name} for prediction data...`);
        const result = await makeRequest(ep.endpoint, ep.params);
        
        if (result.success) {
            const predictions = findDataFields(result.data, [
                'prediction', 'probability', 'confidence', 'odds', 'expected',
                'likely', 'forecast', 'percentage', 'average', 'risk'
            ]);
            
            if (predictions.length > 0) {
                console.log(`✅ Found ${predictions.length} prediction-related fields`);
                predictionFields.push({
                    endpoint: ep.name,
                    fields: predictions.slice(0, 10)
                });
                
                predictions.slice(0, 5).forEach(pred => {
                    console.log(`   - ${pred.path}: ${pred.value} (${pred.type})`);
                });
            } else {
                console.log(`❌ No prediction data found`);
            }
        }
    }

    console.log(`\n📊 PREDICTION DATA SUMMARY:`);
    if (predictionFields.length > 0) {
        predictionFields.forEach(found => {
            console.log(`   ✅ ${found.endpoint}: ${found.fields.length} prediction fields`);
        });
    } else {
        console.log('   ⚠️ No direct prediction endpoints found');
        console.log('   💡 Predictions will need to be calculated from statistical data');
    }

    return predictionFields;
}

async function generateDataAvailabilityReport() {
    console.log('\n📋 GENERATING DATA AVAILABILITY REPORT');
    console.log('======================================');

    const investigations = {
        h2h: await investigateH2HEndpoint(),
        corners: await investigateCornersData(),
        cards: await investigateCardsData(),
        upcoming: await investigateUpcomingMatches(),
        predictions: await investigatePredictionData()
    };

    console.log('\n🎯 FINAL DATA AVAILABILITY REPORT');
    console.log('=================================');

    // H2H Data
    if (investigations.h2h) {
        console.log('✅ H2H Data: Available via alternative endpoint');
    } else {
        console.log('❌ H2H Data: Not available via direct endpoint');
        console.log('   💡 Use team match history to build H2H manually');
    }

    // Corners Data
    if (investigations.corners.length > 0) {
        console.log(`✅ Corners Data: Available in ${investigations.corners.length} endpoints`);
        console.log(`   📍 Best sources: ${investigations.corners.map(c => c.endpoint).join(', ')}`);
    } else {
        console.log('❌ Corners Data: Not found in tested endpoints');
    }

    // Cards Data
    if (investigations.cards.length > 0) {
        console.log(`✅ Cards Data: Available in ${investigations.cards.length} endpoints`);
        console.log(`   📍 Best sources: ${investigations.cards.map(c => c.endpoint).join(', ')}`);
    } else {
        console.log('❌ Cards Data: Not found in tested endpoints');
    }

    // Upcoming Matches
    if (investigations.upcoming.length > 0) {
        console.log(`✅ Upcoming Matches: ${investigations.upcoming.length} matches identified`);
        console.log('   📍 Filter today\'s matches by status field');
    } else {
        console.log('❌ Upcoming Matches: No clear upcoming status found');
    }

    // Predictions
    if (investigations.predictions.length > 0) {
        console.log(`✅ Prediction Data: Available in ${investigations.predictions.length} endpoints`);
    } else {
        console.log('❌ Prediction Data: No direct prediction endpoints');
        console.log('   💡 Build predictions from statistical data (BTTS, Over/Under, etc.)');
    }

    console.log('\n💡 RECOMMENDATIONS FOR FRONTEND DEVELOPMENT:');
    console.log('==========================================');
    console.log('1. Use team endpoints for comprehensive match data including H2H');
    console.log('2. Check match objects in league-matches and team endpoints for corners/cards');
    console.log('3. Filter todays-matches by status for live vs upcoming');
    console.log('4. Build prediction engine from BTTS and Over/Under statistical data');
    console.log('5. Use referee endpoints for additional match context');

    return investigations;
}

// Run the investigation
if (require.main === module) {
    generateDataAvailabilityReport().catch(console.error);
}

module.exports = { generateDataAvailabilityReport };
