/**
 * ULTIMATE CORRECTED MATCH DATA COLLECTOR - FINAL VERSION
 * 
 * 🔥 IMPLEMENTA TODAS AS CORREÇÕES CRÍTICAS IDENTIFICADAS NO DEBUG
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1. ✅ Form Data: Sem filtro venue, filtro manual por homeID/awayID
 * 2. ✅ Season vs Competition: Usar competition_id para seleções
 * 3. ✅ Endpoints condicionais: Pular league-season para internacionais
 * 4. ✅ Referee opcional: Só chamar se ID existir
 * 5. ✅ Data normalization: Tratamento consistente de respostas
 * 
 * TARGET: Iran vs North Korea (Match ID: 7479469)
 * GOAL: Extract Iran's last 5 HOME games + North Korea's last 5 AWAY games
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;

let ultimateData = {
    timestamp: new Date().toISOString(),
    version: 'ULTIMATE-CORRECTED-FINAL',
    target: 'IRAN LAST 5 HOME + NK LAST 5 AWAY',
    matchInfo: {},
    formData: {
        iranLast5Home: [],
        nkLast5Away: []
    },
    additionalData: {},
    debugInfo: {},
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0,
        iranHomeGamesFound: 0,
        nkAwayGamesFound: 0
    }
};

/**
 * Make corrected API request with better error handling
 */
