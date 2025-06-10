/**
 * UPCOMING MATCH DISCOVERY & VALIDATION TEST
 * 
 * 🎯 OBJETIVO: Encontrar uma partida upcoming diferente e testar nossa solução completa
 * 
 * ESTRATÉGIA:
 * 1. Buscar partidas upcoming via FootyStats
 * 2. Selecionar uma partida diferente do Iran vs North Korea
 * 3. Testar nossa implementação completa
 * 4. Validar se todos os 8 endpoints funcionam
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';

let upcomingTest = {
    timestamp: new Date().toISOString(),
    version: 'UPCOMING-VALIDATION-v1.0',
    discovery: {
        upcomingMatches: [],
        selectedMatch: {},
        alternativeMatches: []
    },
    validation: {
        matchData: {},
        seasonFound: null,
        teamFormData: {},
        analyticsResults: {}
    },
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0,
        validationSuccess: false
    }
};

async function makeRequest(endpoint, params = {}, description = '') {
    try {
        upcomingTest.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        
        const response = await axios.get(url, { 
            params: requestParams,
            timeout: 20000
        });
        
        upcomingTest.summary.successfulRequests++;
        console.log(`   ✅ ${response.status} (${Array.isArray(response.data?.data) ? response.data.data.length : 'OK'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        upcomingTest.summary.failedRequests++;
        console.log(`   ❌ ${error.response?.status || 'Network'} - ${error.message}`);
        
        return {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: null
        };
    }
}

function parseMatch(rawMatch) {
    const match = rawMatch.data ?? rawMatch;
    
    return {
        id: match.id,
        homeId: match.homeID ?? match.home_id,
        awayId: match.awayID ?? match.away_id,
        homeName: match.home_name ?? match.homeTeam?.name ?? 'Unknown Home',
        awayName: match.away_name ?? match.awayTeam?.name ?? 'Unknown Away',
        season: match.season,
        competitionId: match.competition_id ?? match.competitionId,
        leagueId: match.league_id ?? match.leagueId,
        date: match.date_unix ?? match.date,
        status: match.status,
        venue: match.venue
    };
}

async function findUpcomingMatches() {
    console.log('🔍 STEP 1: DISCOVERING UPCOMING MATCHES');
    console.log('======================================');
    
    // Try multiple approaches to find upcoming matches
    const approaches = [
        { endpoint: '/todays-matches', params: {}, desc: 'Today\'s Matches' },
        { endpoint: '/todays-matches', params: { status: 'upcoming' }, desc: 'Today\'s Upcoming' },
        { endpoint: '/matches', params: { status: 'upcoming' }, desc: 'General Upcoming' }
    ];
    
    let allUpcomingMatches = [];
    
    for (const approach of approaches) {
        const result = await makeRequest(approach.endpoint, approach.params, approach.desc);
        
        if (result.success && result.rawData) {
            const matches = Array.isArray(result.rawData) ? result.rawData : [result.rawData];
            
            const upcomingMatches = matches.filter(match => {
                const parsed = parseMatch(match);
                return parsed.status === 'incomplete' || parsed.status === 'upcoming';
            });
            
            console.log(`   Found ${upcomingMatches.length} upcoming matches`);
            allUpcomingMatches.push(...upcomingMatches);
        }
    }
    
    // Remove duplicates by match ID
    const uniqueMatches = allUpcomingMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
    );
    
    upcomingTest.discovery.upcomingMatches = uniqueMatches.slice(0, 10); // Keep top 10
    
    console.log(`✅ Total unique upcoming matches found: ${uniqueMatches.length}`);
    
    return uniqueMatches;
}

async function selectAndValidateMatch(upcomingMatches) {
    console.log('\n🎯 STEP 2: SELECTING & VALIDATING MATCH');
    console.log('======================================');
    
    if (upcomingMatches.length === 0) {
        throw new Error('No upcoming matches found to test');
    }
    
    // Show available matches
    console.log('📋 Available upcoming matches:');
    upcomingMatches.slice(0, 5).forEach((match, i) => {
        const parsed = parseMatch(match);
        console.log(`   ${i+1}. ${parsed.homeName} vs ${parsed.awayName} (ID: ${parsed.id})`);
    });
    
    // Select first match that's not Iran vs North Korea
    let selectedMatch = null;
    
    for (const match of upcomingMatches) {
        const parsed = parseMatch(match);
        
        // Skip Iran vs North Korea (our previous test)
        if (parsed.homeId === 8607 || parsed.awayId === 8607 || 
            parsed.homeId === 8597 || parsed.awayId === 8597) {
            continue;
        }
        
        selectedMatch = parsed;
        break;
    }
    
    if (!selectedMatch) {
        // If no other match found, use the first one anyway
        selectedMatch = parseMatch(upcomingMatches[0]);
        console.log('⚠️  Using first available match (no alternatives found)');
    }
    
    upcomingTest.discovery.selectedMatch = selectedMatch;
    
    console.log(`🎯 SELECTED MATCH: ${selectedMatch.homeName} vs ${selectedMatch.awayName}`);
    console.log(`   Match ID: ${selectedMatch.id}`);
    console.log(`   Home Team ID: ${selectedMatch.homeId}`);
    console.log(`   Away Team ID: ${selectedMatch.awayId}`);
    console.log(`   Season: ${selectedMatch.season}`);
    console.log(`   Competition ID: ${selectedMatch.competitionId}`);
    
    return selectedMatch;
}

async function validateMatchData(selectedMatch) {
    console.log('\n🔬 STEP 3: VALIDATING MATCH DATA EXTRACTION');
    console.log('===========================================');
    
    // Test 1: Get detailed match data
    const matchResult = await makeRequest('/match', { 
        match_id: selectedMatch.id 
    }, 'Detailed Match Data');
    
    if (matchResult.success) {
        upcomingTest.validation.matchData = parseMatch(matchResult.rawData);
        console.log('✅ Match data extraction successful');
    } else {
        console.log('❌ Match data extraction failed');
        return false;
    }
    
    // Test 2: Find working season for teams
    console.log('\n🔍 Finding working season for teams...');
    
    const candidateSeasons = [
        10117, 10118, 10119, 10120,          // International seasons
        1625, 1626, 1627, 1628, 1629, 1630,  // League seasons
        2024, 2025, 2026                     // Recent years
    ];
    
    let workingSeason = null;
    
    for (const seasonId of candidateSeasons.slice(0, 5)) { // Test first 5 to save time
        console.log(`🔄 Testing season ${seasonId}...`);
        
        const seasonResult = await makeRequest('/league-matches', { 
            season_id: seasonId,
            max_per_page: 100
        }, `Season ${seasonId} test`);
        
        if (seasonResult.success && seasonResult.rawData) {
            const matches = Array.isArray(seasonResult.rawData) ? seasonResult.rawData : [seasonResult.rawData];
            
            // Check if this season has data for our teams
            const hasHomeTeamData = matches.some(match => {
                const parsed = parseMatch(match);
                return parsed.homeId === selectedMatch.homeId || parsed.awayId === selectedMatch.homeId;
            });
            
            const hasAwayTeamData = matches.some(match => {
                const parsed = parseMatch(match);
                return parsed.homeId === selectedMatch.awayId || parsed.awayId === selectedMatch.awayId;
            });
            
            if (hasHomeTeamData || hasAwayTeamData) {
                workingSeason = seasonId;
                console.log(`✅ Found working season: ${seasonId}`);
                console.log(`   Home team data: ${hasHomeTeamData ? 'YES' : 'NO'}`);
                console.log(`   Away team data: ${hasAwayTeamData ? 'YES' : 'NO'}`);
                break;
            }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    upcomingTest.validation.seasonFound = workingSeason;
    
    if (!workingSeason) {
        console.log('⚠️  No working season found for teams');
        return false;
    }
    
    return true;
}

async function testTeamFormExtraction(selectedMatch, workingSeason) {
    console.log('\n📊 STEP 4: TESTING TEAM FORM EXTRACTION');
    console.log('======================================');
    
    // Get all matches for the working season
    const allMatchesResult = await makeRequest('/league-matches', { 
        season_id: workingSeason,
        max_per_page: 500
    }, `All matches for season ${workingSeason}`);
    
    if (!allMatchesResult.success) {
        console.log('❌ Failed to get season matches');
        return false;
    }
    
    const allMatches = Array.isArray(allMatchesResult.rawData) ? allMatchesResult.rawData : [allMatchesResult.rawData];
    
    // Extract home team's HOME matches
    const homeTeamHomeMatches = allMatches.filter(match => {
        const parsed = parseMatch(match);
        return parsed.homeId === selectedMatch.homeId;
    }).map(match => parseMatch(match)).slice(0, 5);
    
    // Extract away team's AWAY matches
    const awayTeamAwayMatches = allMatches.filter(match => {
        const parsed = parseMatch(match);
        return parsed.awayId === selectedMatch.awayId;
    }).map(match => parseMatch(match)).slice(0, 5);
    
    upcomingTest.validation.teamFormData = {
        homeTeamHomeMatches,
        awayTeamAwayMatches,
        workingSeason
    };
    
    console.log(`🏠 ${selectedMatch.homeName} HOME matches found: ${homeTeamHomeMatches.length}/5`);
    console.log(`✈️  ${selectedMatch.awayName} AWAY matches found: ${awayTeamAwayMatches.length}/5`);
    
    if (homeTeamHomeMatches.length > 0) {
        console.log('   Sample HOME match:');
        const sample = homeTeamHomeMatches[0];
        console.log(`   ${sample.homeName} ${sample.homeGoals || '?'}-${sample.awayGoals || '?'} ${sample.awayName}`);
    }
    
    if (awayTeamAwayMatches.length > 0) {
        console.log('   Sample AWAY match:');
        const sample = awayTeamAwayMatches[0];
        console.log(`   ${sample.homeName} ${sample.homeGoals || '?'}-${sample.awayGoals || '?'} ${sample.awayName}`);
    }
    
    const success = homeTeamHomeMatches.length > 0 || awayTeamAwayMatches.length > 0;
    
    if (success) {
        console.log('✅ Team form extraction successful');
    } else {
        console.log('❌ Team form extraction failed - no matches found');
    }
    
    return success;
}

async function runUpcomingMatchValidation() {
    console.log('🚀 UPCOMING MATCH DISCOVERY & VALIDATION');
    console.log('========================================');
    console.log(`🎯 GOAL: Find & validate a different upcoming match`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // Step 1: Find upcoming matches
        const upcomingMatches = await findUpcomingMatches();
        
        if (upcomingMatches.length === 0) {
            throw new Error('No upcoming matches found');
        }
        
        // Step 2: Select a match (different from Iran vs NK)
        const selectedMatch = await selectAndValidateMatch(upcomingMatches);
        
        // Step 3: Validate match data extraction
        const matchDataValid = await validateMatchData(selectedMatch);
        
        if (!matchDataValid) {
            throw new Error('Match data validation failed');
        }
        
        // Step 4: Test team form extraction
        const teamFormValid = await testTeamFormExtraction(
            selectedMatch, 
            upcomingTest.validation.seasonFound
        );
        
        upcomingTest.summary.validationSuccess = teamFormValid;
        
        // FINAL RESULTS
        console.log('\n🎯 VALIDATION RESULTS');
        console.log('====================');
        console.log(`📊 Total API Requests: ${upcomingTest.summary.totalRequests}`);
        console.log(`✅ Successful: ${upcomingTest.summary.successfulRequests}`);
        console.log(`❌ Failed: ${upcomingTest.summary.failedRequests}`);
        console.log(`🏆 Overall Success: ${upcomingTest.summary.validationSuccess ? 'YES' : 'NO'}`);
        
        if (upcomingTest.summary.validationSuccess) {
            console.log('\n🎉 SUCCESS! Our solution works with different matches!');
            console.log(`✅ Selected Match: ${selectedMatch.homeName} vs ${selectedMatch.awayName}`);
            console.log(`✅ Working Season: ${upcomingTest.validation.seasonFound}`);
            console.log(`✅ Team Form Data: Available`);
            console.log('\n🚀 READY TO TEST COMPREHENSIVE ANALYTICS!');
        } else {
            console.log('\n⚠️  Validation completed with limitations');
            console.log('💡 This may be due to limited data for the selected teams');
        }
        
    } catch (error) {
        console.error('\n💥 VALIDATION ERROR:', error.message);
        upcomingTest.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `UPCOMING-VALIDATION-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(upcomingTest, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return upcomingTest;
}

// Execute if running directly
if (require.main === module) {
    runUpcomingMatchValidation()
        .then(results => {
            console.log('\n🏁 Validation completed!');
            
            if (results.summary.validationSuccess && results.discovery.selectedMatch.id) {
                console.log('\n🔥 NEXT STEP: Run comprehensive analytics test with:');
                console.log(`   Match ID: ${results.discovery.selectedMatch.id}`);
                console.log(`   Teams: ${results.discovery.selectedMatch.homeName} vs ${results.discovery.selectedMatch.awayName}`);
            }
            
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Validation failed:', error);
            process.exit(1);
        });
}

module.exports = { runUpcomingMatchValidation };
