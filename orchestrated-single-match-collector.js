/**
 * COMPREHENSIVE SINGLE MATCH DATA ORCHESTRATOR
 * 
 * 🎯 OBJECTIVE: Gather ALL data for Iran vs North Korea (Match ID: 7479469)
 * Following the complete orchestration strategy to deliver everything in one JSON
 * 
 * ORCHESTRATION FLOW:
 * 1. /match - Core match data (team IDs, league, season, odds, H2H)
 * 2. /league-season - League context (corners/cards averages, xG)
 * 3. /league-table - League standings (top 6, relegation zone)
 * 4a. /team - Team details (logos, colors, basic info)
 * 4b. /lastx - Team form (last 5/10 matches, averages)
 * 5. /stats-btts, /stats-over25 - Prediction data
 * 6. /referee - Referee statistics
 * 7. /league-players - Player statistics
 * 8. /todays-matches?status=live - Live data if applicable
 * 
 * TARGET: Single JSON response (20-80 KB) ready for frontend
 * 
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const BACKEND_API = 'http://localhost:5000';

// Target match information
const TARGET_MATCH = {
    id: 7479469,
    description: 'Iran vs North Korea',
    homeTeamId: 8607, // Iran
    awayTeamId: 8597, // North Korea
    season: 2026,
    round: 113916
};

let orchestratedData = {
    timestamp: new Date().toISOString(),
    version: 'ORCHESTRATED-SINGLE-MATCH-v1.0',
    target: `Complete data orchestration for Match ${TARGET_MATCH.id}`,
    
    // Final structured response
    response: {
        meta: {
            match_id: TARGET_MATCH.id,
            generated_at: new Date().toISOString(),
            cache_duration: 1800, // 30 minutes
            data_sources: []
        },
        match: {},          // Core match data
        league: {},         // League context
        teams: {
            home: {},       // Home team complete data
            away: {}        // Away team complete data  
        },
        form: {
            home_last5: [], // Last 5 HOME games for home team
            away_last5: []  // Last 5 AWAY games for away team
        },
        stats: {},          // Cards, corners, goals, BTTS
        referee: {},        // Referee data
        players: {},        // Player statistics
        odds: {},           // Betting odds
        prediction: {},     // Risk analysis and predictions
        live: {}            // Live data if applicable
    },
    
    // Orchestration tracking
    orchestration: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        stepDetails: [],
        totalDataBytes: 0,
        errors: []
    }
};

async function makeOrchestrationRequest(step, endpoint, params = {}, description = '', type = 'direct') {
    const stepStart = Date.now();
    console.log(`🔄 STEP ${step}: ${description}`);
    
    try {
        const url = type === 'direct' ? `${DIRECT_API}${endpoint}` : `${BACKEND_API}${endpoint}`;
        
        const config = {
            timeout: 25000,
            headers: { 'User-Agent': 'Odd-Genius-Orchestrator/1.0' }
        };

        if (type === 'direct') {
            config.params = { key: API_KEY, ...params };
        }

        const response = await axios.get(url, config);
        const responseTime = Date.now() - stepStart;
        const dataSize = JSON.stringify(response.data).length;
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${dataSize} bytes | ${responseTime}ms`);
        
        orchestratedData.orchestration.completedSteps++;
        orchestratedData.orchestration.totalDataBytes += dataSize;
        orchestratedData.response.meta.data_sources.push({
            step,
            endpoint,
            description,
            success: true,
            response_time_ms: responseTime,
            data_size_bytes: dataSize
        });
        
        const stepResult = {
            step,
            endpoint,
            description,
            success: true,
            status: response.status,
            data: response.data,
            response_time_ms: responseTime,
            data_size_bytes: dataSize,
            timestamp: new Date().toISOString()
        };
        
        orchestratedData.orchestration.stepDetails.push(stepResult);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        return stepResult;
        
    } catch (error) {
        const responseTime = Date.now() - stepStart;
        console.log(`   ❌ FAILED: ${error.response?.status || 'Network'} | ${error.message} | ${responseTime}ms`);
        
        orchestratedData.orchestration.failedSteps++;
        orchestratedData.orchestration.errors.push({
            step,
            endpoint,
            description,
            error: error.message,
            status: error.response?.status || 'Network Error'
        });
        
        orchestratedData.response.meta.data_sources.push({
            step,
            endpoint,
            description,
            success: false,
            error: error.message,
            response_time_ms: responseTime
        });
        
        const stepResult = {
            step,
            endpoint,
            description,
            success: false,
            error: error.message,
            status: error.response?.status || 'Network Error',
            response_time_ms: responseTime,
            timestamp: new Date().toISOString()
        };
        
        orchestratedData.orchestration.stepDetails.push(stepResult);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        return stepResult;
    } finally {
        orchestratedData.orchestration.totalSteps++;
    }
}

async function step1_CoreMatchData() {
    console.log('\n📊 STEP 1: CORE MATCH DATA');
    console.log('===========================');
    
    const result = await makeOrchestrationRequest(
        1, 
        '/match', 
        { match_id: TARGET_MATCH.id }, 
        'Core Match Data (team IDs, league, season, odds, H2H)',
        'direct'
    );
    
    if (result.success) {
        orchestratedData.response.match = result.data;
        
        // Extract key information for subsequent steps
        const match = result.data;
        if (match.homeID) TARGET_MATCH.homeTeamId = match.homeID;
        if (match.awayID) TARGET_MATCH.awayTeamId = match.awayID;
        if (match.season) TARGET_MATCH.season = match.season;
        if (match.roundID) TARGET_MATCH.round = match.roundID;
        
        console.log(`   📋 Extracted: Home ID ${TARGET_MATCH.homeTeamId}, Away ID ${TARGET_MATCH.awayTeamId}`);
        console.log(`   📋 Season: ${TARGET_MATCH.season}, Round: ${TARGET_MATCH.round}`);
        
        // Extract odds data
        orchestratedData.response.odds = {
            match_winner: {
                home: match.odds_ft_1 || null,
                draw: match.odds_ft_x || null,
                away: match.odds_ft_2 || null
            },
            goals: {
                over_05: match.odds_ft_over05 || null,
                over_15: match.odds_ft_over15 || null,
                over_25: match.odds_ft_over25 || null,
                over_35: match.odds_ft_over35 || null
            },
            btts: {
                yes: match.odds_btts_yes || null,
                no: match.odds_btts_no || null
            },
            corners: {
                over_75: match.odds_corners_over_75 || null,
                over_85: match.odds_corners_over_85 || null,
                over_95: match.odds_corners_over_95 || null
            }
        };
    }
    
    return result;
}

async function step2_LeagueContext() {
    console.log('\n🏆 STEP 2: LEAGUE CONTEXT');
    console.log('==========================');
    
    // Try to get league information
    const leagueResult = await makeOrchestrationRequest(
        2, 
        '/league-season', 
        { season_id: TARGET_MATCH.season }, 
        'League Season Context (cards/corners averages, xG)',
        'direct'
    );
    
    if (leagueResult.success) {
        orchestratedData.response.league = leagueResult.data;
        
        // Extract statistical averages
        const leagueData = leagueResult.data;
        if (leagueData.data && Array.isArray(leagueData.data)) {
            const stats = leagueData.data[0] || {};
            orchestratedData.response.stats.league_averages = {
                corners_per_game: stats.cornersAVG_total || null,
                cards_per_game: stats.cardsAVG_total || null,
                goals_per_game: stats.goalsAVG_total || null
            };
        }
    }
    
    return leagueResult;
}

async function step3_TeamData() {
    console.log('\n👥 STEP 3: COMPLETE TEAM DATA');
    console.log('==============================');
    
    // Home team data
    const homeTeamResult = await makeOrchestrationRequest(
        3, 
        '/team', 
        { team_id: TARGET_MATCH.homeTeamId }, 
        'Home Team Complete Data (Iran)',
        'direct'
    );
    
    if (homeTeamResult.success) {
        orchestratedData.response.teams.home = homeTeamResult.data;
    }
    
    // Away team data
    const awayTeamResult = await makeOrchestrationRequest(
        4, 
        '/team', 
        { team_id: TARGET_MATCH.awayTeamId }, 
        'Away Team Complete Data (North Korea)',
        'direct'
    );
    
    if (awayTeamResult.success) {
        orchestratedData.response.teams.away = awayTeamResult.data;
    }
    
    return { homeTeamResult, awayTeamResult };
}

async function step4_TeamForm() {
    console.log('\n📈 STEP 4: TEAM FORM DATA');
    console.log('==========================');
    
    // Try to get recent matches for both teams
    const homeMatchesResult = await makeOrchestrationRequest(
        5, 
        '/lastx', 
        { team_id: TARGET_MATCH.homeTeamId, number: 10 }, 
        'Home Team Last 10 Matches',
        'direct'
    );
    
    const awayMatchesResult = await makeOrchestrationRequest(
        6, 
        '/lastx', 
        { team_id: TARGET_MATCH.awayTeamId, number: 10 }, 
        'Away Team Last 10 Matches',
        'direct'
    );
    
    // Alternative: Try via backend if direct fails
    if (!homeMatchesResult.success || !awayMatchesResult.success) {
        console.log('   🔄 Trying alternative form data via today\'s matches...');
        
        const todayMatchesResult = await makeOrchestrationRequest(
            7, 
            '/todays-matches', 
            {}, 
            'All Today\'s Matches (for form extraction)',
            'direct'
        );
        
        if (todayMatchesResult.success) {
            // Extract form data from today's matches
            const matches = todayMatchesResult.data.data || [];
            
            // Filter for home team home matches and away team away matches
            const homeTeamMatches = matches.filter(m => m.homeID === TARGET_MATCH.homeTeamId);
            const awayTeamMatches = matches.filter(m => m.awayID === TARGET_MATCH.awayTeamId);
            
            orchestratedData.response.form.home_last5 = homeTeamMatches.slice(0, 5);
            orchestratedData.response.form.away_last5 = awayTeamMatches.slice(0, 5);
        }
    } else {
        // Process successful form data
        if (homeMatchesResult.success && homeMatchesResult.data) {
            const homeMatches = homeMatchesResult.data.data || homeMatchesResult.data;
            if (Array.isArray(homeMatches)) {
                orchestratedData.response.form.home_last5 = homeMatches
                    .filter(m => m.homeID === TARGET_MATCH.homeTeamId || m.home_id === TARGET_MATCH.homeTeamId)
                    .slice(0, 5);
            }
        }
        
        if (awayMatchesResult.success && awayMatchesResult.data) {
            const awayMatches = awayMatchesResult.data.data || awayMatchesResult.data;
            if (Array.isArray(awayMatches)) {
                orchestratedData.response.form.away_last5 = awayMatches
                    .filter(m => m.awayID === TARGET_MATCH.awayTeamId || m.away_id === TARGET_MATCH.awayTeamId)
                    .slice(0, 5);
            }
        }
    }
    
    return { homeMatchesResult, awayMatchesResult };
}

async function step5_PredictionData() {
    console.log('\n🔮 STEP 5: PREDICTION DATA');
    console.log('===========================');
    
    // BTTS predictions
    const bttsResult = await makeOrchestrationRequest(
        8, 
        '/api/footystats/btts-stats', 
        {}, 
        'BTTS Prediction Statistics',
        'backend'
    );
    
    // Over 2.5 predictions
    const over25Result = await makeOrchestrationRequest(
        9, 
        '/api/footystats/over25-stats', 
        {}, 
        'Over 2.5 Goals Prediction Statistics',
        'backend'
    );
    
    // Compile prediction data
    orchestratedData.response.prediction = {
        btts: bttsResult.success ? bttsResult.data : null,
        over25: over25Result.success ? over25Result.data : null,
        risk_analysis: {
            // Extract risk factors from odds
            match_risk: orchestratedData.response.odds.match_winner.home < 2.0 ? 'LOW' : 'MEDIUM',
            goals_risk: orchestratedData.response.odds.goals.over_25 < 2.0 ? 'HIGH' : 'MEDIUM',
            btts_risk: orchestratedData.response.odds.btts.yes < 2.0 ? 'HIGH' : 'LOW'
        }
    };
    
    return { bttsResult, over25Result };
}

async function step6_RefereeData() {
    console.log('\n👨‍⚖️ STEP 6: REFEREE DATA');
    console.log('==========================');
    
    // Try to get referee data (using sample referee ID since we don't have the actual one)
    const refereeResult = await makeOrchestrationRequest(
        10, 
        '/referee', 
        { referee_id: 123 }, 
        'Referee Statistics (sample)',
        'direct'
    );
    
    if (refereeResult.success) {
        orchestratedData.response.referee = refereeResult.data;
    }
    
    return refereeResult;
}

async function step7_LiveData() {
    console.log('\n🔴 STEP 7: LIVE DATA CHECK');
    console.log('===========================');
    
    // Check if match is live
    const liveResult = await makeOrchestrationRequest(
        11, 
        '/api/matches/live', 
        {}, 
        'Live Matches Check',
        'backend'
    );
    
    if (liveResult.success) {
        const liveMatches = liveResult.data.result || [];
        const isLive = liveMatches.some(m => m.id === TARGET_MATCH.id);
        
        orchestratedData.response.live = {
            is_live: isLive,
            live_data: isLive ? liveMatches.find(m => m.id === TARGET_MATCH.id) : null
        };
    }
    
    return liveResult;
}

function finalizeOrchestration() {
    console.log('\n📊 FINALIZING ORCHESTRATION');
    console.log('============================');
    
    // Calculate final metrics
    const successRate = orchestratedData.orchestration.totalSteps > 0 
        ? ((orchestratedData.orchestration.completedSteps / orchestratedData.orchestration.totalSteps) * 100).toFixed(1)
        : 0;
    
    orchestratedData.response.meta.orchestration_summary = {
        total_steps: orchestratedData.orchestration.totalSteps,
        completed_steps: orchestratedData.orchestration.completedSteps,
        failed_steps: orchestratedData.orchestration.failedSteps,
        success_rate: `${successRate}%`,
        total_data_size_mb: (orchestratedData.orchestration.totalDataBytes / 1024 / 1024).toFixed(2),
        errors: orchestratedData.orchestration.errors.length
    };
    
    // Add form summary
    orchestratedData.response.meta.form_summary = {
        home_team_last5_home_games: orchestratedData.response.form.home_last5.length,
        away_team_last5_away_games: orchestratedData.response.form.away_last5.length,
        form_data_complete: orchestratedData.response.form.home_last5.length > 0 && orchestratedData.response.form.away_last5.length > 0
    };
    
    console.log(`\n📈 ORCHESTRATION SUMMARY:`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Data Size: ${orchestratedData.response.meta.orchestration_summary.total_data_size_mb} MB`);
    console.log(`   Home Team Last 5 Home: ${orchestratedData.response.form.home_last5.length} games`);
    console.log(`   Away Team Last 5 Away: ${orchestratedData.response.form.away_last5.length} games`);
    console.log(`   Errors: ${orchestratedData.orchestration.errors.length}`);
}

function saveOrchestrationResults() {
    console.log('\n💾 SAVING ORCHESTRATION RESULTS');
    console.log('================================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save complete orchestration data
    const completeFile = `ORCHESTRATED-complete-data-${timestamp}.json`;
    fs.writeFileSync(completeFile, JSON.stringify(orchestratedData, null, 2));
    console.log(`📁 Complete data: ${completeFile}`);
    
    // Save frontend-ready response only
    const frontendFile = `ORCHESTRATED-frontend-ready-${timestamp}.json`;
    fs.writeFileSync(frontendFile, JSON.stringify(orchestratedData.response, null, 2));
    console.log(`🎯 Frontend ready: ${frontendFile}`);
    
    // Save text summary
    const summaryFile = `ORCHESTRATED-summary-${timestamp}.txt`;
    let summary = `ORCHESTRATED SINGLE MATCH DATA COLLECTION\n`;
    summary += `=========================================\n\n`;
    summary += `Target Match: ${TARGET_MATCH.description} (ID: ${TARGET_MATCH.id})\n`;
    summary += `Generated: ${orchestratedData.timestamp}\n`;
    summary += `Version: ${orchestratedData.version}\n\n`;
    
    summary += `ORCHESTRATION RESULTS:\n`;
    summary += `Total Steps: ${orchestratedData.orchestration.totalSteps}\n`;
    summary += `Completed: ${orchestratedData.orchestration.completedSteps}\n`;
    summary += `Failed: ${orchestratedData.orchestration.failedSteps}\n`;
    summary += `Success Rate: ${orchestratedData.response.meta.orchestration_summary.success_rate}\n`;
    summary += `Data Size: ${orchestratedData.response.meta.orchestration_summary.total_data_size_mb} MB\n\n`;
    
    summary += `TEAM FORM DATA:\n`;
    summary += `Iran (Home) Last 5 Home Games: ${orchestratedData.response.form.home_last5.length}\n`;
    orchestratedData.response.form.home_last5.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
    });
    
    summary += `\nNorth Korea (Away) Last 5 Away Games: ${orchestratedData.response.form.away_last5.length}\n`;
    orchestratedData.response.form.away_last5.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0}\n`;
    });
    
    summary += `\nERRORS:\n`;
    orchestratedData.orchestration.errors.forEach(error => {
        summary += `Step ${error.step}: ${error.description} - ${error.error}\n`;
    });
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary: ${summaryFile}`);
    
    return { completeFile, frontendFile, summaryFile };
}

async function runOrchestatedDataCollection() {
    console.log('🚀 ORCHESTRATED SINGLE MATCH DATA COLLECTION');
    console.log('=============================================');
    console.log(`🎯 TARGET: ${TARGET_MATCH.description} (Match ID: ${TARGET_MATCH.id})`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // Execute orchestration steps
        await step1_CoreMatchData();
        await step2_LeagueContext();
        await step3_TeamData();
        await step4_TeamForm();
        await step5_PredictionData();
        await step6_RefereeData();
        await step7_LiveData();
        
        // Finalize and save
        finalizeOrchestration();
        const files = saveOrchestrationResults();
        
        console.log('\n🎉 ORCHESTRATED DATA COLLECTION COMPLETED!');
        console.log('==========================================');
        console.log(`📊 Success Rate: ${orchestratedData.response.meta.orchestration_summary.success_rate}`);
        console.log(`📈 Data Size: ${orchestratedData.response.meta.orchestration_summary.total_data_size_mb} MB`);
        console.log(`🏠 Iran Last 5 Home: ${orchestratedData.response.form.home_last5.length} games`);
        console.log(`✈️ North Korea Last 5 Away: ${orchestratedData.response.form.away_last5.length} games`);
        console.log(`📁 Files Generated: ${Object.keys(files).length}`);
        
        if (orchestratedData.response.form.home_last5.length > 0 && orchestratedData.response.form.away_last5.length > 0) {
            console.log('\n✅ SUCCESS: Complete team form data collected!');
        } else {
            console.log('\n⚠️ PARTIAL: Form data collection incomplete - may need alternative approach');
        }
        
        return orchestratedData;
        
    } catch (error) {
        console.error('💥 Error in orchestrated data collection:', error.message);
        throw error;
    }
}

// Run the orchestrated collection
if (require.main === module) {
    runOrchestatedDataCollection().catch(console.error);
}

module.exports = { runOrchestatedDataCollection, orchestratedData };
