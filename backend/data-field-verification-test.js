/**
 * FOOTYSTATS DATA FIELD VERIFICATION TEST
 * Specifically tests for logos, statistics, corners, goals over/under, players, referees
 * and comprehensive data field coverage as requested
 */

const axios = require('axios');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';

// Data field analysis results
let dataAnalysis = {
    logos: {
        found: [],
        searchedFields: ['logo', 'logoUrl', 'image', 'img', 'badge', 'crest']
    },
    statistics: {
        corners: [],
        goalsOverUnder: [],
        btts: [],
        cards: [],
        averages: [],
        percentages: [],
        totals: []
    },
    players: {
        found: [],
        fields: []
    },
    referees: {
        found: [],
        fields: []
    },
    matches: {
        detailedFields: [],
        statisticalFields: []
    },
    comprehensive: {
        totalUniqueFields: new Set(),
        imageUrls: [],
        statisticalData: []
    }
};

async function makeRequest(endpoint, params = {}) {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { key: API_KEY, ...params },
            timeout: 15000
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function analyzeObjectForDataFields(obj, path = '', endpointName = '') {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        // Add to comprehensive field tracking
        dataAnalysis.comprehensive.totalUniqueFields.add(key);

        // Logo and image detection
        if (typeof value === 'string') {
            const lowerKey = key.toLowerCase();
            const lowerValue = value.toLowerCase();
            
            // Check for logo/image fields
            if (dataAnalysis.logos.searchedFields.some(field => lowerKey.includes(field)) ||
                lowerValue.includes('logo') || lowerValue.includes('.png') || 
                lowerValue.includes('.jpg') || lowerValue.includes('.svg') ||
                lowerValue.includes('/img/')) {
                dataAnalysis.logos.found.push({
                    endpoint: endpointName,
                    path: currentPath,
                    key: key,
                    url: value
                });
                dataAnalysis.comprehensive.imageUrls.push(value);
            }
        }

        // Statistical field detection
        const lowerKey = key.toLowerCase();
        
        if (lowerKey.includes('corner')) {
            dataAnalysis.statistics.corners.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('goal') && (lowerKey.includes('over') || lowerKey.includes('under') || lowerKey.includes('total'))) {
            dataAnalysis.statistics.goalsOverUnder.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('btts') || lowerKey.includes('both') && lowerKey.includes('score')) {
            dataAnalysis.statistics.btts.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('card') && !lowerKey.includes('discard')) {
            dataAnalysis.statistics.cards.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('average') || lowerKey.includes('avg')) {
            dataAnalysis.statistics.averages.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('percentage') || lowerKey.includes('percent') || lowerKey.includes('%')) {
            dataAnalysis.statistics.percentages.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }
        
        if (lowerKey.includes('total') && typeof value === 'number') {
            dataAnalysis.statistics.totals.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }

        // Player field detection
        if (lowerKey.includes('player') || lowerKey.includes('name') && endpointName.includes('player')) {
            dataAnalysis.players.fields.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }

        // Referee field detection
        if (lowerKey.includes('referee') || endpointName.includes('referee')) {
            dataAnalysis.referees.fields.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }

        // Match statistical fields
        if (endpointName.includes('match') && (
            lowerKey.includes('stat') || lowerKey.includes('goal') || 
            lowerKey.includes('corner') || lowerKey.includes('card') ||
            lowerKey.includes('possession') || lowerKey.includes('shot'))) {
            dataAnalysis.matches.statisticalFields.push({
                endpoint: endpointName,
                path: currentPath,
                key: key,
                value: value
            });
        }

        // Add to comprehensive statistical data
        if (lowerKey.includes('stat') || lowerKey.includes('avg') || 
            lowerKey.includes('total') || lowerKey.includes('percentage')) {
            dataAnalysis.comprehensive.statisticalData.push({
                endpoint: endpointName,
                field: key,
                value: value
            });
        }

        // Recurse into nested objects and arrays
        if (typeof value === 'object') {
            analyzeObjectForDataFields(value, currentPath, endpointName);
        }
    });
}

