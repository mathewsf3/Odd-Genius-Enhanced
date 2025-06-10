/**
 * ENHANCED COMPREHENSIVE UPCOMING MATCH DATA COLLECTOR
 * 
 * 🎯 OBJECTIVE: Find an upcoming game today and gather ALL possible data
 * 
 * ENHANCED FEATURES:
 * - Better team ID extraction from different data structures
 * - Comprehensive team data collection
 * - Last 5 HOME games for home team
 * - Last 5 AWAY games for away team
 * - Complete H2H analysis
 * - All prediction data
 * - All statistical data
 * - Complete corner/cards analysis
 * 
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const BACKEND_API = 'http://localhost:5000';

let matchData = {
    timestamp: new Date().toISOString(),
    version: 'ENHANCED-COMPREHENSIVE-v2.0',
    target: 'COMPLETE DATA FOR ONE UPCOMING MATCH WITH LAST 5 HOME/AWAY',
    selectedMatch: null,
    homeTeam: { 
        id: null,
        name: null,
        data: {}, 
        last5Home: [], 
        statistics: {},
        logo: null,
        players: []
    },
    awayTeam: { 
        id: null,
        name: null,
        data: {}, 
        last5Away: [], 
        statistics: {},
        logo: null,
        players: []
    },
    h2hData: [],
    predictionData: {},
    refereeData: {},
    leagueContext: {},
    cornersCardsStats: {},
    summary: { totalRequests: 0, successfulRequests: 0, failedRequests: 0 },
    allEndpointsData: {},
    dataAnalysis: {}
};

async function makeRequest(url, params = {}, description = '', type = 'direct') {
    console.log(`🔄 ${type.toUpperCase()}: ${description}`);
    
    try {
        const config = {
            timeout: 25000,
            headers: { 'User-Agent': 'Odd-Genius-Enhanced-Test/2.0' }
        };

        if (type === 'direct') {
            config.params = { key: API_KEY, ...params };
        }

        const response = await axios.get(url, config);
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        matchData.summary.successfulRequests++;
        
        return {
            success: true,
            type,
            url,
            description,
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.response?.status || 'Network'} | ${error.message}`);
        matchData.summary.failedRequests++;
        
        return {
            success: false,
            type,
            url,
            description,
            error: error.message,
            status: error.response?.status || 'Network Error',
            timestamp: new Date().toISOString()
        };
    } finally {
        matchData.summary.totalRequests++;
        await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limiting
    }
}

function extractTeamIds(match) {
    // Try multiple possible field names for team IDs
    const homeId = match.homeID || match.home_id || match.homeTeam?.id || match.team_a_id;
    const awayId = match.awayID || match.away_id || match.awayTeam?.id || match.team_b_id;
    
    // Try multiple possible field names for team names
    const homeName = match.homeTeam?.name || match.home_name || match.team_a_name || match.homeTeamName;
    const awayName = match.awayTeam?.name || match.away_name || match.team_b_name || match.awayTeamName;
    
    // Try multiple possible field names for league ID
    const leagueId = match.league_id || match.leagueId || match.competition?.id || match.comp_id;
    
    return { homeId, awayId, homeName, awayName, leagueId };
}

async function findAndAnalyzeUpcomingMatch() {
    console.log('\n🔍 PHASE 1: FINDING & ANALYZING UPCOMING MATCH');
    console.log('===============================================');
    
    // Get today's matches
    const todayResult = await makeRequest(`${DIRECT_API}/todays-matches`, {}, 'Today\'s Matches', 'direct');
    matchData.allEndpointsData.todaysMatches = todayResult;
    
    if (!todayResult.success) {
        throw new Error('Could not fetch today\'s matches');
    }
    
    // Find suitable match
    let matches = [];
    if (todayResult.data?.data) {
        matches = Array.isArray(todayResult.data.data) ? todayResult.data.data : [todayResult.data.data];
    }
    
    // Select first available match with team data
    const suitableMatch = matches.find(match => {
        const { homeId, awayId } = extractTeamIds(match);
        return homeId && awayId;
    }) || matches[0];
    
    matchData.selectedMatch = suitableMatch;
    
    // Extract team information
    const { homeId, awayId, homeName, awayName, leagueId } = extractTeamIds(suitableMatch);
    
    matchData.homeTeam.id = homeId;
    matchData.homeTeam.name = homeName;
    matchData.awayTeam.id = awayId;
    matchData.awayTeam.name = awayName;
    
    console.log(`✅ Selected Match: ${homeName} vs ${awayName}`);
    console.log(`   Match ID: ${suitableMatch?.id}`);
    console.log(`   Home Team ID: ${homeId}`);
    console.log(`   Away Team ID: ${awayId}`);
    console.log(`   League ID: ${leagueId}`);
    
    // Get detailed match info
    if (suitableMatch?.id) {
        const matchDetailResult = await makeRequest(`${DIRECT_API}/match`, { match_id: suitableMatch.id }, 'Detailed Match Info', 'direct');
        matchData.allEndpointsData.matchDetails = matchDetailResult;
    }
    
    return { homeId, awayId, leagueId };
}

async function gatherCompleteTeamData(teamId, teamType, leagueId) {
    console.log(`\n${teamType === 'home' ? '🏠' : '✈️'} GATHERING COMPLETE ${teamType.toUpperCase()} TEAM DATA`);
    console.log('='.repeat(50));
    
    if (!teamId) {
        console.log(`⚠️ No ${teamType} team ID available`);
        return;
    }
    
    // 1. Team Details
    const teamResult = await makeRequest(`${DIRECT_API}/team`, { team_id: teamId }, `${teamType} Team Details`, 'direct');
    matchData.allEndpointsData[`${teamType}TeamDetails`] = teamResult;
    matchData[`${teamType}Team`].data = teamResult;
    
    // 2. Team Logo
    const logoResult = await makeRequest(`${DIRECT_API}/team-image`, { team_id: teamId }, `${teamType} Team Logo`, 'direct');
    matchData.allEndpointsData[`${teamType}TeamLogo`] = logoResult;
    matchData[`${teamType}Team`].logo = logoResult;
    
    // 3. Team Players
    const playersResult = await makeRequest(`${DIRECT_API}/team-players`, { team_id: teamId }, `${teamType} Team Players`, 'direct');
    matchData.allEndpointsData[`${teamType}TeamPlayers`] = playersResult;
    matchData[`${teamType}Team`].players = playersResult;
    
    // 4. Recent Matches (to extract last 5 home/away)
    if (leagueId) {
        const matchesResult = await makeRequest(`${DIRECT_API}/matches`, { 
            team_id: teamId, 
            league_id: leagueId, 
            limit: 30 
        }, `${teamType} Team Recent Matches`, 'direct');
        matchData.allEndpointsData[`${teamType}TeamMatches`] = matchesResult;
        
        // Filter for last 5 home/away games
        if (matchesResult.success && matchesResult.data) {
            const matches = matchesResult.data.data || matchesResult.data;
            if (Array.isArray(matches)) {
                if (teamType === 'home') {
                    // Filter for home games only
                    matchData.homeTeam.last5Home = matches
                        .filter(m => {
                            const { homeId } = extractTeamIds(m);
                            return homeId == teamId;
                        })
                        .slice(0, 5);
                } else {
                    // Filter for away games only
                    matchData.awayTeam.last5Away = matches
                        .filter(m => {
                            const { awayId } = extractTeamIds(m);
                            return awayId == teamId;
                        })
                        .slice(0, 5);
                }
            }
        }
    }
    
    // 5. Alternative matches endpoint for more data
    const altMatchesResult = await makeRequest(`${DIRECT_API}/matches`, { 
        team_id: teamId, 
        limit: 20 
    }, `${teamType} Team Alternative Matches`, 'direct');
    matchData.allEndpointsData[`${teamType}TeamAltMatches`] = altMatchesResult;
    
    console.log(`✅ ${teamType} Team Data Collection Complete`);
    console.log(`   Last 5 ${teamType} games: ${matchData[`${teamType}Team`][`last5${teamType === 'home' ? 'Home' : 'Away'}`].length}`);
}

async function gatherPredictionAndAnalysisData() {
    console.log('\n🔮 GATHERING PREDICTION & ANALYSIS DATA');
    console.log('=======================================');
    
    // Backend prediction data
    const bttsResult = await makeRequest(`${BACKEND_API}/api/footystats/btts-stats`, {}, 'BTTS Prediction Data', 'backend');
    matchData.allEndpointsData.bttsPredictions = bttsResult;
    
    const over25Result = await makeRequest(`${BACKEND_API}/api/footystats/over25-stats`, {}, 'Over 2.5 Prediction Data', 'backend');
    matchData.allEndpointsData.over25Predictions = over25Result;
    
    // Additional backend data
    const leaguesResult = await makeRequest(`${BACKEND_API}/api/footystats/leagues`, {}, 'Backend Leagues', 'backend');
    matchData.allEndpointsData.backendLeagues = leaguesResult;
    
    const todayBackendResult = await makeRequest(`${BACKEND_API}/api/footystats/today`, {}, 'Backend Today Matches', 'backend');
    matchData.allEndpointsData.backendToday = todayBackendResult;
    
    // Live matches for comparison
    const liveResult = await makeRequest(`${BACKEND_API}/api/matches/live`, {}, 'Live Matches', 'backend');
    matchData.allEndpointsData.liveMatches = liveResult;
    
    // Referee data
    const refereeResult = await makeRequest(`${DIRECT_API}/referee`, { referee_id: 123 }, 'Sample Referee Data', 'direct');
    matchData.allEndpointsData.refereeDetails = refereeResult;
    
    // Health check
    const healthResult = await makeRequest(`${BACKEND_API}/api/health`, {}, 'Backend Health', 'backend');
    matchData.allEndpointsData.backendHealth = healthResult;
}

function performComprehensiveAnalysis() {
    console.log('\n🔍 PHASE 4: COMPREHENSIVE DATA ANALYSIS');
    console.log('========================================');
    
    const analysis = {
        matchInfo: {
            hasMatchDetails: false,
            hasHomeTeamData: false,
            hasAwayTeamData: false,
            hasH2HData: false,
            hasOddsData: false
        },
        teamData: {
            homeTeamLast5Home: matchData.homeTeam.last5Home.length,
            awayTeamLast5Away: matchData.awayTeam.last5Away.length,
            homeTeamPlayers: 0,
            awayTeamPlayers: 0,
            homeTeamLogos: 0,
            awayTeamLogos: 0
        },
        predictionData: {
            hasBTTSData: false,
            hasOver25Data: false,
            hasOddsData: false,
            riskFactors: []
        },
        statisticalData: {
            cornersDataSources: 0,
            cardsDataSources: 0,
            goalsDataSources: 0,
            imageUrls: 0
        },
        endpoints: {
            totalTested: Object.keys(matchData.allEndpointsData).length,
            successful: 0,
            failed: 0,
            totalDataBytes: 0
        }
    };
    
    let allDataStr = '';
    
    // Analyze each endpoint
    Object.entries(matchData.allEndpointsData).forEach(([key, result]) => {
        if (result.success) {
            analysis.endpoints.successful++;
            const dataStr = JSON.stringify(result.data);
            allDataStr += dataStr.toLowerCase();
            analysis.endpoints.totalDataBytes += dataStr.length;
              // Count images
            const imageMatches = dataStr.match(/(https?:\/\/[^\s"]+\.(jpg|jpeg|png|gif|svg|webp))/gi);
            if (imageMatches) analysis.statisticalData.imageUrls += imageMatches.length;
        } else {
            analysis.endpoints.failed++;
        }
    });
    
    // Analyze match information
    analysis.matchInfo.hasMatchDetails = !!matchData.allEndpointsData.matchDetails?.success;
    analysis.matchInfo.hasHomeTeamData = !!matchData.allEndpointsData.homeTeamDetails?.success;
    analysis.matchInfo.hasAwayTeamData = !!matchData.allEndpointsData.awayTeamDetails?.success;
    
    // Check for H2H data
    if (allDataStr.includes('h2h') || allDataStr.includes('head2head') || allDataStr.includes('versus')) {
        analysis.matchInfo.hasH2HData = true;
    }
    
    // Check for odds data
    if (allDataStr.includes('odds_') || allDataStr.includes('betting')) {
        analysis.matchInfo.hasOddsData = true;
        analysis.predictionData.hasOddsData = true;
    }
    
    // Analyze prediction data
    analysis.predictionData.hasBTTSData = !!matchData.allEndpointsData.bttsPredictions?.success;
    analysis.predictionData.hasOver25Data = !!matchData.allEndpointsData.over25Predictions?.success;
    
    // Analyze statistical data
    const cornerPatterns = ['corner', 'cornersavg', 'corners_total'];
    cornerPatterns.forEach(pattern => {
        if (allDataStr.includes(pattern)) analysis.statisticalData.cornersDataSources++;
    });
    
    const cardPatterns = ['card', 'yellow', 'red', 'bookings'];
    cardPatterns.forEach(pattern => {
        if (allDataStr.includes(pattern)) analysis.statisticalData.cardsDataSources++;
    });
    
    const goalPatterns = ['goal', 'score', 'goals_for', 'goals_against'];
    goalPatterns.forEach(pattern => {
        if (allDataStr.includes(pattern)) analysis.statisticalData.goalsDataSources++;
    });
    
    // Count player data
    if (matchData.homeTeam.players?.success && matchData.homeTeam.players.data) {
        const players = matchData.homeTeam.players.data.data || matchData.homeTeam.players.data;
        analysis.teamData.homeTeamPlayers = Array.isArray(players) ? players.length : 0;
    }
    
    if (matchData.awayTeam.players?.success && matchData.awayTeam.players.data) {
        const players = matchData.awayTeam.players.data.data || matchData.awayTeam.players.data;
        analysis.teamData.awayTeamPlayers = Array.isArray(players) ? players.length : 0;
    }
    
    matchData.dataAnalysis = analysis;
      // Print detailed analysis
    console.log('\n📊 DETAILED ANALYSIS RESULTS:');
    console.log('================================');
    
    console.log('\n🎯 MATCH INFORMATION:');
    Object.entries(analysis.matchInfo).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    console.log('\n👥 TEAM DATA:');
    console.log(`   Home Team Last 5 Home Games: ${analysis.teamData.homeTeamLast5Home}`);
    console.log(`   Away Team Last 5 Away Games: ${analysis.teamData.awayTeamLast5Away}`);
    console.log(`   Home Team Players: ${analysis.teamData.homeTeamPlayers}`);
    console.log(`   Away Team Players: ${analysis.teamData.awayTeamPlayers}`);
    
    console.log('\n🔮 PREDICTION DATA:');
    Object.entries(analysis.predictionData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
            console.log(`   ${key}: ${value ? '✅' : '❌'}`);
        }
    });
    
    console.log('\n📈 STATISTICAL DATA:');
    console.log(`   Corners Data Sources: ${analysis.statisticalData.cornersDataSources}`);
    console.log(`   Cards Data Sources: ${analysis.statisticalData.cardsDataSources}`);
    console.log(`   Goals Data Sources: ${analysis.statisticalData.goalsDataSources}`);
    console.log(`   Image URLs Found: ${analysis.statisticalData.imageUrls}`);
    
    console.log('\n🌐 ENDPOINTS:');
    console.log(`   Total Tested: ${analysis.endpoints.totalTested}`);
    console.log(`   Successful: ${analysis.endpoints.successful}`);
    console.log(`   Failed: ${analysis.endpoints.failed}`);
    console.log(`   Success Rate: ${((analysis.endpoints.successful / analysis.endpoints.totalTested) * 100).toFixed(1)}%`);
    console.log(`   Total Data: ${(analysis.endpoints.totalDataBytes / 1024 / 1024).toFixed(2)} MB`);
    
    return analysis;
}

function generateEnhancedReport() {
    console.log('\n📋 PHASE 5: GENERATING ENHANCED REPORT');
    console.log('========================================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Complete data file
    const completeFile = `ENHANCED-complete-match-data-${timestamp}.json`;
    fs.writeFileSync(completeFile, JSON.stringify(matchData, null, 2));
    console.log(`💾 Complete data: ${completeFile}`);
    
    // Focused match analysis
    const focusedReport = {
        matchSummary: {
            selectedMatch: matchData.selectedMatch,
            homeTeam: {
                id: matchData.homeTeam.id,
                name: matchData.homeTeam.name,
                last5HomeGames: matchData.homeTeam.last5Home,
                playerCount: matchData.dataAnalysis.teamData.homeTeamPlayers
            },
            awayTeam: {
                id: matchData.awayTeam.id,
                name: matchData.awayTeam.name,
                last5AwayGames: matchData.awayTeam.last5Away,
                playerCount: matchData.dataAnalysis.teamData.awayTeamPlayers
            }
        },
        dataAnalysis: matchData.dataAnalysis,
        predictionData: {
            btts: matchData.allEndpointsData.bttsPredictions?.data,
            over25: matchData.allEndpointsData.over25Predictions?.data
        },
        endpoints: {
            totalTested: matchData.dataAnalysis.endpoints.totalTested,
            successRate: ((matchData.dataAnalysis.endpoints.successful / matchData.dataAnalysis.endpoints.totalTested) * 100).toFixed(1)
        }
    };
    
    const focusedFile = `ENHANCED-match-analysis-${timestamp}.json`;
    fs.writeFileSync(focusedFile, JSON.stringify(focusedReport, null, 2));
    console.log(`📊 Focused analysis: ${focusedFile}`);
    
    // Text summary
    const summaryFile = `ENHANCED-match-summary-${timestamp}.txt`;
    let summary = `ENHANCED COMPREHENSIVE MATCH DATA COLLECTION\n`;
    summary += `===========================================\n\n`;
    summary += `Generated: ${matchData.timestamp}\n`;
    summary += `Version: ${matchData.version}\n`;
    summary += `Target: ${matchData.target}\n\n`;
    
    summary += `SELECTED MATCH:\n`;
    summary += `${matchData.homeTeam.name} vs ${matchData.awayTeam.name}\n`;
    summary += `Home Team ID: ${matchData.homeTeam.id}\n`;
    summary += `Away Team ID: ${matchData.awayTeam.id}\n\n`;
    
    summary += `TEAM PERFORMANCE DATA:\n`;
    summary += `Home Team Last 5 HOME Games: ${matchData.homeTeam.last5Home.length}\n`;
    matchData.homeTeam.last5Home.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
    });
    
    summary += `\nAway Team Last 5 AWAY Games: ${matchData.awayTeam.last5Away.length}\n`;
    matchData.awayTeam.last5Away.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
    });
    
    summary += `\nDATA COLLECTION RESULTS:\n`;
    summary += `Total Requests: ${matchData.summary.totalRequests}\n`;
    summary += `Successful: ${matchData.summary.successfulRequests}\n`;
    summary += `Failed: ${matchData.summary.failedRequests}\n`;
    summary += `Success Rate: ${((matchData.summary.successfulRequests / matchData.summary.totalRequests) * 100).toFixed(1)}%\n`;
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Text summary: ${summaryFile}`);
    
    return { completeFile, focusedFile, summaryFile };
}

async function runEnhancedComprehensiveTest() {    console.log('🚀 ENHANCED COMPREHENSIVE UPCOMING MATCH DATA COLLECTOR');
    console.log('========================================================');
    console.log(`🎯 TARGET: Complete data + Last 5 Home/Away games`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // Phase 1: Find and analyze match
        const { homeId, awayId, leagueId } = await findAndAnalyzeUpcomingMatch();
        
        // Phase 2: Gather complete home team data
        await gatherCompleteTeamData(homeId, 'home', leagueId);
        
        // Phase 3: Gather complete away team data  
        await gatherCompleteTeamData(awayId, 'away', leagueId);
        
        // Phase 4: Gather prediction and analysis data
        await gatherPredictionAndAnalysisData();
        
        // Phase 5: Perform comprehensive analysis
        const analysis = performComprehensiveAnalysis();
        
        // Phase 6: Generate enhanced report
        const files = generateEnhancedReport();
          // Final results
        console.log('\n🎉 ENHANCED COMPREHENSIVE TEST COMPLETED!');
        console.log('==========================================');
        console.log(`📊 Overall Success Rate: ${((matchData.summary.successfulRequests / matchData.summary.totalRequests) * 100).toFixed(1)}%`);
        console.log(`🏠 Home Team Last 5 Home Games: ${matchData.homeTeam.last5Home.length}`);
        console.log(`✈️ Away Team Last 5 Away Games: ${matchData.awayTeam.last5Away.length}`);
        console.log(`📈 Total Data Collected: ${(analysis.endpoints.totalDataBytes / 1024 / 1024).toFixed(2)} MB`);
        console.log(`🖼️ Image URLs Found: ${analysis.statisticalData.imageUrls}`);
        console.log(`📁 Files Generated: ${Object.keys(files).length}`);
        
        if (matchData.homeTeam.last5Home.length > 0 && matchData.awayTeam.last5Away.length > 0) {
            console.log('\n✅ SUCCESS: Complete team form data collected!');
        } else {
            console.log('\n⚠️ PARTIAL: Some team form data missing - check team IDs and league data');
        }
        
        return matchData;
        
    } catch (error) {
        console.error('💥 Error in enhanced comprehensive test:', error.message);
        throw error;
    }
}

// Run the enhanced test
if (require.main === module) {
    runEnhancedComprehensiveTest().catch(console.error);
}

module.exports = { runEnhancedComprehensiveTest, matchData };
