/**
 * FINAL CORRECTED ORCHESTRATED MATCH DATA COLLECTOR - v4.0
 * 
 * 🎯 IMPLEMENTA AS 4 CORREÇÕES PONTUAIS:
 * 1. ✅ matchData = coreResult.data (não data.data)
 * 2. ✅ Team IDs robustos (homeID || home_id)
 * 3. ✅ Season ID correto (season_id || league_season_id)
 * 4. ✅ League-matches sem venue + filtro manual
 * 
 * Match Target: Iran vs North Korea (ID: 7479469)
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469; // Iran vs North Korea

let finalData = {
    timestamp: new Date().toISOString(),
    version: 'FINAL-CORRECTED-v4.0',
    target: 'Iran vs North Korea - ALL 4 CORRECTIONS APPLIED',
    targetMatchId: TARGET_MATCH_ID,
    extractedData: {
        homeTeamId: null,
        awayTeamId: null,
        actualSeason: null,
        leagueId: null,
        homeName: null,
        awayName: null
    },
    finalResults: {
        iranLast5Home: [],
        nkLast5Away: [],
        leagueSeasonSuccess: false,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
    },
    allResponses: {},
    corrections: {
        correction1_matchData: 'Use coreResult.data directly',
        correction2_teamIds: 'homeID || home_id fallback',
        correction3_seasonId: 'season_id || league_season_id',
        correction4_venueFilter: 'Manual filtering after getting all matches'
    }
};

async function makeFinalRequest(endpoint, params = {}, description = '') {
    console.log(`🔄 ${description}: ${endpoint}`);
    console.log(`   Params:`, params);
    
    try {
        const response = await axios.get(`${DIRECT_API}${endpoint}`, {
            params: { key: API_KEY, ...params },
            timeout: 25000
        });
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        finalData.finalResults.successfulRequests++;
        
        return {
            success: true,
            endpoint,
            description,
            status: response.status,
            data: response.data
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.response?.status || 'Network'} | ${error.message}`);
        finalData.finalResults.failedRequests++;
        
        return {
            success: false,
            endpoint,
            description,
            error: error.message,
            status: error.response?.status || 'Network Error'
        };
    } finally {
        finalData.finalResults.totalRequests++;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

async function runFinalCorrectedTest() {
    console.log('🚀 FINAL CORRECTED ORCHESTRATED TEST - v4.0');
    console.log('=============================================');
    console.log(`🎯 TARGET: Iran vs North Korea (${TARGET_MATCH_ID})`);
    console.log(`🔧 IMPLEMENTING ALL 4 CORRECTIONS`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // STEP 1: Get core match data
        console.log('\n📋 STEP 1: CORE MATCH DATA');
        console.log('============================');
        
        const coreResult = await makeFinalRequest('/match', { match_id: TARGET_MATCH_ID }, 'Core Match Data');
        finalData.allResponses.coreMatch = coreResult;
        
        if (!coreResult.success) {
            throw new Error('Failed to get core match data');
        }
          // CORREÇÃO #1 ATUALIZADA: O /match endpoint usa data.data structure
        const matchData = coreResult.data.data;  // ✅ CORRECTION 1 UPDATED
        console.log(`   📊 Match data structure: ${Object.keys(matchData).join(', ')}`);
        
        // CORREÇÃO #2: Team IDs robustos
        finalData.extractedData.homeTeamId = matchData.homeID || matchData.home_id;  // ✅ CORRECTION 2
        finalData.extractedData.awayTeamId = matchData.awayID || matchData.away_id;  // ✅ CORRECTION 2
        finalData.extractedData.homeName = matchData.homeTeamName || matchData.home_name || 'Iran';
        finalData.extractedData.awayName = matchData.awayTeamName || matchData.away_name || 'North Korea';
        finalData.extractedData.leagueId = matchData.league_id;
        
        // CORREÇÃO #3: Season ID correto (para FootyStats, use o year como season_id)
        finalData.extractedData.actualSeason = matchData.season_id || matchData.league_season_id || matchData.season;  // ✅ CORRECTION 3
        
        console.log(`   🏠 Home Team: ${finalData.extractedData.homeName} (ID: ${finalData.extractedData.homeTeamId})`);
        console.log(`   ✈️ Away Team: ${finalData.extractedData.awayName} (ID: ${finalData.extractedData.awayTeamId})`);
        console.log(`   🏆 League ID: ${finalData.extractedData.leagueId}`);
        console.log(`   📅 Season ID: ${finalData.extractedData.actualSeason}`);
        console.log(`   📅 Season Year: ${matchData.season}`);

        // STEP 2: League Season (com season_id correto ou pular se 417)
        console.log('\n🏆 STEP 2: LEAGUE SEASON DATA');
        console.log('==============================');
        
        if (finalData.extractedData.actualSeason) {
            const leagueSeasonResult = await makeFinalRequest(
                '/league-season',
                { season_id: finalData.extractedData.actualSeason },
                'League Season Stats'
            );
            finalData.allResponses.leagueSeason = leagueSeasonResult;
            
            if (leagueSeasonResult.success) {
                finalData.finalResults.leagueSeasonSuccess = true;
                console.log(`   ✅ League season data retrieved successfully`);
            } else if (leagueSeasonResult.status === 417) {
                console.log(`   ⚠️ Season ${finalData.extractedData.actualSeason} não habilitada - pulando stats de liga`);
            }
        } else {
            console.log(`   ⚠️ No season_id found - skipping league season data`);
        }

        // STEP 3: Team Data
        console.log('\n👥 STEP 3: TEAM DATA');
        console.log('=====================');
        
        if (finalData.extractedData.homeTeamId) {
            const iranTeamResult = await makeFinalRequest('/team', { team_id: finalData.extractedData.homeTeamId }, 'Iran Team Details');
            finalData.allResponses.iranTeam = iranTeamResult;
        }
        
        if (finalData.extractedData.awayTeamId) {
            const nkTeamResult = await makeFinalRequest('/team', { team_id: finalData.extractedData.awayTeamId }, 'North Korea Team Details');
            finalData.allResponses.nkTeam = nkTeamResult;
        }

        // STEP 4: CORREÇÃO #4 - League matches sem venue + filtro manual
        console.log('\n📈 STEP 4: TEAM FORM DATA (CORRECTED)');
        console.log('======================================');
        
        if (finalData.extractedData.homeTeamId) {
            // Iran matches (sem venue, depois filtrar manualmente)
            const iranMatchesResult = await makeFinalRequest(
                '/league-matches',
                { 
                    team_id: finalData.extractedData.homeTeamId, 
                    max_per_page: 20, 
                    order: 'date_desc' 
                },  // ✅ CORRECTION 4: sem venue
                'Iran Recent Matches (for manual filtering)'
            );
            finalData.allResponses.iranMatches = iranMatchesResult;
            
            // Filtro manual para HOME games
            if (iranMatchesResult.success) {
                const iranList = iranMatchesResult.data.data || iranMatchesResult.data;
                if (Array.isArray(iranList)) {
                    finalData.finalResults.iranLast5Home = iranList
                        .filter(m => {
                            const homeId = m.homeID || m.home_id;
                            return homeId == finalData.extractedData.homeTeamId;
                        })
                        .slice(0, 5);
                    
                    console.log(`   🏠 Iran HOME games found: ${finalData.finalResults.iranLast5Home.length}`);
                    finalData.finalResults.iranLast5Home.forEach((game, index) => {
                        console.log(`      ${index + 1}. ${game.date || 'Date N/A'} - ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`);
                    });
                } else {
                    console.log(`   ⚠️ Iran matches data is not an array`);
                }
            }
        }
        
        if (finalData.extractedData.awayTeamId) {
            // North Korea matches (sem venue, depois filtrar manualmente)
            const nkMatchesResult = await makeFinalRequest(
                '/league-matches',
                { 
                    team_id: finalData.extractedData.awayTeamId, 
                    max_per_page: 20, 
                    order: 'date_desc' 
                },  // ✅ CORRECTION 4: sem venue
                'North Korea Recent Matches (for manual filtering)'
            );
            finalData.allResponses.nkMatches = nkMatchesResult;
            
            // Filtro manual para AWAY games
            if (nkMatchesResult.success) {
                const nkList = nkMatchesResult.data.data || nkMatchesResult.data;
                if (Array.isArray(nkList)) {
                    finalData.finalResults.nkLast5Away = nkList
                        .filter(m => {
                            const awayId = m.awayID || m.away_id;
                            return awayId == finalData.extractedData.awayTeamId;
                        })
                        .slice(0, 5);
                    
                    console.log(`   ✈️ North Korea AWAY games found: ${finalData.finalResults.nkLast5Away.length}`);
                    finalData.finalResults.nkLast5Away.forEach((game, index) => {
                        console.log(`      ${index + 1}. ${game.date || 'Date N/A'} - ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`);
                    });
                } else {
                    console.log(`   ⚠️ North Korea matches data is not an array`);
                }
            }
        }

        // STEP 5: Additional Data
        console.log('\n🔮 STEP 5: ADDITIONAL DATA');
        console.log('===========================');
        
        // BTTS Stats
        if (finalData.extractedData.actualSeason) {
            const bttsResult = await makeFinalRequest('/stats-btts', { season_id: finalData.extractedData.actualSeason }, 'BTTS Statistics');
            finalData.allResponses.bttsStats = bttsResult;
        }
        
        // Over 2.5 Stats
        if (finalData.extractedData.actualSeason) {
            const over25Result = await makeFinalRequest('/stats-over25', { season_id: finalData.extractedData.actualSeason }, 'Over 2.5 Statistics');
            finalData.allResponses.over25Stats = over25Result;
        }

        // Final Analysis
        console.log('\n📊 FINAL ANALYSIS');
        console.log('==================');
        
        const successRate = ((finalData.finalResults.successfulRequests / finalData.finalResults.totalRequests) * 100).toFixed(1);
        
        console.log(`Total Requests: ${finalData.finalResults.totalRequests}`);
        console.log(`Successful: ${finalData.finalResults.successfulRequests}`);
        console.log(`Failed: ${finalData.finalResults.failedRequests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Iran Last 5 HOME: ${finalData.finalResults.iranLast5Home.length} games`);
        console.log(`NK Last 5 AWAY: ${finalData.finalResults.nkLast5Away.length} games`);
        console.log(`League Season Success: ${finalData.finalResults.leagueSeasonSuccess ? '✅' : '❌'}`);

        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultsFile = `FINAL-CORRECTED-v4-results-${timestamp}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify(finalData, null, 2));
        console.log(`\n💾 Results saved: ${resultsFile}`);

        // Summary report
        const summaryFile = `FINAL-CORRECTED-v4-summary-${timestamp}.txt`;
        let summary = `FINAL CORRECTED TEST v4.0 - ALL 4 CORRECTIONS APPLIED\n`;
        summary += `====================================================\n\n`;
        summary += `Generated: ${finalData.timestamp}\n`;
        summary += `Target: ${finalData.target}\n\n`;
        
        summary += `CORRECTIONS APPLIED:\n`;
        Object.entries(finalData.corrections).forEach(([key, value]) => {
            summary += `${key}: ${value}\n`;
        });
        summary += `\n`;
        
        summary += `EXTRACTED DATA:\n`;
        summary += `Home Team: ${finalData.extractedData.homeName} (ID: ${finalData.extractedData.homeTeamId})\n`;
        summary += `Away Team: ${finalData.extractedData.awayName} (ID: ${finalData.extractedData.awayTeamId})\n`;
        summary += `Season ID: ${finalData.extractedData.actualSeason}\n`;
        summary += `League ID: ${finalData.extractedData.leagueId}\n\n`;
        
        summary += `RESULTS:\n`;
        summary += `Success Rate: ${successRate}%\n`;
        summary += `Iran Last 5 HOME Games: ${finalData.finalResults.iranLast5Home.length}\n`;
        summary += `NK Last 5 AWAY Games: ${finalData.finalResults.nkLast5Away.length}\n`;
        summary += `League Season Success: ${finalData.finalResults.leagueSeasonSuccess}\n\n`;
        
        if (finalData.finalResults.iranLast5Home.length > 0) {
            summary += `IRAN HOME GAMES:\n`;
            finalData.finalResults.iranLast5Home.forEach((game, index) => {
                summary += `${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
            });
            summary += `\n`;
        }
        
        if (finalData.finalResults.nkLast5Away.length > 0) {
            summary += `NORTH KOREA AWAY GAMES:\n`;
            finalData.finalResults.nkLast5Away.forEach((game, index) => {
                summary += `${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
            });
        }
        
        fs.writeFileSync(summaryFile, summary);
        console.log(`📄 Summary saved: ${summaryFile}`);

        // Final verdict
        if (finalData.finalResults.iranLast5Home.length > 0 && finalData.finalResults.nkLast5Away.length > 0) {
            console.log('\n🎉 SUCCESS: ALL 4 CORRECTIONS WORKING!');
            console.log('✅ Team form data successfully collected');
        } else {
            console.log('\n⚠️ PARTIAL SUCCESS: Some form data still missing');
            console.log(`Iran HOME games: ${finalData.finalResults.iranLast5Home.length}`);
            console.log(`NK AWAY games: ${finalData.finalResults.nkLast5Away.length}`);
        }
        
        return finalData;
        
    } catch (error) {
        console.error('💥 Error in final corrected test:', error.message);
        throw error;
    }
}

// Run the final corrected test
if (require.main === module) {
    runFinalCorrectedTest().catch(console.error);
}

module.exports = { runFinalCorrectedTest, finalData };
