/**
 * COMPREHENSIVE UPCOMING MATCH DATA COLLECTOR
 * 
 * 🎯 OBJECTIVE: Find an upcoming game today and gather ALL possible data
 * 
 * DATA COLLECTION STRATEGY:
 * 1. Find upcoming match today
 * 2. Get complete match details
 * 3. Get home team data + last 5 HOME games
 * 4. Get away team data + last 5 AWAY games
 * 5. Get H2H data between teams
 * 6. Get prediction data (BTTS, Over 2.5)
 * 7. Get referee data
 * 8. Get player data for both teams
 * 9. Get league context data
 * 10. Get corners/cards statistics
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
    version: 'COMPREHENSIVE-MATCH-DATA-v1.0',
    target: 'COMPLETE DATA FOR ONE UPCOMING MATCH',
    selectedMatch: null,
    homeTeam: { data: {}, last5Home: [], statistics: {} },
    awayTeam: { data: {}, last5Away: [], statistics: {} },
    h2hData: [],
    predictionData: {},
    refereeData: {},
    leagueContext: {},
    cornersCardsStats: {},
    playerData: { home: [], away: [] },
    summary: { totalRequests: 0, successfulRequests: 0, failedRequests: 0 },
    allEndpointsData: {}
};

async function makeRequest(url, params = {}, description = '', type = 'direct') {
    console.log(`🔄 ${type.toUpperCase()}: ${description}`);
    
    try {
        const config = {
            timeout: 25000,
            headers: { 'User-Agent': 'Odd-Genius-Comprehensive-Test/1.0' }
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

async function findUpcomingMatchToday() {
    console.log('\n🔍 PHASE 1: FINDING UPCOMING MATCH TODAY');
    console.log('==========================================');
    
    // Try backend first
    let result = await makeRequest(`${BACKEND_API}/api/matches/upcoming`, {}, 'Backend Upcoming Matches', 'backend');
    
    if (!result.success || !result.data?.result?.length) {
        // Try direct API
        result = await makeRequest(`${DIRECT_API}/todays-matches`, {}, 'Direct API Today\'s Matches', 'direct');
    }
    
    if (!result.success) {
        throw new Error('Could not fetch upcoming matches');
    }
    
    matchData.allEndpointsData.upcomingMatches = result;
    
    // Find suitable upcoming match
    let matches = [];
    if (result.data?.result) {
        matches = Array.isArray(result.data.result) ? result.data.result : [result.data.result];
    } else if (result.data?.data) {
        matches = Array.isArray(result.data.data) ? result.data.data : [result.data.data];
    }
    
    // Filter for upcoming matches today
    const today = new Date().toISOString().split('T')[0];
    const upcomingToday = matches.filter(match => {
        const matchDate = match.date || match.datetime || match.kickoff_time;
        return matchDate && matchDate.includes(today) && 
               (match.status === 'scheduled' || match.status === 'upcoming' || !match.status);
    });
    
    if (upcomingToday.length === 0) {
        console.log('⚠️ No upcoming matches today, using first available match');
        matchData.selectedMatch = matches[0];
    } else {
        matchData.selectedMatch = upcomingToday[0];
    }
    
    console.log(`✅ Selected Match: ${matchData.selectedMatch?.homeTeam?.name || matchData.selectedMatch?.home_name} vs ${matchData.selectedMatch?.awayTeam?.name || matchData.selectedMatch?.away_name}`);
    console.log(`   Match ID: ${matchData.selectedMatch?.id || matchData.selectedMatch?.match_id}`);
    console.log(`   Date: ${matchData.selectedMatch?.date || matchData.selectedMatch?.datetime}`);
    
    return matchData.selectedMatch;
}

async function gatherCompleteMatchData() {
    const match = matchData.selectedMatch;
    const matchId = match?.id || match?.match_id;
    const homeTeamId = match?.homeTeam?.id || match?.home_id;
    const awayTeamId = match?.awayTeam?.id || match?.away_id;
    const leagueId = match?.league_id || match?.competition?.id;
    
    console.log('\n📊 PHASE 2: GATHERING COMPLETE MATCH DATA');
    console.log('===========================================');
    console.log(`Match ID: ${matchId}`);
    console.log(`Home Team ID: ${homeTeamId}`);
    console.log(`Away Team ID: ${awayTeamId}`);
    console.log(`League ID: ${leagueId}`);
    
    // 1. Get detailed match information
    if (matchId) {
        console.log('\n🎯 Getting detailed match information...');
        const matchResult = await makeRequest(`${DIRECT_API}/match`, { match_id: matchId }, 'Detailed Match Info', 'direct');
        matchData.allEndpointsData.matchDetails = matchResult;
    }
    
    // 2. Get home team complete data
    if (homeTeamId) {
        console.log('\n🏠 Getting home team complete data...');
        const homeTeamResult = await makeRequest(`${DIRECT_API}/team`, { team_id: homeTeamId }, 'Home Team Details', 'direct');
        matchData.homeTeam.data = homeTeamResult;
        matchData.allEndpointsData.homeTeamDetails = homeTeamResult;
        
        // Get home team logo
        const homeLogoResult = await makeRequest(`${DIRECT_API}/team-image`, { team_id: homeTeamId }, 'Home Team Logo', 'direct');
        matchData.allEndpointsData.homeTeamLogo = homeLogoResult;
        
        // Get home team players
        const homePlayersResult = await makeRequest(`${DIRECT_API}/team-players`, { team_id: homeTeamId }, 'Home Team Players', 'direct');
        matchData.playerData.home = homePlayersResult;
        matchData.allEndpointsData.homeTeamPlayers = homePlayersResult;
    }
    
    // 3. Get away team complete data
    if (awayTeamId) {
        console.log('\n✈️ Getting away team complete data...');
        const awayTeamResult = await makeRequest(`${DIRECT_API}/team`, { team_id: awayTeamId }, 'Away Team Details', 'direct');
        matchData.awayTeam.data = awayTeamResult;
        matchData.allEndpointsData.awayTeamDetails = awayTeamResult;
        
        // Get away team logo
        const awayLogoResult = await makeRequest(`${DIRECT_API}/team-image`, { team_id: awayTeamId }, 'Away Team Logo', 'direct');
        matchData.allEndpointsData.awayTeamLogo = awayLogoResult;
        
        // Get away team players
        const awayPlayersResult = await makeRequest(`${DIRECT_API}/team-players`, { team_id: awayTeamId }, 'Away Team Players', 'direct');
        matchData.playerData.away = awayPlayersResult;
        matchData.allEndpointsData.awayTeamPlayers = awayPlayersResult;
    }
    
    // 4. Get league context data
    if (leagueId) {
        console.log('\n🏆 Getting league context data...');
        const leagueResult = await makeRequest(`${DIRECT_API}/league`, { league_id: leagueId }, 'League Details', 'direct');
        matchData.leagueContext = leagueResult;
        matchData.allEndpointsData.leagueDetails = leagueResult;
        
        // Get league season statistics (corners/cards source)
        const seasonResult = await makeRequest(`${DIRECT_API}/league-season`, { league_id: leagueId, season_id: 2023 }, 'League Season Stats', 'direct');
        matchData.cornersCardsStats = seasonResult;
        matchData.allEndpointsData.leagueSeasonStats = seasonResult;
        
        // Get league teams for more context
        const teamsResult = await makeRequest(`${DIRECT_API}/league-teams`, { league_id: leagueId, season_id: 2023 }, 'League Teams Stats', 'direct');
        matchData.allEndpointsData.leagueTeams = teamsResult;
        
        // Get league players
        const playersResult = await makeRequest(`${DIRECT_API}/league-players`, { league_id: leagueId, season_id: 2023 }, 'League Players', 'direct');
        matchData.allEndpointsData.leaguePlayers = playersResult;
        
        // Get league referees
        const refereesResult = await makeRequest(`${DIRECT_API}/league-referees`, { league_id: leagueId, season_id: 2023 }, 'League Referees', 'direct');
        matchData.allEndpointsData.leagueReferees = refereesResult;
    }
    
    // 5. Get recent matches for both teams (for last 5 home/away)
    if (homeTeamId && leagueId) {
        console.log('\n📈 Getting home team recent matches...');
        const homeMatchesResult = await makeRequest(`${DIRECT_API}/matches`, { team_id: homeTeamId, league_id: leagueId, limit: 20 }, 'Home Team Recent Matches', 'direct');
        matchData.allEndpointsData.homeTeamMatches = homeMatchesResult;
        
        // Filter for last 5 home games
        if (homeMatchesResult.success && homeMatchesResult.data) {
            const matches = homeMatchesResult.data.data || homeMatchesResult.data;
            if (Array.isArray(matches)) {
                matchData.homeTeam.last5Home = matches
                    .filter(m => m.home_id === homeTeamId || m.homeTeam?.id === homeTeamId)
                    .slice(0, 5);
            }
        }
    }
    
    if (awayTeamId && leagueId) {
        console.log('\n📈 Getting away team recent matches...');
        const awayMatchesResult = await makeRequest(`${DIRECT_API}/matches`, { team_id: awayTeamId, league_id: leagueId, limit: 20 }, 'Away Team Recent Matches', 'direct');
        matchData.allEndpointsData.awayTeamMatches = awayMatchesResult;
        
        // Filter for last 5 away games
        if (awayMatchesResult.success && awayMatchesResult.data) {
            const matches = awayMatchesResult.data.data || awayMatchesResult.data;
            if (Array.isArray(matches)) {
                matchData.awayTeam.last5Away = matches
                    .filter(m => m.away_id === awayTeamId || m.awayTeam?.id === awayTeamId)
                    .slice(0, 5);
            }
        }
    }
    
    // 6. Get prediction data via backend
    console.log('\n🔮 Getting prediction data...');
    const bttsResult = await makeRequest(`${BACKEND_API}/api/footystats/btts-stats`, {}, 'BTTS Prediction Data', 'backend');
    matchData.allEndpointsData.bttsPredictions = bttsResult;
    
    const over25Result = await makeRequest(`${BACKEND_API}/api/footystats/over25-stats`, {}, 'Over 2.5 Prediction Data', 'backend');
    matchData.allEndpointsData.over25Predictions = over25Result;
    
    // 7. Get referee data (if available)
    console.log('\n👨‍⚖️ Getting referee data...');
    const refereeResult = await makeRequest(`${DIRECT_API}/referee`, { referee_id: 123 }, 'Referee Details', 'direct');
    matchData.refereeData = refereeResult;
    matchData.allEndpointsData.refereeDetails = refereeResult;
    
    // 8. Get additional backend data
    console.log('\n🔧 Getting additional backend data...');
    const healthResult = await makeRequest(`${BACKEND_API}/api/health`, {}, 'Backend Health', 'backend');
    matchData.allEndpointsData.backendHealth = healthResult;
    
    const leaguesResult = await makeRequest(`${BACKEND_API}/api/footystats/leagues`, {}, 'Backend Leagues', 'backend');
    matchData.allEndpointsData.backendLeagues = leaguesResult;
    
    const todayResult = await makeRequest(`${BACKEND_API}/api/footystats/today`, {}, 'Backend Today Matches', 'backend');
    matchData.allEndpointsData.backendToday = todayResult;
}

function analyzeCollectedData() {
    console.log('\n🔍 PHASE 3: ANALYZING COLLECTED DATA');
    console.log('=====================================');
    
    const analysis = {
        dataPoints: {
            matchDetails: false,
            homeTeamData: false,
            awayTeamData: false,
            homeTeamLast5Home: false,
            awayTeamLast5Away: false,
            h2hData: false,
            predictionData: false,
            refereeData: false,
            leagueContext: false,
            cornersCardsData: false,
            playerData: false,
            imageUrls: 0
        },
        statistics: {
            totalEndpointsTested: Object.keys(matchData.allEndpointsData).length,
            successfulEndpoints: 0,
            failedEndpoints: 0,
            totalDataBytes: 0
        }
    };
    
    let allDataStr = '';
    let imageCount = 0;
    
    // Analyze each endpoint result
    Object.entries(matchData.allEndpointsData).forEach(([key, result]) => {
        if (result.success) {
            analysis.statistics.successfulEndpoints++;
            const dataStr = JSON.stringify(result.data);
            allDataStr += dataStr.toLowerCase();
            analysis.statistics.totalDataBytes += dataStr.length;
            
            // Count images
            const imageMatches = dataStr.match(/(https?:\/\/[^\s"]+\.(jpg|jpeg|png|gif|svg|webp))/gi);
            if (imageMatches) imageCount += imageMatches.length;
        } else {
            analysis.statistics.failedEndpoints++;
        }
    });
    
    // Check data availability
    analysis.dataPoints.matchDetails = !!matchData.allEndpointsData.matchDetails?.success;
    analysis.dataPoints.homeTeamData = !!matchData.allEndpointsData.homeTeamDetails?.success;
    analysis.dataPoints.awayTeamData = !!matchData.allEndpointsData.awayTeamDetails?.success;
    analysis.dataPoints.homeTeamLast5Home = matchData.homeTeam.last5Home.length > 0;
    analysis.dataPoints.awayTeamLast5Away = matchData.awayTeam.last5Away.length > 0;
    analysis.dataPoints.predictionData = !!(matchData.allEndpointsData.bttsPredictions?.success || matchData.allEndpointsData.over25Predictions?.success);
    analysis.dataPoints.refereeData = !!matchData.allEndpointsData.refereeDetails?.success;
    analysis.dataPoints.leagueContext = !!matchData.allEndpointsData.leagueDetails?.success;
    analysis.dataPoints.playerData = !!(matchData.allEndpointsData.homeTeamPlayers?.success || matchData.allEndpointsData.awayTeamPlayers?.success);
    analysis.dataPoints.imageUrls = imageCount;
    
    // Check for corners/cards data
    if (allDataStr.includes('corner') || allDataStr.includes('card') || allDataStr.includes('yellow') || allDataStr.includes('red')) {
        analysis.dataPoints.cornersCardsData = true;
    }
    
    // Check for H2H data  
    if (allDataStr.includes('h2h') || allDataStr.includes('head2head') || allDataStr.includes('versus')) {
        analysis.dataPoints.h2hData = true;
    }
    
    // Print analysis
    console.log('\n📊 DATA ANALYSIS RESULTS:');
    Object.entries(analysis.dataPoints).forEach(([key, value]) => {
        const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : `📈 ${value}`;
        console.log(`   ${key}: ${status}`);
    });
    
    console.log('\n📈 STATISTICS:');
    console.log(`   Total Endpoints Tested: ${analysis.statistics.totalEndpointsTested}`);
    console.log(`   Successful: ${analysis.statistics.successfulEndpoints}`);
    console.log(`   Failed: ${analysis.statistics.failedEndpoints}`);
    console.log(`   Success Rate: ${((analysis.statistics.successfulEndpoints / analysis.statistics.totalEndpointsTested) * 100).toFixed(1)}%`);
    console.log(`   Total Data: ${(analysis.statistics.totalDataBytes / 1024 / 1024).toFixed(2)} MB`);
    
    return analysis;
}

function generateComprehensiveReport() {
    console.log('\n📋 PHASE 4: GENERATING COMPREHENSIVE REPORT');
    console.log('=============================================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save complete data
    const dataFile = `comprehensive-match-data-${timestamp}.json`;
    fs.writeFileSync(dataFile, JSON.stringify(matchData, null, 2));
    console.log(`💾 Complete data saved: ${dataFile}`);
    
    // Create focused match report
    const matchReport = {
        selectedMatch: matchData.selectedMatch,
        homeTeam: {
            details: matchData.homeTeam.data?.data,
            last5HomeGames: matchData.homeTeam.last5Home,
            players: matchData.playerData.home?.data
        },
        awayTeam: {
            details: matchData.awayTeam.data?.data,
            last5AwayGames: matchData.awayTeam.last5Away,
            players: matchData.playerData.away?.data
        },
        predictions: {
            btts: matchData.allEndpointsData.bttsPredictions?.data,
            over25: matchData.allEndpointsData.over25Predictions?.data
        },
        leagueContext: matchData.leagueContext?.data,
        referee: matchData.refereeData?.data
    };
    
    const reportFile = `match-analysis-report-${timestamp}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(matchReport, null, 2));
    console.log(`📊 Match report saved: ${reportFile}`);
    
    // Create summary text
    const summaryFile = `match-data-summary-${timestamp}.txt`;
    let summary = `COMPREHENSIVE MATCH DATA COLLECTION REPORT\n`;
    summary += `==========================================\n\n`;
    summary += `Generated: ${matchData.timestamp}\n`;
    summary += `Target: ${matchData.target}\n\n`;
    
    summary += `SELECTED MATCH:\n`;
    summary += `${matchData.selectedMatch?.homeTeam?.name || matchData.selectedMatch?.home_name} vs ${matchData.selectedMatch?.awayTeam?.name || matchData.selectedMatch?.away_name}\n`;
    summary += `Date: ${matchData.selectedMatch?.date || matchData.selectedMatch?.datetime}\n`;
    summary += `League: ${matchData.selectedMatch?.league_name || 'Unknown'}\n\n`;
    
    summary += `DATA COLLECTION RESULTS:\n`;
    summary += `Total Requests: ${matchData.summary.totalRequests}\n`;
    summary += `Successful: ${matchData.summary.successfulRequests}\n`;
    summary += `Failed: ${matchData.summary.failedRequests}\n`;
    summary += `Success Rate: ${((matchData.summary.successfulRequests / matchData.summary.totalRequests) * 100).toFixed(1)}%\n\n`;
    
    summary += `HOME TEAM LAST 5 HOME GAMES:\n`;
    matchData.homeTeam.last5Home.forEach((game, index) => {
        summary += `${index + 1}. ${game.date} - ${game.result || game.score || 'TBD'}\n`;
    });
    
    summary += `\nAWAY TEAM LAST 5 AWAY GAMES:\n`;
    matchData.awayTeam.last5Away.forEach((game, index) => {
        summary += `${index + 1}. ${game.date} - ${game.result || game.score || 'TBD'}\n`;
    });
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary saved: ${summaryFile}`);
    
    return { dataFile, reportFile, summaryFile };
}

async function runComprehensiveMatchDataCollection() {
    console.log('🚀 COMPREHENSIVE UPCOMING MATCH DATA COLLECTOR');
    console.log('===============================================');
    console.log(`🎯 TARGET: Complete data for one upcoming match`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // Phase 1: Find upcoming match
        await findUpcomingMatchToday();
        
        // Phase 2: Gather all data
        await gatherCompleteMatchData();
        
        // Phase 3: Analyze data
        const analysis = analyzeCollectedData();
        
        // Phase 4: Generate reports
        const files = generateComprehensiveReport();
        
        // Final results
        const successRate = ((matchData.summary.successfulRequests / matchData.summary.totalRequests) * 100).toFixed(1);
        
        console.log('\n🎉 COMPREHENSIVE DATA COLLECTION COMPLETED!');
        console.log(`📊 Success Rate: ${successRate}%`);
        console.log(`📈 Total Requests: ${matchData.summary.totalRequests}`);
        console.log(`✅ Successful: ${matchData.summary.successfulRequests}`);
        console.log(`❌ Failed: ${matchData.summary.failedRequests}`);
        console.log(`🏠 Home Team Last 5 Home: ${matchData.homeTeam.last5Home.length} games`);
        console.log(`✈️ Away Team Last 5 Away: ${matchData.awayTeam.last5Away.length} games`);
        console.log(`📁 Files Generated: ${Object.values(files).length}`);
        
        return matchData;
        
    } catch (error) {
        console.error('💥 Error in comprehensive data collection:', error.message);
        throw error;
    }
}

// Run the comprehensive test
if (require.main === module) {
    runComprehensiveMatchDataCollection().catch(console.error);
}

module.exports = { runComprehensiveMatchDataCollection, matchData };