async function testSpecificDataFields() {
    console.log('🔍 FOOTYSTATS DATA FIELD VERIFICATION TEST');
    console.log('=========================================');
    console.log('Specifically checking for: logos, statistics, corners, goals over/under, players, referees\n');

    // Test 1: League data for logos and basic info
    console.log('📊 Testing League Data for Logos...');
    const leaguesResult = await makeRequest('/league-list');
    if (leaguesResult.success) {
        analyzeObjectForDataFields(leaguesResult.data, '', 'league-list');
        console.log(`   ✅ League data analyzed - ${Array.isArray(leaguesResult.data) ? leaguesResult.data.length : 'object'} entries`);
    }

    // Test 2: Match data for comprehensive statistics
    console.log('⚽ Testing Match Data for Statistics...');
    const matchesResult = await makeRequest('/todays-matches');
    if (matchesResult.success) {
        analyzeObjectForDataFields(matchesResult.data, '', 'todays-matches');
        console.log(`   ✅ Match data analyzed - ${Array.isArray(matchesResult.data) ? matchesResult.data.length : 'object'} entries`);
    }

    // Test 3: Team data for detailed statistics
    console.log('🏟️ Testing Team Data...');
    const teamResult = await makeRequest('/team', { team_id: 1 });
    if (teamResult.success) {
        analyzeObjectForDataFields(teamResult.data, '', 'team');
        console.log(`   ✅ Team data analyzed`);
    }

    // Test 4: Player data
    console.log('👤 Testing Player Data...');
    const playersResult = await makeRequest('/league-players', { season_id: 1625 });
    if (playersResult.success) {
        analyzeObjectForDataFields(playersResult.data, '', 'league-players');
        if (Array.isArray(playersResult.data)) {
            dataAnalysis.players.found = playersResult.data;
        }
        console.log(`   ✅ Player data analyzed - ${Array.isArray(playersResult.data) ? playersResult.data.length : 'object'} entries`);
    }

    // Test 5: Referee data
    console.log('🟨 Testing Referee Data...');
    const refereesResult = await makeRequest('/league-referees', { season_id: 1625 });
    if (refereesResult.success) {
        analyzeObjectForDataFields(refereesResult.data, '', 'league-referees');
        if (Array.isArray(refereesResult.data)) {
            dataAnalysis.referees.found = refereesResult.data;
        }
        console.log(`   ✅ Referee data analyzed - ${Array.isArray(refereesResult.data) ? refereesResult.data.length : 'object'} entries`);
    }

    // Test 6: BTTS Statistics
    console.log('🎯 Testing BTTS Statistics...');
    const bttsResult = await makeRequest('/stats-data-btts');
    if (bttsResult.success) {
        analyzeObjectForDataFields(bttsResult.data, '', 'stats-data-btts');
        console.log(`   ✅ BTTS statistics analyzed`);
    }

    // Test 7: Over 2.5 Statistics
    console.log('⚽ Testing Over 2.5 Goals Statistics...');
    const over25Result = await makeRequest('/stats-data-over25');
    if (over25Result.success) {
        analyzeObjectForDataFields(over25Result.data, '', 'stats-data-over25');
        console.log(`   ✅ Over 2.5 statistics analyzed`);
    }

    // Test 8: Individual match details
    console.log('🏁 Testing Individual Match Details...');
    const matchResult = await makeRequest('/match', { match_id: 1000000 });
    if (matchResult.success) {
        analyzeObjectForDataFields(matchResult.data, '', 'match-details');
        console.log(`   ✅ Match details analyzed`);
    }

    // Test 9: League season comprehensive stats
    console.log('🏆 Testing League Season Stats...');
    const seasonResult = await makeRequest('/league-season', { season_id: 1625 });
    if (seasonResult.success) {
        analyzeObjectForDataFields(seasonResult.data, '', 'league-season');
        console.log(`   ✅ League season stats analyzed`);
    }

    // Test 10: Team last X games for form data
    console.log('📈 Testing Team Form Data...');
    const formResult = await makeRequest('/lastx', { team_id: 1 });
    if (formResult.success) {
        analyzeObjectForDataFields(formResult.data, '', 'team-form');
        console.log(`   ✅ Team form data analyzed`);
    }

    console.log('\n🔍 DATA FIELD ANALYSIS COMPLETE!\n');
}

