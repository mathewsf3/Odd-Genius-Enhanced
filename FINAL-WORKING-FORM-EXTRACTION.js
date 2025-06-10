/**
 * FINAL WORKING FORM DATA EXTRACTOR
 * 
 * 🎯 ESTRATÉGIA CORRIGIDA: 
 * 1. Pegar match data do Iran vs North Korea
 * 2. Encontrar uma season válida que tenha dados
 * 3. Extrair Iran's last 5 HOME games + NK's last 5 AWAY games
 * 4. Usar endpoints que realmente funcionam
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;

let workingData = {
    timestamp: new Date().toISOString(),
    version: 'FINAL-WORKING-v1.0',
    targetMatch: {},
    workingSeasonId: null,
    formData: {
        iranLast5Home: [],
        nkLast5Away: []
    },
    debug: {},
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0
    }
};

async function makeRequest(endpoint, params = {}, description = '') {
    try {
        workingData.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        console.log(`   URL: ${url}`);
        console.log(`   Params:`, JSON.stringify(requestParams, null, 2));
        
        const response = await axios.get(url, { 
            params: requestParams,
            timeout: 20000
        });
        
        workingData.summary.successfulRequests++;
        console.log(`✅ SUCCESS: ${response.status} (${Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        workingData.summary.failedRequests++;
        console.log(`❌ FAILED: ${error.response?.status || 'Network'} - ${error.message}`);
        
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
        venue: match.venue,
        status: match.status
    };
}

function filterMatchesByTeamAndVenue(matches, teamId, venueType) {
    if (!matches || !Array.isArray(matches)) {
        return [];
    }
    
    console.log(`🔍 Filtering ${matches.length} matches for team ${teamId} (${venueType})`);
    
    let filtered = [];
    
    for (const match of matches) {
        const normalized = parseMatch(match);
        
        if (venueType === 'HOME' && normalized.homeId === teamId) {
            filtered.push(normalized);
        } else if (venueType === 'AWAY' && normalized.awayId === teamId) {
            filtered.push(normalized);
        }
    }
    
    console.log(`✅ Found ${filtered.length} ${venueType} matches for team ${teamId}`);
    return filtered.slice(0, 5);
}

async function runFinalWorkingTest() {
    console.log('🚀 FINAL WORKING FORM DATA EXTRACTOR');
    console.log('=====================================');
    console.log(`🎯 TARGET: Extract form data for Iran vs North Korea`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // STEP 1: Get target match
        console.log('\n📊 STEP 1: GETTING TARGET MATCH');
        console.log('================================');
        
        const matchResult = await makeRequest('/match', { match_id: TARGET_MATCH_ID }, 'Target Match Details');
        
        if (!matchResult.success) {
            throw new Error('Failed to get target match');
        }
        
        const matchData = parseMatch(matchResult.rawData);
        workingData.targetMatch = matchData;
        
        console.log(`✅ Match: ${matchData.homeName} (${matchData.homeId}) vs ${matchData.awayName} (${matchData.awayId})`);
        console.log(`   Season: ${matchData.season}`);
        console.log(`   Competition ID: ${matchData.competitionId}`);
        console.log(`   League ID: ${matchData.leagueId}`);
        
        // STEP 2: Find a working season_id
        console.log('\n🔍 STEP 2: FINDING WORKING SEASON');
        console.log('==================================');
        
        // Try to find leagues and get a valid season_id
        const leaguesResult = await makeRequest('/league-list', {}, 'Available Leagues');
        
        let workingSeasonId = null;
        
        if (leaguesResult.success && leaguesResult.rawData) {
            const leagues = Array.isArray(leaguesResult.rawData) ? leaguesResult.rawData : [leaguesResult.rawData];
            
            // Look for a league with season_id
            for (const league of leagues.slice(0, 10)) { // Check first 10 leagues
                if (league.season_id) {
                    workingSeasonId = league.season_id;
                    console.log(`✅ Found working season_id: ${workingSeasonId} (League: ${league.name})`);
                    break;
                }
            }
        }
        
        // If no season_id found, try common values
        if (!workingSeasonId) {
            console.log('⚠️  No season_id found in leagues, trying common values...');
            
            const commonSeasons = [1625, 2023, 2024, 2025, 2026]; // Common season IDs
            
            for (const seasonId of commonSeasons) {
                console.log(`🔄 Testing season_id: ${seasonId}`);
                const testResult = await makeRequest('/league-matches', { season_id: seasonId, max_per_page: 5 }, `Test Season ${seasonId}`);
                
                if (testResult.success && testResult.rawData && Array.isArray(testResult.rawData) && testResult.rawData.length > 0) {
                    workingSeasonId = seasonId;
                    console.log(`✅ Found working season_id: ${workingSeasonId}`);
                    break;
                }
            }
        }
        
        if (!workingSeasonId) {
            throw new Error('Could not find any working season_id');
        }
        
        workingData.workingSeasonId = workingSeasonId;
        
        // STEP 3: Get matches with working season_id
        console.log(`\n📋 STEP 3: GETTING MATCHES (Season ${workingSeasonId})`);
        console.log('================================================');
        
        const matchesResult = await makeRequest('/league-matches', { 
            season_id: workingSeasonId,
            max_per_page: 500
        }, `All matches for season ${workingSeasonId}`);
        
        if (matchesResult.success && matchesResult.rawData) {
            const allMatches = Array.isArray(matchesResult.rawData) ? matchesResult.rawData : [matchesResult.rawData];
            
            console.log(`📊 Total matches found: ${allMatches.length}`);
            
            // Look for Iran's matches in this season
            const iranHomeMatches = filterMatchesByTeamAndVenue(allMatches, matchData.homeId, 'HOME');
            const nkAwayMatches = filterMatchesByTeamAndVenue(allMatches, matchData.awayId, 'AWAY');
            
            workingData.formData.iranLast5Home = iranHomeMatches;
            workingData.formData.nkLast5Away = nkAwayMatches;
            
            console.log(`🇮🇷 Iran HOME games found: ${iranHomeMatches.length}`);
            console.log(`🇰🇵 NK AWAY games found: ${nkAwayMatches.length}`);
            
            // If no matches for target teams, look for any teams as examples
            if (iranHomeMatches.length === 0 && nkAwayMatches.length === 0) {
                console.log('\n🔄 No matches for target teams, looking for example matches...');
                
                // Get unique team IDs from matches
                const teamIds = [...new Set(allMatches.flatMap(m => [m.homeID, m.awayID]).filter(Boolean))];
                
                if (teamIds.length > 0) {
                    const exampleTeamId = teamIds[0];
                    const exampleHomeMatches = filterMatchesByTeamAndVenue(allMatches, exampleTeamId, 'HOME');
                    const exampleAwayMatches = filterMatchesByTeamAndVenue(allMatches, exampleTeamId, 'AWAY');
                    
                    workingData.debug.exampleTeamId = exampleTeamId;
                    workingData.debug.exampleHomeMatches = exampleHomeMatches;
                    workingData.debug.exampleAwayMatches = exampleAwayMatches;
                    
                    console.log(`📋 Example team ${exampleTeamId} - HOME: ${exampleHomeMatches.length}, AWAY: ${exampleAwayMatches.length}`);
                }
            }
        }
        
        // FINAL SUMMARY
        console.log('\n🎯 FINAL RESULTS');
        console.log('================');
        console.log(`📊 Total API Requests: ${workingData.summary.totalRequests}`);
        console.log(`✅ Successful: ${workingData.summary.successfulRequests}`);
        console.log(`❌ Failed: ${workingData.summary.failedRequests}`);
        console.log(`🏆 Working Season ID: ${workingData.workingSeasonId}`);
        console.log(`🇮🇷 Iran HOME games: ${workingData.formData.iranLast5Home.length}/5`);
        console.log(`🇰🇵 NK AWAY games: ${workingData.formData.nkLast5Away.length}/5`);
        
        const success = workingData.formData.iranLast5Home.length > 0 || workingData.formData.nkLast5Away.length > 0;
        console.log(`\n🎉 SUCCESS: ${success ? 'YES - Found form data!' : 'NO - Could not find form data'}`);
        
        if (workingData.formData.iranLast5Home.length > 0) {
            console.log(`\n🇮🇷 IRAN'S LAST ${workingData.formData.iranLast5Home.length} HOME GAMES:`);
            workingData.formData.iranLast5Home.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (Match ID: ${match.id})`);
            });
        }
        
        if (workingData.formData.nkLast5Away.length > 0) {
            console.log(`\n🇰🇵 NORTH KOREA'S LAST ${workingData.formData.nkLast5Away.length} AWAY GAMES:`);
            workingData.formData.nkLast5Away.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (Match ID: ${match.id})`);
            });
        }
        
    } catch (error) {
        console.error('\n💥 CRITICAL ERROR:', error.message);
        workingData.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `FINAL-WORKING-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(workingData, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return workingData;
}

// Execute if running directly
if (require.main === module) {
    runFinalWorkingTest()
        .then(results => {
            console.log('\n🏁 Test completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runFinalWorkingTest };
