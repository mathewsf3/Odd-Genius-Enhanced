/**
 * INTERNATIONAL MATCH FORM EXTRACTOR
 * 
 * 🎯 ESTRATÉGIA PARA SELEÇÕES NACIONAIS:
 * 1. Iran (8607) e North Korea (8597) são seleções nacionais
 * 2. Procurar em múltiplas seasons até encontrar seus jogos
 * 3. Usar season_ids de competições internacionais
 * 4. Extrair dados de forma (últimos 5 jogos HOME/AWAY)
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;

// IDs das seleções
const IRAN_TEAM_ID = 8607;
const NK_TEAM_ID = 8597;

let internationalData = {
    timestamp: new Date().toISOString(),
    version: 'INTERNATIONAL-v1.0',
    targetMatch: {},
    searchedSeasons: [],
    foundSeasons: {
        iranSeasons: [],
        nkSeasons: []
    },
    formData: {
        iranLast5Home: [],
        nkLast5Away: []
    },
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0,
        seasonsSearched: 0,
        seasonsWithData: 0
    }
};

async function makeRequest(endpoint, params = {}, description = '') {
    try {
        internationalData.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        
        const response = await axios.get(url, { 
            params: requestParams,
            timeout: 15000
        });
        
        internationalData.summary.successfulRequests++;
        console.log(`   ✅ ${response.status} (${Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        internationalData.summary.failedRequests++;
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
        date: match.date_unix ?? match.date,
        venue: match.venue,
        status: match.status
    };
}

function filterMatchesByTeamAndVenue(matches, teamId, venueType) {
    if (!matches || !Array.isArray(matches)) {
        return [];
    }
    
    let filtered = [];
    
    for (const match of matches) {
        const normalized = parseMatch(match);
        
        if (venueType === 'HOME' && normalized.homeId === teamId) {
            filtered.push(normalized);
        } else if (venueType === 'AWAY' && normalized.awayId === teamId) {
            filtered.push(normalized);
        }
    }
    
    return filtered;
}

async function searchInSeason(seasonId, teamName, teamId, venueType) {
    console.log(`\n🔍 Searching Season ${seasonId} for ${teamName} ${venueType} games...`);
    
    const result = await makeRequest('/league-matches', { 
        season_id: seasonId,
        max_per_page: 1000  // Get more matches to increase chances
    }, `Season ${seasonId} matches`);
    
    internationalData.summary.seasonsSearched++;
    
    if (result.success && result.rawData) {
        const allMatches = Array.isArray(result.rawData) ? result.rawData : [result.rawData];
        const teamMatches = filterMatchesByTeamAndVenue(allMatches, teamId, venueType);
        
        if (teamMatches.length > 0) {
            console.log(`   🎉 FOUND ${teamMatches.length} ${venueType} matches for ${teamName}!`);
            internationalData.summary.seasonsWithData++;
            
            // Store season info
            if (teamId === IRAN_TEAM_ID) {
                internationalData.foundSeasons.iranSeasons.push({
                    seasonId,
                    matchCount: teamMatches.length,
                    venueType
                });
            } else {
                internationalData.foundSeasons.nkSeasons.push({
                    seasonId,
                    matchCount: teamMatches.length,
                    venueType
                });
            }
            
            return teamMatches.slice(0, 5); // Last 5 matches
        } else {
            console.log(`   ⚪ No ${venueType} matches for ${teamName} in season ${seasonId}`);
        }
    }
    
    return [];
}

async function runInternationalSearch() {
    console.log('🌍 INTERNATIONAL MATCH FORM EXTRACTOR');
    console.log('=====================================');
    console.log(`🎯 TARGET: Iran (${IRAN_TEAM_ID}) vs North Korea (${NK_TEAM_ID})`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // STEP 1: Get target match
        console.log('📊 STEP 1: TARGET MATCH VERIFICATION');
        console.log('====================================');
        
        const matchResult = await makeRequest('/match', { match_id: TARGET_MATCH_ID }, 'Target Match');
        
        if (matchResult.success) {
            const matchData = parseMatch(matchResult.rawData);
            internationalData.targetMatch = matchData;
            console.log(`✅ Confirmed: ${matchData.homeName} vs ${matchData.awayName}`);
        }
        
        // STEP 2: Search multiple seasons for Iran HOME games
        console.log('\n🇮🇷 STEP 2: SEARCHING FOR IRAN HOME GAMES');
        console.log('==========================================');
        
        // Try multiple season IDs that might contain international matches
        const internationalSeasons = [
            1625, 1626, 1627, 1628, 1629, 1630,  // Common season IDs
            2020, 2021, 2022, 2023, 2024, 2025,  // Year-based seasons
            10117, 10118, 10119, 10120,          // Competition-based seasons
            3000, 3001, 3002, 3003, 3004,        // High-number seasons
            500, 501, 502, 503, 504, 505         // Mid-range seasons
        ];
        
        for (const seasonId of internationalSeasons) {
            internationalData.searchedSeasons.push(seasonId);
            
            // Search for Iran HOME games
            const iranHomeMatches = await searchInSeason(seasonId, 'Iran', IRAN_TEAM_ID, 'HOME');
            
            if (iranHomeMatches.length > 0) {
                internationalData.formData.iranLast5Home.push(...iranHomeMatches);
                
                // If we have enough, stop searching
                if (internationalData.formData.iranLast5Home.length >= 5) {
                    internationalData.formData.iranLast5Home = internationalData.formData.iranLast5Home.slice(0, 5);
                    break;
                }
            }
            
            // Rate limiting - small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // STEP 3: Search for North Korea AWAY games
        console.log('\n🇰🇵 STEP 3: SEARCHING FOR NORTH KOREA AWAY GAMES');
        console.log('=================================================');
        
        for (const seasonId of internationalSeasons) {
            // Search for NK AWAY games
            const nkAwayMatches = await searchInSeason(seasonId, 'North Korea', NK_TEAM_ID, 'AWAY');
            
            if (nkAwayMatches.length > 0) {
                internationalData.formData.nkLast5Away.push(...nkAwayMatches);
                
                // If we have enough, stop searching
                if (internationalData.formData.nkLast5Away.length >= 5) {
                    internationalData.formData.nkLast5Away = internationalData.formData.nkLast5Away.slice(0, 5);
                    break;
                }
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // FINAL RESULTS
        console.log('\n🎯 FINAL RESULTS');
        console.log('================');
        console.log(`📊 Total API Requests: ${internationalData.summary.totalRequests}`);
        console.log(`✅ Successful: ${internationalData.summary.successfulRequests}`);
        console.log(`❌ Failed: ${internationalData.summary.failedRequests}`);
        console.log(`🔍 Seasons Searched: ${internationalData.summary.seasonsSearched}`);
        console.log(`📋 Seasons with Data: ${internationalData.summary.seasonsWithData}`);
        console.log(`🇮🇷 Iran HOME games: ${internationalData.formData.iranLast5Home.length}/5`);
        console.log(`🇰🇵 NK AWAY games: ${internationalData.formData.nkLast5Away.length}/5`);
        
        const success = internationalData.formData.iranLast5Home.length > 0 || internationalData.formData.nkLast5Away.length > 0;
        console.log(`\n🎉 SUCCESS: ${success ? 'YES' : 'NO'}`);
        
        if (internationalData.formData.iranLast5Home.length > 0) {
            console.log(`\n🇮🇷 IRAN'S LAST ${internationalData.formData.iranLast5Home.length} HOME GAMES:`);
            internationalData.formData.iranLast5Home.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (ID: ${match.id}, Season: ${match.season})`);
            });
        }
        
        if (internationalData.formData.nkLast5Away.length > 0) {
            console.log(`\n🇰🇵 NORTH KOREA'S LAST ${internationalData.formData.nkLast5Away.length} AWAY GAMES:`);
            internationalData.formData.nkLast5Away.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (ID: ${match.id}, Season: ${match.season})`);
            });
        }
        
        // Show seasons where we found data
        if (internationalData.foundSeasons.iranSeasons.length > 0) {
            console.log(`\n📊 Iran found in seasons: ${internationalData.foundSeasons.iranSeasons.map(s => s.seasonId).join(', ')}`);
        }
        
        if (internationalData.foundSeasons.nkSeasons.length > 0) {
            console.log(`📊 North Korea found in seasons: ${internationalData.foundSeasons.nkSeasons.map(s => s.seasonId).join(', ')}`);
        }
        
    } catch (error) {
        console.error('\n💥 CRITICAL ERROR:', error.message);
        internationalData.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `INTERNATIONAL-SEARCH-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(internationalData, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return internationalData;
}

// Execute if running directly
if (require.main === module) {
    runInternationalSearch()
        .then(results => {
            console.log('\n🏁 International search completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Search failed:', error);
            process.exit(1);
        });
}

module.exports = { runInternationalSearch };