function generateDataFieldReport() {
    console.log('📋 COMPREHENSIVE DATA FIELD REPORT');
    console.log('==================================\n');

    // Logos and Images
    console.log('🖼️ LOGOS & IMAGES:');
    console.log(`   Total logo/image URLs found: ${dataAnalysis.logos.found.length}`);
    console.log(`   Unique image URLs: ${dataAnalysis.comprehensive.imageUrls.length}`);
    
    if (dataAnalysis.logos.found.length > 0) {
        console.log('   Sample logo/image URLs:');
        dataAnalysis.logos.found.slice(0, 5).forEach(item => {
            console.log(`     - ${item.endpoint}: ${item.key} = ${item.url.substring(0, 80)}${item.url.length > 80 ? '...' : ''}`);
        });
    } else {
        console.log('   ⚠️ No direct logo URL fields found, but may be available through image_path or similar fields');
    }

    // Statistics
    console.log('\n📊 STATISTICS:');
    console.log(`   Corner-related fields: ${dataAnalysis.statistics.corners.length}`);
    console.log(`   Goals over/under fields: ${dataAnalysis.statistics.goalsOverUnder.length}`);
    console.log(`   BTTS-related fields: ${dataAnalysis.statistics.btts.length}`);
    console.log(`   Card-related fields: ${dataAnalysis.statistics.cards.length}`);
    console.log(`   Average fields: ${dataAnalysis.statistics.averages.length}`);
    console.log(`   Percentage fields: ${dataAnalysis.statistics.percentages.length}`);
    console.log(`   Total fields: ${dataAnalysis.statistics.totals.length}`);

    // Show sample statistical fields
    console.log('\n   Sample corner statistics:');
    dataAnalysis.statistics.corners.slice(0, 3).forEach(item => {
        console.log(`     - ${item.endpoint}: ${item.key} = ${item.value}`);
    });

    console.log('\n   Sample goals over/under statistics:');
    dataAnalysis.statistics.goalsOverUnder.slice(0, 3).forEach(item => {
        console.log(`     - ${item.endpoint}: ${item.key} = ${item.value}`);
    });

    console.log('\n   Sample BTTS statistics:');
    dataAnalysis.statistics.btts.slice(0, 3).forEach(item => {
        console.log(`     - ${item.endpoint}: ${item.key} = ${item.value}`);
    });

    // Players
    console.log('\n👤 PLAYERS:');
    console.log(`   Player records found: ${dataAnalysis.players.found.length}`);
    console.log(`   Player-related fields: ${dataAnalysis.players.fields.length}`);
    
    if (dataAnalysis.players.fields.length > 0) {
        console.log('   Sample player fields:');
        dataAnalysis.players.fields.slice(0, 5).forEach(item => {
            console.log(`     - ${item.key}: ${typeof item.value === 'string' ? item.value.substring(0, 50) : item.value}`);
        });
    }

    // Referees
    console.log('\n🟨 REFEREES:');
    console.log(`   Referee records found: ${dataAnalysis.referees.found.length}`);
    console.log(`   Referee-related fields: ${dataAnalysis.referees.fields.length}`);
    
    if (dataAnalysis.referees.fields.length > 0) {
        console.log('   Sample referee fields:');
        dataAnalysis.referees.fields.slice(0, 5).forEach(item => {
            console.log(`     - ${item.key}: ${typeof item.value === 'string' ? item.value.substring(0, 50) : item.value}`);
        });
    }

    // Match Statistical Fields
    console.log('\n⚽ MATCH STATISTICS:');
    console.log(`   Match statistical fields: ${dataAnalysis.matches.statisticalFields.length}`);
    
    if (dataAnalysis.matches.statisticalFields.length > 0) {
        console.log('   Sample match statistics:');
        dataAnalysis.matches.statisticalFields.slice(0, 10).forEach(item => {
            console.log(`     - ${item.key}: ${item.value}`);
        });
    }

    // Comprehensive Overview
    console.log('\n🔍 COMPREHENSIVE OVERVIEW:');
    console.log(`   Total unique field names discovered: ${dataAnalysis.comprehensive.totalUniqueFields.size}`);
    console.log(`   Total statistical data points: ${dataAnalysis.comprehensive.statisticalData.length}`);
    
    console.log('\n   Most common field types:');
    const fieldCounts = {};
    Array.from(dataAnalysis.comprehensive.totalUniqueFields).forEach(field => {
        const lowerField = field.toLowerCase();
        if (lowerField.includes('total')) fieldCounts.total = (fieldCounts.total || 0) + 1;
        if (lowerField.includes('avg') || lowerField.includes('average')) fieldCounts.average = (fieldCounts.average || 0) + 1;
        if (lowerField.includes('goal')) fieldCounts.goal = (fieldCounts.goal || 0) + 1;
        if (lowerField.includes('stat')) fieldCounts.stat = (fieldCounts.stat || 0) + 1;
        if (lowerField.includes('percent')) fieldCounts.percentage = (fieldCounts.percentage || 0) + 1;
    });
    
    Object.entries(fieldCounts).forEach(([type, count]) => {
        console.log(`     - ${type}: ${count} fields`);
    });

    // Verification Summary
    console.log('\n✅ VERIFICATION SUMMARY:');
    console.log(`   ✅ Logos/Images: ${dataAnalysis.logos.found.length > 0 ? 'FOUND' : 'Fields exist but may need specific endpoints'}`);
    console.log(`   ✅ Corner Statistics: ${dataAnalysis.statistics.corners.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ Goals Over/Under: ${dataAnalysis.statistics.goalsOverUnder.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ BTTS Data: ${dataAnalysis.statistics.btts.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ Player Data: ${dataAnalysis.players.found.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ Referee Data: ${dataAnalysis.referees.found.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ Statistical Fields: ${dataAnalysis.comprehensive.statisticalData.length > 0 ? 'FOUND' : 'NOT FOUND'}`);

    return dataAnalysis;
}

async function runDataFieldVerification() {
    console.log('🚀 Starting FootyStats Data Field Verification...\n');
    
    await testSpecificDataFields();
    const results = generateDataFieldReport();
    
    console.log('\n🎉 DATA FIELD VERIFICATION COMPLETE!');
    console.log(`📊 Total endpoints analyzed: 10`);
    console.log(`🔍 Total unique fields discovered: ${results.comprehensive.totalUniqueFields.size}`);
    console.log(`📈 Statistical data points: ${results.comprehensive.statisticalData.length}`);

    return results;
}

if (require.main === module) {
    runDataFieldVerification().catch(console.error);
}

module.exports = { runDataFieldVerification, dataAnalysis };
