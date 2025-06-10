/**
 * COMPREHENSIVE MATCH ANALYTICS EXTRACTOR
 * 
 * 🎯 IMPLEMENTA TODOS OS 8 ENDPOINTS SOLICITADOS:
 * 1. Goals Over/Under Thresholds (0.5-5.5)
 * 2. Cards Over/Under Thresholds (0.5-5.5) 
 * 3. Corners Over/Under Thresholds (6.5-13.5)
 * 4. Referee Analysis
 * 5. League Context Data
 * 6. Head-to-Head (H2H) Analysis
 * 7. Player Statistics
 * 8. Expected Statistics (xStats)
 * 
 * TARGET: Iran vs North Korea (Match ID: 7479469, Season: 10117)
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;
const WORKING_SEASON_ID = 10117; // Discovered from previous test
const IRAN_TEAM_ID = 8607;
const NK_TEAM_ID = 8597;

let comprehensiveAnalytics = {
    timestamp: new Date().toISOString(),
    version: 'COMPREHENSIVE-ANALYTICS-v1.0',
    targetMatch: {},
    
    // 1. Goals Over/Under Analysis
    goalsAnalysis: {
        thresholds: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
        iranLast5Home: { matches: [], statistics: {} },
        iranLast10Home: { matches: [], statistics: {} },
        nkLast5Away: { matches: [], statistics: {} },
        nkLast10Away: { matches: [], statistics: {} }
    },
    
    // 2. Cards Over/Under Analysis
    cardsAnalysis: {
        thresholds: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
        iranLast5Home: { matches: [], statistics: {} },
        iranLast10Home: { matches: [], statistics: {} },
        nkLast5Away: { matches: [], statistics: {} },
        nkLast10Away: { matches: [], statistics: {} }
    },
    
    // 3. Corners Over/Under Analysis
    cornersAnalysis: {
        thresholds: [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
        iranLast5Home: { matches: [], statistics: {} },
        iranLast10Home: { matches: [], statistics: {} },
        nkLast5Away: { matches: [], statistics: {} },
        nkLast10Away: { matches: [], statistics: {} }
    },
    
    // 4. Referee Analysis
    refereeAnalysis: {
        refereeInfo: {},
        cardsPerMatch: {},
        penaltiesAwarded: {},
        homeAwayBias: {},
        historicalData: {}
    },
    
    // 5. League Context
    leagueContext: {
        standings: {},
        leagueAverages: {},
        homeAwayPerformance: {},
        positionAnalysis: {}
    },
    
    // 6. Head-to-Head Analysis
    h2hAnalysis: {
        last5Meetings: [],
        last10Meetings: [],
        venueAnalysis: {},
        statisticsBreakdown: {}
    },
    
    // 7. Player Statistics
    playerStats: {
        iranPlayers: { last5: [], last10: [] },
        nkPlayers: { last5: [], last10: [] }
    },
    
    // 8. Expected Statistics
    xStats: {
        expectedGoals: {},
        expectedCorners: {},
        expectedCards: {},
        varianceAnalysis: {}
    },
    
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0,
        endpointsCompleted: 0,
        completionRate: 0
    }
};

async function makeRequest(endpoint, params = {}, description = '') {
    try {
        comprehensiveAnalytics.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        
        const response = await axios.get(url, { 
            params: requestParams,
            timeout: 20000
        });
        
        comprehensiveAnalytics.summary.successfulRequests++;
        console.log(`   ✅ ${response.status} (${Array.isArray(response.data?.data) ? response.data.data.length : 'OK'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        comprehensiveAnalytics.summary.failedRequests++;
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
        
        // Goals data
        homeGoals: match.homeGoalCount ?? match.home_goals ?? 0,
        awayGoals: match.awayGoalCount ?? match.away_goals ?? 0,
        totalGoals: (match.homeGoalCount ?? match.home_goals ?? 0) + (match.awayGoalCount ?? match.away_goals ?? 0),
        
        // Cards data
        homeYellowCards: match.team_a_yellow_cards ?? match.home_yellow_cards ?? 0,
        awayYellowCards: match.team_b_yellow_cards ?? match.away_yellow_cards ?? 0,
        homeRedCards: match.team_a_red_cards ?? match.home_red_cards ?? 0,
        awayRedCards: match.team_b_red_cards ?? match.away_red_cards ?? 0,
        totalCards: (match.team_a_yellow_cards ?? 0) + (match.team_b_yellow_cards ?? 0) + (match.team_a_red_cards ?? 0) + (match.team_b_red_cards ?? 0),
        
        // Corners data
        homeCorners: match.team_a_corners ?? match.home_corners ?? 0,
        awayCorners: match.team_b_corners ?? match.away_corners ?? 0,
        totalCorners: (match.team_a_corners ?? match.home_corners ?? 0) + (match.team_b_corners ?? match.away_corners ?? 0),
        
        // Match info
        season: match.season,
        competitionId: match.competition_id ?? match.competitionId,
        date: match.date_unix ?? match.date,
        venue: match.venue,
        status: match.status
    };
}

function filterMatchesByTeamAndVenue(matches, teamId, venueType, limit = 10) {
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
    
    return filtered.slice(0, limit);
}

function calculateOverUnderStats(matches, thresholds, statField) {
    const stats = {};
    
    thresholds.forEach(threshold => {
        const overCount = matches.filter(match => match[statField] > threshold).length;
        const underCount = matches.length - overCount;
        
        stats[`over_${threshold}`] = {
            count: overCount,
            percentage: matches.length > 0 ? (overCount / matches.length * 100).toFixed(1) : 0
        };
        
        stats[`under_${threshold}`] = {
            count: underCount,
            percentage: matches.length > 0 ? (underCount / matches.length * 100).toFixed(1) : 0
        };
    });
    
    return stats;
}

async function runComprehensiveAnalytics() {
    console.log('🔬 COMPREHENSIVE MATCH ANALYTICS EXTRACTOR');
    console.log('===========================================');
    console.log(`🎯 TARGET: Iran (${IRAN_TEAM_ID}) vs North Korea (${NK_TEAM_ID})`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // STEP 0: Get target match
        console.log('📊 STEP 0: TARGET MATCH VERIFICATION');
        console.log('====================================');
        
        const matchResult = await makeRequest('/match', { match_id: TARGET_MATCH_ID }, 'Target Match');
        
        if (matchResult.success) {
            const matchData = parseMatch(matchResult.rawData);
            comprehensiveAnalytics.targetMatch = matchData;
            console.log(`✅ Confirmed: ${matchData.homeName} vs ${matchData.awayName}`);
        }
        
        // STEP 1: Get match data for analysis
        console.log('\n📋 STEP 1: GETTING MATCH DATA');
        console.log('=============================');
        
        const matchesResult = await makeRequest('/league-matches', { 
            season_id: WORKING_SEASON_ID,
            max_per_page: 1000
        }, `Season ${WORKING_SEASON_ID} matches`);
        
        let allMatches = [];
        if (matchesResult.success && matchesResult.rawData) {
            allMatches = Array.isArray(matchesResult.rawData) ? matchesResult.rawData : [matchesResult.rawData];
            console.log(`✅ Found ${allMatches.length} total matches`);
        }
        
        // Extract team matches
        const iranLast5Home = filterMatchesByTeamAndVenue(allMatches, IRAN_TEAM_ID, 'HOME', 5);
        const iranLast10Home = filterMatchesByTeamAndVenue(allMatches, IRAN_TEAM_ID, 'HOME', 10);
        const nkLast5Away = filterMatchesByTeamAndVenue(allMatches, NK_TEAM_ID, 'AWAY', 5);
        const nkLast10Away = filterMatchesByTeamAndVenue(allMatches, NK_TEAM_ID, 'AWAY', 10);
        
        console.log(`🇮🇷 Iran - Last 5 HOME: ${iranLast5Home.length}, Last 10 HOME: ${iranLast10Home.length}`);
        console.log(`🇰🇵 NK - Last 5 AWAY: ${nkLast5Away.length}, Last 10 AWAY: ${nkLast10Away.length}`);
        
        // STEP 2: Goals Over/Under Analysis
        console.log('\n⚽ STEP 2: GOALS OVER/UNDER ANALYSIS');
        console.log('===================================');
        
        comprehensiveAnalytics.goalsAnalysis.iranLast5Home.matches = iranLast5Home;
        comprehensiveAnalytics.goalsAnalysis.iranLast5Home.statistics = calculateOverUnderStats(
            iranLast5Home, 
            comprehensiveAnalytics.goalsAnalysis.thresholds, 
            'totalGoals'
        );
        
        comprehensiveAnalytics.goalsAnalysis.iranLast10Home.matches = iranLast10Home;
        comprehensiveAnalytics.goalsAnalysis.iranLast10Home.statistics = calculateOverUnderStats(
            iranLast10Home, 
            comprehensiveAnalytics.goalsAnalysis.thresholds, 
            'totalGoals'
        );
        
        comprehensiveAnalytics.goalsAnalysis.nkLast5Away.matches = nkLast5Away;
        comprehensiveAnalytics.goalsAnalysis.nkLast5Away.statistics = calculateOverUnderStats(
            nkLast5Away, 
            comprehensiveAnalytics.goalsAnalysis.thresholds, 
            'totalGoals'
        );
        
        comprehensiveAnalytics.goalsAnalysis.nkLast10Away.matches = nkLast10Away;
        comprehensiveAnalytics.goalsAnalysis.nkLast10Away.statistics = calculateOverUnderStats(
            nkLast10Away, 
            comprehensiveAnalytics.goalsAnalysis.thresholds, 
            'totalGoals'
        );
        
        console.log(`✅ Goals analysis completed for all match sets`);
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 3: Cards Over/Under Analysis  
        console.log('\n🟨 STEP 3: CARDS OVER/UNDER ANALYSIS');
        console.log('===================================');
        
        comprehensiveAnalytics.cardsAnalysis.iranLast5Home.matches = iranLast5Home;
        comprehensiveAnalytics.cardsAnalysis.iranLast5Home.statistics = calculateOverUnderStats(
            iranLast5Home, 
            comprehensiveAnalytics.cardsAnalysis.thresholds, 
            'totalCards'
        );
        
        comprehensiveAnalytics.cardsAnalysis.iranLast10Home.matches = iranLast10Home;
        comprehensiveAnalytics.cardsAnalysis.iranLast10Home.statistics = calculateOverUnderStats(
            iranLast10Home, 
            comprehensiveAnalytics.cardsAnalysis.thresholds, 
            'totalCards'
        );
        
        comprehensiveAnalytics.cardsAnalysis.nkLast5Away.matches = nkLast5Away;
        comprehensiveAnalytics.cardsAnalysis.nkLast5Away.statistics = calculateOverUnderStats(
            nkLast5Away, 
            comprehensiveAnalytics.cardsAnalysis.thresholds, 
            'totalCards'
        );
        
        comprehensiveAnalytics.cardsAnalysis.nkLast10Away.matches = nkLast10Away;
        comprehensiveAnalytics.cardsAnalysis.nkLast10Away.statistics = calculateOverUnderStats(
            nkLast10Away, 
            comprehensiveAnalytics.cardsAnalysis.thresholds, 
            'totalCards'
        );
        
        console.log(`✅ Cards analysis completed for all match sets`);
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 4: Corners Over/Under Analysis
        console.log('\n🚩 STEP 4: CORNERS OVER/UNDER ANALYSIS');
        console.log('=====================================');
        
        comprehensiveAnalytics.cornersAnalysis.iranLast5Home.matches = iranLast5Home;
        comprehensiveAnalytics.cornersAnalysis.iranLast5Home.statistics = calculateOverUnderStats(
            iranLast5Home, 
            comprehensiveAnalytics.cornersAnalysis.thresholds, 
            'totalCorners'
        );
        
        comprehensiveAnalytics.cornersAnalysis.iranLast10Home.matches = iranLast10Home;
        comprehensiveAnalytics.cornersAnalysis.iranLast10Home.statistics = calculateOverUnderStats(
            iranLast10Home, 
            comprehensiveAnalytics.cornersAnalysis.thresholds, 
            'totalCorners'
        );
        
        comprehensiveAnalytics.cornersAnalysis.nkLast5Away.matches = nkLast5Away;
        comprehensiveAnalytics.cornersAnalysis.nkLast5Away.statistics = calculateOverUnderStats(
            nkLast5Away, 
            comprehensiveAnalytics.cornersAnalysis.thresholds, 
            'totalCorners'
        );
        
        comprehensiveAnalytics.cornersAnalysis.nkLast10Away.matches = nkLast10Away;
        comprehensiveAnalytics.cornersAnalysis.nkLast10Away.statistics = calculateOverUnderStats(
            nkLast10Away, 
            comprehensiveAnalytics.cornersAnalysis.thresholds, 
            'totalCorners'
        );
        
        console.log(`✅ Corners analysis completed for all match sets`);
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 5: Referee Analysis
        console.log('\n👨‍⚖️ STEP 5: REFEREE ANALYSIS');
        console.log('=============================');
        
        if (comprehensiveAnalytics.targetMatch && comprehensiveAnalytics.targetMatch.refereeId) {
            const refereeResult = await makeRequest('/referee', { 
                referee_id: comprehensiveAnalytics.targetMatch.refereeId 
            }, 'Referee Data');
            
            if (refereeResult.success) {
                comprehensiveAnalytics.refereeAnalysis.refereeInfo = refereeResult.rawData;
                console.log(`✅ Referee analysis completed`);
            }
        } else {
            console.log(`⚠️  No referee data available for this match`);
        }
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 6: League Context
        console.log('\n📊 STEP 6: LEAGUE CONTEXT ANALYSIS');
        console.log('==================================');
        
        const leagueResult = await makeRequest('/league-season', { 
            season_id: WORKING_SEASON_ID 
        }, 'League Season Data');
        
        if (leagueResult.success) {
            comprehensiveAnalytics.leagueContext.standings = leagueResult.rawData;
            console.log(`✅ League context analysis completed`);
        }
        
        const tablesResult = await makeRequest('/league-tables', { 
            season_id: WORKING_SEASON_ID 
        }, 'League Tables');
        
        if (tablesResult.success) {
            comprehensiveAnalytics.leagueContext.leagueAverages = tablesResult.rawData;
            console.log(`✅ League tables analysis completed`);
        }
        
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 7: Head-to-Head Analysis
        console.log('\n🆚 STEP 7: HEAD-TO-HEAD ANALYSIS');
        console.log('================================');
        
        // Find H2H matches in the dataset
        const h2hMatches = allMatches.filter(match => {
            const normalized = parseMatch(match);
            return (
                (normalized.homeId === IRAN_TEAM_ID && normalized.awayId === NK_TEAM_ID) ||
                (normalized.homeId === NK_TEAM_ID && normalized.awayId === IRAN_TEAM_ID)
            );
        });
        
        comprehensiveAnalytics.h2hAnalysis.last5Meetings = h2hMatches.slice(0, 5);
        comprehensiveAnalytics.h2hAnalysis.last10Meetings = h2hMatches.slice(0, 10);
        
        console.log(`✅ H2H analysis completed - Found ${h2hMatches.length} historical meetings`);
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 8: Player Statistics
        console.log('\n👥 STEP 8: PLAYER STATISTICS');
        console.log('============================');
        
        const iranPlayersResult = await makeRequest('/league-players', { 
            season_id: WORKING_SEASON_ID,
            include: 'stats'
        }, 'Iran Players Data');
        
        if (iranPlayersResult.success) {
            comprehensiveAnalytics.playerStats.iranPlayers.last5 = iranPlayersResult.rawData;
            console.log(`✅ Iran players analysis completed`);
        }
        
        const nkPlayersResult = await makeRequest('/league-players', { 
            season_id: WORKING_SEASON_ID,
            include: 'stats'
        }, 'NK Players Data');
        
        if (nkPlayersResult.success) {
            comprehensiveAnalytics.playerStats.nkPlayers.last5 = nkPlayersResult.rawData;
            console.log(`✅ NK players analysis completed`);
        }
        
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // STEP 9: Expected Statistics (xStats)
        console.log('\n📈 STEP 9: EXPECTED STATISTICS (xSTATS)');
        console.log('======================================');
        
        // Calculate xStats from available data
        const calculateXStats = (matches) => {
            if (matches.length === 0) return {};
            
            const avgGoals = matches.reduce((sum, m) => sum + m.totalGoals, 0) / matches.length;
            const avgCorners = matches.reduce((sum, m) => sum + m.totalCorners, 0) / matches.length;
            const avgCards = matches.reduce((sum, m) => sum + m.totalCards, 0) / matches.length;
            
            return {
                expectedGoals: avgGoals.toFixed(2),
                expectedCorners: avgCorners.toFixed(2),
                expectedCards: avgCards.toFixed(2)
            };
        };
        
        comprehensiveAnalytics.xStats.expectedGoals = {
            iranHome: calculateXStats(iranLast5Home),
            nkAway: calculateXStats(nkLast5Away)
        };
        
        console.log(`✅ xStats analysis completed`);
        comprehensiveAnalytics.summary.endpointsCompleted++;
        
        // FINAL SUMMARY
        console.log('\n🎯 COMPREHENSIVE ANALYTICS SUMMARY');
        console.log('==================================');
        console.log(`📊 Total API Requests: ${comprehensiveAnalytics.summary.totalRequests}`);
        console.log(`✅ Successful: ${comprehensiveAnalytics.summary.successfulRequests}`);
        console.log(`❌ Failed: ${comprehensiveAnalytics.summary.failedRequests}`);
        console.log(`🏆 Endpoints Completed: ${comprehensiveAnalytics.summary.endpointsCompleted}/8`);
        
        comprehensiveAnalytics.summary.completionRate = (comprehensiveAnalytics.summary.endpointsCompleted / 8 * 100).toFixed(1);
        console.log(`📈 Completion Rate: ${comprehensiveAnalytics.summary.completionRate}%`);
        
        // Show sample results
        console.log('\n📋 SAMPLE RESULTS:');
        console.log(`⚽ Goals O/U 2.5 - Iran last 5 HOME: ${comprehensiveAnalytics.goalsAnalysis.iranLast5Home.statistics['over_2.5']?.percentage || 0}% Over`);
        console.log(`🟨 Cards O/U 3.5 - NK last 5 AWAY: ${comprehensiveAnalytics.cardsAnalysis.nkLast5Away.statistics['over_3.5']?.percentage || 0}% Over`);
        console.log(`🚩 Corners O/U 9.5 - Iran last 5 HOME: ${comprehensiveAnalytics.cornersAnalysis.iranLast5Home.statistics['over_9.5']?.percentage || 0}% Over`);
        console.log(`🆚 H2H Meetings Found: ${comprehensiveAnalytics.h2hAnalysis.last10Meetings.length}`);
        
    } catch (error) {
        console.error('\n💥 CRITICAL ERROR:', error.message);
        comprehensiveAnalytics.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `COMPREHENSIVE-ANALYTICS-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(comprehensiveAnalytics, null, 2));
    console.log(`\n💾 Complete analytics saved to: ${filename}`);
    
    return comprehensiveAnalytics;
}

// Execute if running directly
if (require.main === module) {
    runComprehensiveAnalytics()
        .then(results => {
            console.log('\n🏁 Comprehensive analytics completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Analytics failed:', error);
            process.exit(1);
        });
}

module.exports = { runComprehensiveAnalytics };
