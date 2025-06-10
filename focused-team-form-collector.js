/**
 * FOCUSED TEAM FORM DATA COLLECTOR
 * 
 * 🎯 OBJECTIVE: Get last 5 HOME games for Iran (8607) and last 5 AWAY games for North Korea (8597)
 * 
 * STRATEGY:
 * 1. Use multiple endpoint approaches to find team matches
 * 2. Try different parameter combinations
 * 3. Filter results to get specific home/away form
 * 4. Validate data quality and completeness
 * 
 * Target Match: Iran vs North Korea (Match ID: 7479469)
 * Home Team: Iran (ID: 8607) - need last 5 HOME games
 * Away Team: North Korea (ID: 8597) - need last 5 AWAY games
 * Season: 2026, Round: 113916
 * 
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const BACKEND_API = 'http://localhost:5000';

// Target match details from previous test
const TARGET_MATCH = {
    id: 7479469,
    homeTeamId: 8607,
    homeTeamName: 'Iran',
    awayTeamId: 8597,
    awayTeamName: 'North Korea',
    season: '2026',
    roundId: 113916,
    leagueId: null // Will try to find this
};

let formData = {
    timestamp: new Date().toISOString(),
    version: 'FOCUSED-TEAM-FORM-v1.0',
    target: 'LAST 5 HOME GAMES FOR IRAN + LAST 5 AWAY GAMES FOR NORTH KOREA',
    targetMatch: TARGET_MATCH,
    iranData: {
        teamInfo: {},
        last5HomeGames: [],
        allMatches: [],
        leagueMatches: []
    },
    northKoreaData: {
        teamInfo: {},
        last5AwayGames: [],
        allMatches: [],
        leagueMatches: []
    },
    endpointResults: {},
    summary: { totalRequests: 0, successfulRequests: 0, failedRequests: 0 },
    analysis: {}
};

async function makeRequest(url, params = {}, description = '', type = 'direct') {
    console.log(`🔄 ${type.toUpperCase()}: ${description}`);
    console.log(`   URL: ${url}`);
    if (Object.keys(params).length > 0) {
        console.log(`   Params:`, params);
    }
    
    try {
        const config = {
            timeout: 30000,
            headers: { 'User-Agent': 'Odd-Genius-Form-Collector/1.0' }
        };

        if (type === 'direct') {
            config.params = { key: API_KEY, ...params };
        }

        const response = await axios.get(url, config);
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        formData.summary.successfulRequests++;
        
        return {
            success: true,
            type,
            url,
            description,
            params,
            status: response.status,
            data: response.data,
            dataSize: JSON.stringify(response.data).length,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.response?.status || 'Network'} | ${error.message}`);
        formData.summary.failedRequests++;
        
        return {
            success: false,
            type,
            url,
            description,
            params,
            error: error.message,
            status: error.response?.status || 'Network Error',
            timestamp: new Date().toISOString()
        };
    } finally {
        formData.summary.totalRequests++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Conservative rate limiting
    }
}

async function findLeagueContext() {
    console.log('\n🔍 PHASE 1: FINDING LEAGUE CONTEXT');
    console.log('===================================');
    
    // Try to find what leagues these teams play in
    const strategies = [
        // Strategy 1: Get all leagues and look for Asian/International competitions
        { endpoint: '/league-list', params: {}, description: 'All Available Leagues' },
        
        // Strategy 2: Get team details to find league info
        { endpoint: '/team', params: { team_id: TARGET_MATCH.homeTeamId }, description: 'Iran Team Details' },
        { endpoint: '/team', params: { team_id: TARGET_MATCH.awayTeamId }, description: 'North Korea Team Details' },
        
        // Strategy 3: Try common international league IDs
        { endpoint: '/league', params: { league_id: 1 }, description: 'League ID 1 Details' },
        { endpoint: '/league', params: { league_id: 100 }, description: 'League ID 100 Details' },
        { endpoint: '/league', params: { league_id: 200 }, description: 'League ID 200 Details' }
    ];
    
    for (const strategy of strategies) {
        const result = await makeRequest(`${DIRECT_API}${strategy.endpoint}`, strategy.params, strategy.description, 'direct');
        formData.endpointResults[`context_${strategy.endpoint.replace('/', '')}_${Object.values(strategy.params).join('_') || 'all'}`] = result;
        
        // Store team info
        if (strategy.endpoint === '/team') {
            if (strategy.params.team_id === TARGET_MATCH.homeTeamId) {
                formData.iranData.teamInfo = result;
            } else if (strategy.params.team_id === TARGET_MATCH.awayTeamId) {
                formData.northKoreaData.teamInfo = result;
            }
        }
        
        // Look for league information in response
        if (result.success && result.data) {
            const dataStr = JSON.stringify(result.data).toLowerCase();
            if (dataStr.includes('asia') || dataStr.includes('world cup') || dataStr.includes('international')) {
                console.log(`   🎯 Potential relevant league found in: ${strategy.description}`);
            }
        }
    }
}

async function gatherTeamMatches(teamId, teamName, isHomeTeam = true) {
    console.log(`\n${isHomeTeam ? '🏠' : '✈️'} PHASE ${isHomeTeam ? '2' : '3'}: GATHERING ${teamName.toUpperCase()} MATCHES`);
    console.log('='.repeat(60));
    
    const teamData = isHomeTeam ? formData.iranData : formData.northKoreaData;
    
    // Strategy 1: Direct team matches (no league filter)
    console.log('\n📋 Strategy 1: Direct team matches');
    const directStrategies = [
        { params: { team_id: teamId }, description: `${teamName} All Matches` },
        { params: { team_id: teamId, limit: 50 }, description: `${teamName} Last 50 Matches` },
        { params: { team_id: teamId, season_id: 2026 }, description: `${teamName} 2026 Season` },
        { params: { team_id: teamId, season_id: 2025 }, description: `${teamName} 2025 Season` },
        { params: { team_id: teamId, season_id: 2024 }, description: `${teamName} 2024 Season` }
    ];
    
    for (const strategy of directStrategies) {
        const result = await makeRequest(`${DIRECT_API}/matches`, strategy.params, strategy.description, 'direct');
        formData.endpointResults[`${teamName.toLowerCase()}_matches_${Object.values(strategy.params).join('_')}`] = result;
        
        if (result.success && result.data) {
            const matches = result.data.data || result.data;
            if (Array.isArray(matches)) {
                console.log(`   📊 Found ${matches.length} matches`);
                teamData.allMatches = teamData.allMatches.concat(matches);
            }
        }
    }
    
    // Strategy 2: Try with different league IDs
    console.log('\n📋 Strategy 2: League-specific matches');
    const leagueIds = [1, 2, 10, 50, 100, 200, 300, 500, 1000]; // Common league IDs
    
    for (const leagueId of leagueIds) {
        const result = await makeRequest(`${DIRECT_API}/matches`, { 
            team_id: teamId, 
            league_id: leagueId, 
            limit: 20 
        }, `${teamName} League ${leagueId} Matches`, 'direct');
        
        formData.endpointResults[`${teamName.toLowerCase()}_league_${leagueId}`] = result;
        
        if (result.success && result.data) {
            const matches = result.data.data || result.data;
            if (Array.isArray(matches) && matches.length > 0) {
                console.log(`   🎯 Found ${matches.length} matches in league ${leagueId}`);
                teamData.leagueMatches = teamData.leagueMatches.concat(matches);
            }
        }
    }
    
    // Strategy 3: Alternative endpoints
    console.log('\n📋 Strategy 3: Alternative endpoints');
    const altEndpoints = [
        { endpoint: '/team-matches', params: { team_id: teamId }, description: `${teamName} Team Matches Endpoint` },
        { endpoint: '/league-matches', params: { team_id: teamId }, description: `${teamName} League Matches` }
    ];
    
    for (const alt of altEndpoints) {
        const result = await makeRequest(`${DIRECT_API}${alt.endpoint}`, alt.params, alt.description, 'direct');
        formData.endpointResults[`${teamName.toLowerCase()}_${alt.endpoint.replace('/', '')}`] = result;
        
        if (result.success && result.data) {
            const matches = result.data.data || result.data;
            if (Array.isArray(matches)) {
                console.log(`   📊 Found ${matches.length} matches via ${alt.endpoint}`);
                teamData.allMatches = teamData.allMatches.concat(matches);
            }
        }
    }
    
    // Remove duplicates and filter for home/away
    teamData.allMatches = teamData.allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
    );
    
    console.log(`\n📈 Total unique matches found for ${teamName}: ${teamData.allMatches.length}`);
    
    return teamData.allMatches;
}

function extractTeamForm() {
    console.log('\n🎯 PHASE 4: EXTRACTING TEAM FORM DATA');
    console.log('======================================');
    
    // Extract Iran's last 5 HOME games
    console.log('\n🏠 Extracting Iran last 5 HOME games...');
    const iranHomeGames = formData.iranData.allMatches.filter(match => {
        // Check if Iran is the home team
        const isHomeTeam = match.homeID === TARGET_MATCH.homeTeamId || 
                          match.home_id === TARGET_MATCH.homeTeamId ||
                          match.homeTeam?.id === TARGET_MATCH.homeTeamId;
        
        // Must be completed game
        const isCompleted = match.status === 'complete' || match.status === 'finished' || 
                           match.homeGoalCount >= 0 || match.totalGoalCount >= 0;
        
        return isHomeTeam && isCompleted;
    }).sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.date || a.datetime || a.kickoff_time || 0);
        const dateB = new Date(b.date || b.datetime || b.kickoff_time || 0);
        return dateB - dateA;
    }).slice(0, 5);
    
    formData.iranData.last5HomeGames = iranHomeGames;
    console.log(`   ✅ Found ${iranHomeGames.length} Iran home games`);
    
    // Extract North Korea's last 5 AWAY games
    console.log('\n✈️ Extracting North Korea last 5 AWAY games...');
    const northKoreaAwayGames = formData.northKoreaData.allMatches.filter(match => {
        // Check if North Korea is the away team
        const isAwayTeam = match.awayID === TARGET_MATCH.awayTeamId || 
                          match.away_id === TARGET_MATCH.awayTeamId ||
                          match.awayTeam?.id === TARGET_MATCH.awayTeamId;
        
        // Must be completed game
        const isCompleted = match.status === 'complete' || match.status === 'finished' || 
                           match.homeGoalCount >= 0 || match.totalGoalCount >= 0;
        
        return isAwayTeam && isCompleted;
    }).sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.date || a.datetime || a.kickoff_time || 0);
        const dateB = new Date(b.date || b.datetime || b.kickoff_time || 0);
        return dateB - dateA;
    }).slice(0, 5);
    
    formData.northKoreaData.last5AwayGames = northKoreaAwayGames;
    console.log(`   ✅ Found ${northKoreaAwayGames.length} North Korea away games`);
    
    // Print detailed form information
    if (iranHomeGames.length > 0) {
        console.log('\n🏠 IRAN LAST 5 HOME GAMES:');
        iranHomeGames.forEach((game, index) => {
            const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
            const result = game.homeGoalCount > game.awayGoalCount ? 'W' : 
                          game.homeGoalCount < game.awayGoalCount ? 'L' : 'D';
            console.log(`   ${index + 1}. ${game.date || 'Date N/A'} vs ${game.awayTeam?.name || game.away_name || 'Unknown'} ${score} (${result})`);
        });
    }
    
    if (northKoreaAwayGames.length > 0) {
        console.log('\n✈️ NORTH KOREA LAST 5 AWAY GAMES:');
        northKoreaAwayGames.forEach((game, index) => {
            const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
            const result = game.awayGoalCount > game.homeGoalCount ? 'W' : 
                          game.awayGoalCount < game.homeGoalCount ? 'L' : 'D';
            console.log(`   ${index + 1}. ${game.date || 'Date N/A'} @ ${game.homeTeam?.name || game.home_name || 'Unknown'} ${score} (${result})`);
        });
    }
    
    return {
        iranHomeGames: iranHomeGames.length,
        northKoreaAwayGames: northKoreaAwayGames.length
    };
}

function analyzeFormData() {
    console.log('\n📊 PHASE 5: ANALYZING FORM DATA');
    console.log('=================================');
    
    const analysis = {
        dataCollection: {
            totalEndpoints: Object.keys(formData.endpointResults).length,
            successfulEndpoints: 0,
            failedEndpoints: 0,
            totalDataBytes: 0
        },
        teamForm: {
            iranHomeGames: formData.iranData.last5HomeGames.length,
            northKoreaAwayGames: formData.northKoreaData.last5AwayGames.length,
            targetAchieved: false
        },
        matchData: {
            iranTotalMatches: formData.iranData.allMatches.length,
            northKoreaTotalMatches: formData.northKoreaData.allMatches.length,
            uniqueLeagues: new Set(),
            dateRange: { earliest: null, latest: null }
        }
    };
    
    // Analyze endpoint results
    Object.values(formData.endpointResults).forEach(result => {
        if (result.success) {
            analysis.dataCollection.successfulEndpoints++;
            analysis.dataCollection.totalDataBytes += result.dataSize || 0;
        } else {
            analysis.dataCollection.failedEndpoints++;
        }
    });
    
    // Check if we achieved our target
    analysis.teamForm.targetAchieved = analysis.teamForm.iranHomeGames >= 5 && analysis.teamForm.northKoreaAwayGames >= 5;
    
    // Analyze match data
    const allMatches = [...formData.iranData.allMatches, ...formData.northKoreaData.allMatches];
    allMatches.forEach(match => {
        if (match.league_id) analysis.matchData.uniqueLeagues.add(match.league_id);
        
        const matchDate = new Date(match.date || match.datetime || match.kickoff_time);
        if (!isNaN(matchDate.getTime())) {
            if (!analysis.matchData.earliest || matchDate < analysis.matchData.earliest) {
                analysis.matchData.earliest = matchDate;
            }
            if (!analysis.matchData.latest || matchDate > analysis.matchData.latest) {
                analysis.matchData.latest = matchDate;
            }
        }
    });
    
    formData.analysis = analysis;
    
    // Print analysis
    console.log('\n📈 ANALYSIS RESULTS:');
    console.log(`   Total Endpoints Tested: ${analysis.dataCollection.totalEndpoints}`);
    console.log(`   Successful: ${analysis.dataCollection.successfulEndpoints}`);
    console.log(`   Failed: ${analysis.dataCollection.failedEndpoints}`);
    console.log(`   Success Rate: ${((analysis.dataCollection.successfulEndpoints / analysis.dataCollection.totalEndpoints) * 100).toFixed(1)}%`);
    console.log(`   Total Data: ${(analysis.dataCollection.totalDataBytes / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🎯 FORM DATA RESULTS:');
    console.log(`   Iran Home Games: ${analysis.teamForm.iranHomeGames}/5`);
    console.log(`   North Korea Away Games: ${analysis.teamForm.northKoreaAwayGames}/5`);
    console.log(`   Target Achieved: ${analysis.teamForm.targetAchieved ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 MATCH DATA OVERVIEW:');
    console.log(`   Iran Total Matches: ${analysis.matchData.iranTotalMatches}`);
    console.log(`   North Korea Total Matches: ${analysis.matchData.northKoreaTotalMatches}`);
    console.log(`   Unique Leagues: ${analysis.matchData.uniqueLeagues.size}`);
    
    return analysis;
}

function generateFormReport() {
    console.log('\n📋 PHASE 6: GENERATING FORM REPORT');
    console.log('===================================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Complete data file
    const completeFile = `FOCUSED-team-form-data-${timestamp}.json`;
    fs.writeFileSync(completeFile, JSON.stringify(formData, null, 2));
    console.log(`💾 Complete data: ${completeFile}`);
    
    // Form summary file
    const formSummary = {
        targetMatch: formData.targetMatch,
        formData: {
            iranLast5Home: formData.iranData.last5HomeGames,
            northKoreaLast5Away: formData.northKoreaData.last5AwayGames
        },
        analysis: formData.analysis,
        summary: formData.summary
    };
    
    const summaryFile = `FOCUSED-form-summary-${timestamp}.json`;
    fs.writeFileSync(summaryFile, JSON.stringify(formSummary, null, 2));
    console.log(`📊 Form summary: ${summaryFile}`);
    
    // Text report
    const textFile = `FOCUSED-form-report-${timestamp}.txt`;
    let report = `FOCUSED TEAM FORM DATA COLLECTION REPORT\n`;
    report += `========================================\n\n`;
    report += `Generated: ${formData.timestamp}\n`;
    report += `Target: ${formData.target}\n\n`;
    
    report += `TARGET MATCH:\n`;
    report += `${formData.targetMatch.homeTeamName} (${formData.targetMatch.homeTeamId}) vs ${formData.targetMatch.awayTeamName} (${formData.targetMatch.awayTeamId})\n`;
    report += `Match ID: ${formData.targetMatch.id}\n`;
    report += `Season: ${formData.targetMatch.season}\n\n`;
    
    report += `FORM DATA RESULTS:\n`;
    report += `Iran Last 5 Home Games: ${formData.iranData.last5HomeGames.length}\n`;
    formData.iranData.last5HomeGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const result = game.homeGoalCount > game.awayGoalCount ? 'W' : 
                      game.homeGoalCount < game.awayGoalCount ? 'L' : 'D';
        report += `  ${index + 1}. ${game.date || 'Date N/A'} vs ${game.awayTeam?.name || game.away_name || 'Unknown'} ${score} (${result})\n`;
    });
    
    report += `\nNorth Korea Last 5 Away Games: ${formData.northKoreaData.last5AwayGames.length}\n`;
    formData.northKoreaData.last5AwayGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const result = game.awayGoalCount > game.homeGoalCount ? 'W' : 
                      game.awayGoalCount < game.homeGoalCount ? 'L' : 'D';
        report += `  ${index + 1}. ${game.date || 'Date N/A'} @ ${game.homeTeam?.name || game.home_name || 'Unknown'} ${score} (${result})\n`;
    });
    
    report += `\nDATA COLLECTION SUMMARY:\n`;
    report += `Total Requests: ${formData.summary.totalRequests}\n`;
    report += `Successful: ${formData.summary.successfulRequests}\n`;
    report += `Failed: ${formData.summary.failedRequests}\n`;
    report += `Success Rate: ${((formData.summary.successfulRequests / formData.summary.totalRequests) * 100).toFixed(1)}%\n`;
    
    fs.writeFileSync(textFile, report);
    console.log(`📄 Text report: ${textFile}`);
    
    return { completeFile, summaryFile, textFile };
}

async function runFocusedFormCollection() {
    console.log('🚀 FOCUSED TEAM FORM DATA COLLECTOR');
    console.log('====================================');
    console.log(`🎯 TARGET: ${formData.target}`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);
    
    console.log('🎮 TARGET MATCH DETAILS:');
    console.log(`   Match: ${TARGET_MATCH.homeTeamName} vs ${TARGET_MATCH.awayTeamName}`);
    console.log(`   Home Team ID: ${TARGET_MATCH.homeTeamId}`);
    console.log(`   Away Team ID: ${TARGET_MATCH.awayTeamId}`);
    console.log(`   Match ID: ${TARGET_MATCH.id}`);
    console.log(`   Season: ${TARGET_MATCH.season}`);

    try {
        // Phase 1: Find league context
        await findLeagueContext();
        
        // Phase 2: Gather Iran matches (home team)
        await gatherTeamMatches(TARGET_MATCH.homeTeamId, TARGET_MATCH.homeTeamName, true);
        
        // Phase 3: Gather North Korea matches (away team)  
        await gatherTeamMatches(TARGET_MATCH.awayTeamId, TARGET_MATCH.awayTeamName, false);
        
        // Phase 4: Extract team form
        const formResults = extractTeamForm();
        
        // Phase 5: Analyze form data
        const analysis = analyzeFormData();
        
        // Phase 6: Generate reports
        const files = generateFormReport();
        
        // Final results
        const successRate = ((formData.summary.successfulRequests / formData.summary.totalRequests) * 100).toFixed(1);
        
        console.log('\n🎉 FOCUSED FORM COLLECTION COMPLETED!');
        console.log('=====================================');
        console.log(`📊 Overall Success Rate: ${successRate}%`);
        console.log(`🏠 Iran Last 5 Home Games: ${formResults.iranHomeGames}`);
        console.log(`✈️ North Korea Last 5 Away Games: ${formResults.northKoreaAwayGames}`);
        console.log(`📈 Total Data: ${(analysis.dataCollection.totalDataBytes / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📁 Files Generated: ${Object.keys(files).length}`);
        
        if (formResults.iranHomeGames >= 5 && formResults.northKoreaAwayGames >= 5) {
            console.log('\n🏆 MISSION ACCOMPLISHED!');
            console.log('✅ Successfully collected last 5 home games for Iran');
            console.log('✅ Successfully collected last 5 away games for North Korea');
            console.log('✅ Complete team form data available for match analysis');
        } else if (formResults.iranHomeGames > 0 || formResults.northKoreaAwayGames > 0) {
            console.log('\n⚠️ PARTIAL SUCCESS');
            console.log(`📊 Iran home games: ${formResults.iranHomeGames}/5`);
            console.log(`📊 North Korea away games: ${formResults.northKoreaAwayGames}/5`);
            console.log('💡 Some form data collected - can be used for analysis');
        } else {
            console.log('\n❌ NO FORM DATA COLLECTED');
            console.log('💡 Try different team IDs or league parameters');
        }
        
        return formData;
        
    } catch (error) {
        console.error('💥 Error in focused form collection:', error.message);
        throw error;
    }
}

// Run the focused form collection
if (require.main === module) {
    runFocusedFormCollection().catch(console.error);
}

module.exports = { runFocusedFormCollection, formData };