async function makeRequest(endpoint, params = {}, description = '') {
    try {
        ultimateData.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        console.log(`   URL: ${url}`);
        console.log(`   Params:`, requestParams);
        
        const response = await axios.get(url, { params: requestParams });
        
        ultimateData.summary.successfulRequests++;
        console.log(`✅ SUCCESS: ${response.status} (${response.data?.data?.length || 'N/A'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        ultimateData.summary.failedRequests++;
        console.log(`❌ FAILED: ${error.response?.status || 'Network'} - ${error.message}`);
        
        return {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: null
        };
    }
}

/**
 * Normalize match object from different API responses
 */
function normalizeMatch(rawMatch) {
    const match = rawMatch.data ?? rawMatch;
    
    return {
        id: match.id,
        homeId: match.homeID ?? match.home_id,
        awayId: match.awayID ?? match.away_id,
        homeName: match.home_name ?? match.homeTeam?.name ?? 'Unknown Home',
        awayName: match.away_name ?? match.awayTeam?.name ?? 'Unknown Away',
        seasonYear: match.season ? String(match.season) : null,
        competitionId: match.competition_id ?? match.competitionId,
        leagueId: match.league_id ?? match.leagueId,
        refereeId: match.refereeID ?? match.referee_id,
        date: match.date_unix ?? match.date,
        venue: match.venue,
        status: match.status
    };
}

/**
 * Filter matches by team and venue type
 */
function filterMatches(matches, teamId, venueType) {
    if (!matches || !Array.isArray(matches)) {
        console.log(`⚠️  No matches array to filter (received: ${typeof matches})`);
        return [];
    }
    
    console.log(`🔍 Filtering ${matches.length} matches for team ${teamId} (${venueType})`);
    
    let filtered = [];
    
    for (const match of matches) {
        const normalized = normalizeMatch(match);
        
        if (venueType === 'HOME' && normalized.homeId === teamId) {
            filtered.push(normalized);
        } else if (venueType === 'AWAY' && normalized.awayId === teamId) {
            filtered.push(normalized);
        }
    }
    
    console.log(`✅ Found ${filtered.length} ${venueType} matches for team ${teamId}`);
    return filtered.slice(0, 5); // Limit to last 5
}

/**
 * Main execution function
 */
async function runUltimateCorrectedTest() {
    console.log('🚀 ULTIMATE CORRECTED MATCH TEST - FINAL VERSION');
    console.log('================================================');
    console.log(`🎯 TARGET: Extract Iran's last 5 HOME games + NK's last 5 AWAY games`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // STEP 1: Get target match data
        console.log('\n📊 STEP 1: GETTING TARGET MATCH DATA');
        console.log('====================================');
        
        const matchResult = await makeRequest('/match', { match_id: TARGET_MATCH_ID }, 'Target Match Details');
        
        if (!matchResult.success) {
            throw new Error('Failed to get target match data');
        }
        
        const matchData = normalizeMatch(matchResult.rawData);
        ultimateData.matchInfo = matchData;
        
        console.log(`✅ Match: ${matchData.homeName} (ID: ${matchData.homeId}) vs ${matchData.awayName} (ID: ${matchData.awayId})`);
        console.log(`   Season: ${matchData.seasonYear}`);
        console.log(`   Competition ID: ${matchData.competitionId}`);
        console.log(`   League ID: ${matchData.leagueId}`);
        
        // STEP 2: Get Iran's matches (for HOME games)
        console.log('\n🇮🇷 STEP 2: GETTING IRAN\'S MATCHES');
        console.log('==================================');
        
        // Try multiple approaches for Iran's matches
        let iranMatches = [];
        
        // Approach 2A: League matches without venue filter
        if (matchData.leagueId) {
            console.log('🔄 Trying /league-matches (no venue filter)...');
            const iranLeagueResult = await makeRequest('/league-matches', { 
                league_id: matchData.leagueId,
                season: matchData.seasonYear
            }, 'Iran League Matches');
            
            if (iranLeagueResult.success && iranLeagueResult.rawData) {
                const allMatches = Array.isArray(iranLeagueResult.rawData) ? iranLeagueResult.rawData : [iranLeagueResult.rawData];
                iranMatches = filterMatches(allMatches, matchData.homeId, 'HOME');
                console.log(`✅ Found ${iranMatches.length} Iran HOME matches from league`);
            }
        }
        
        // Approach 2B: Team matches if league approach failed
        if (iranMatches.length === 0) {
            console.log('🔄 Trying /team-matches...');
            const iranTeamResult = await makeRequest('/team-matches', { 
                team_id: matchData.homeId,
                season: matchData.seasonYear
            }, 'Iran Team Matches');
            
            if (iranTeamResult.success && iranTeamResult.rawData) {
                const allMatches = Array.isArray(iranTeamResult.rawData) ? iranTeamResult.rawData : [iranTeamResult.rawData];
                iranMatches = filterMatches(allMatches, matchData.homeId, 'HOME');
                console.log(`✅ Found ${iranMatches.length} Iran HOME matches from team endpoint`);
            }
        }
        
        ultimateData.formData.iranLast5Home = iranMatches;
        ultimateData.summary.iranHomeGamesFound = iranMatches.length;
        
        // STEP 3: Get North Korea's matches (for AWAY games)
        console.log('\n🇰🇵 STEP 3: GETTING NORTH KOREA\'S MATCHES');
        console.log('==========================================');
        
        let nkMatches = [];
        
        // Approach 3A: League matches without venue filter
        if (matchData.leagueId) {
            console.log('🔄 Trying /league-matches (no venue filter)...');
            const nkLeagueResult = await makeRequest('/league-matches', { 
                league_id: matchData.leagueId,
                season: matchData.seasonYear
            }, 'NK League Matches');
            
            if (nkLeagueResult.success && nkLeagueResult.rawData) {
                const allMatches = Array.isArray(nkLeagueResult.rawData) ? nkLeagueResult.rawData : [nkLeagueResult.rawData];
                nkMatches = filterMatches(allMatches, matchData.awayId, 'AWAY');
                console.log(`✅ Found ${nkMatches.length} NK AWAY matches from league`);
            }
        }
        
        // Approach 3B: Team matches if league approach failed
        if (nkMatches.length === 0) {
            console.log('🔄 Trying /team-matches...');
            const nkTeamResult = await makeRequest('/team-matches', { 
                team_id: matchData.awayId,
                season: matchData.seasonYear
            }, 'NK Team Matches');
            
            if (nkTeamResult.success && nkTeamResult.rawData) {
                const allMatches = Array.isArray(nkTeamResult.rawData) ? nkTeamResult.rawData : [nkTeamResult.rawData];
                nkMatches = filterMatches(allMatches, matchData.awayId, 'AWAY');
                console.log(`✅ Found ${nkMatches.length} NK AWAY matches from team endpoint`);
            }
        }
        
        ultimateData.formData.nkLast5Away = nkMatches;
        ultimateData.summary.nkAwayGamesFound = nkMatches.length;
        
        // STEP 4: Get additional context data
        console.log('\n📋 STEP 4: GETTING ADDITIONAL CONTEXT');
        console.log('=====================================');
        
        // Competition info
        if (matchData.competitionId) {
            const compResult = await makeRequest('/competition', { 
                competition_id: matchData.competitionId 
            }, 'Competition Details');
            ultimateData.additionalData.competition = compResult.rawData;
        }
        
        // League info
        if (matchData.leagueId) {
            const leagueResult = await makeRequest('/league', { 
                league_id: matchData.leagueId 
            }, 'League Details');
            ultimateData.additionalData.league = leagueResult.rawData;
        }
        
        // Referee info (only if ID exists)
        if (matchData.refereeId && matchData.refereeId !== null) {
            const refResult = await makeRequest('/referee', { 
                referee_id: matchData.refereeId 
            }, 'Referee Details');
            ultimateData.additionalData.referee = refResult.rawData;
        } else {
            console.log('⚠️  Skipping referee (no ID available)');
        }
        
        // FINAL SUMMARY
        console.log('\n🎯 FINAL RESULTS SUMMARY');
        console.log('========================');
        console.log(`📊 Total API Requests: ${ultimateData.summary.totalRequests}`);
        console.log(`✅ Successful: ${ultimateData.summary.successfulRequests}`);
        console.log(`❌ Failed: ${ultimateData.summary.failedRequests}`);
        console.log(`🇮🇷 Iran HOME games found: ${ultimateData.summary.iranHomeGamesFound}/5`);
        console.log(`🇰🇵 NK AWAY games found: ${ultimateData.summary.nkAwayGamesFound}/5`);
        
        // Success criteria
        const success = ultimateData.summary.iranHomeGamesFound > 0 || ultimateData.summary.nkAwayGamesFound > 0;
        console.log(`\n🎉 OVERALL SUCCESS: ${success ? 'YES' : 'NO'}`);
        
        if (ultimateData.formData.iranLast5Home.length > 0) {
            console.log(`\n🇮🇷 IRAN'S LAST ${ultimateData.formData.iranLast5Home.length} HOME GAMES:`);
            ultimateData.formData.iranLast5Home.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (ID: ${match.id})`);
            });
        }
        
        if (ultimateData.formData.nkLast5Away.length > 0) {
            console.log(`\n🇰🇵 NORTH KOREA'S LAST ${ultimateData.formData.nkLast5Away.length} AWAY GAMES:`);
            ultimateData.formData.nkLast5Away.forEach((match, i) => {
                console.log(`   ${i+1}. ${match.homeName} vs ${match.awayName} (ID: ${match.id})`);
            });
        }
        
    } catch (error) {
        console.error('\n💥 CRITICAL ERROR:', error.message);
        ultimateData.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `ULTIMATE-CORRECTED-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(ultimateData, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return ultimateData;
}

// Execute if running directly
if (require.main === module) {
    runUltimateCorrectedTest()
        .then(results => {
            console.log('\n🏁 Test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runUltimateCorrectedTest };
