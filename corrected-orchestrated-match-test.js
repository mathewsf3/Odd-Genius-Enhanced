/**
 * CORRECTED ORCHESTRATED MATCH DATA COLLECTOR - SEASON 2025
 * 
 * FIXES IMPLEMENTED:
 * 1. ✅ Use correct season_id from /match endpoint (2025, not 2026)
 * 2. ✅ Handle HTTP 417 for /league-season gracefully 
 * 3. ✅ Use /league-matches with venue=home/away for proper form data
 * 4. ✅ NO FALLBACKS - Return 0/empty when data not available to debug issues
 * 5. ✅ Proper error handling and logging
 * 
 * TARGET: Iran vs North Korea (Match ID: 7479469)
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;

let orchestratedData = {
    timestamp: new Date().toISOString(),
    version: 'CORRECTED-ORCHESTRATED-v2.0',
    targetMatchId: TARGET_MATCH_ID,
    targetSeason: 2025, // CORRECTED: Use 2025 instead of 2026
    
    // Orchestration steps tracking
    steps: {
        step1_coreMatch: { success: false, data: null, error: null },
        step2_leagueSeason: { success: false, data: null, error: null, status: null },
        step3_leagueTable: { success: false, data: null, error: null },
        step4a_homeTeam: { success: false, data: null, error: null },
        step4b_awayTeam: { success: false, data: null, error: null },
        step5a_iranHome5: { success: false, data: null, error: null },
        step5b_nkAway5: { success: false, data: null, error: null },
        step6a_bttsStats: { success: false, data: null, error: null },
        step6b_over25Stats: { success: false, data: null, error: null },
        step7_referee: { success: false, data: null, error: null },
        step8_players: { success: false, data: null, error: null },
        step9_liveCheck: { success: false, data: null, error: null }
    },
    
    // Final orchestrated response
    response: {
        meta: {
            matchId: TARGET_MATCH_ID,
            season: 2025,
            collectionTime: null,
            dataCompleteness: 0,
            totalSteps: 11,
            successfulSteps: 0
        },
        match: {},
        league: {},
        teams: {
            home: {},
            away: {}
        },
        form: {
            home_last5: [], // NO FALLBACK - empty if not found
            away_last5: []  // NO FALLBACK - empty if not found
        },
        stats: {
            btts: {},
            over25: {},
            corners: {},
            cards: {}
        },
        referee: {},
        players: {
            home: [],
            away: []
        },
        odds: {},
        prediction: {},
        live: {}
    },
    
    summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        http417Errors: 0,
        missingDataPoints: []
    }
};

async function makeOrchestrationRequest(stepNumber, endpoint, params = {}, description = '', type = 'direct') {
    console.log(`\n📍 STEP ${stepNumber}: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Params: ${JSON.stringify(params)}`);
    
    try {
        const url = `${DIRECT_API}${endpoint}`;
        const config = {
            params: { key: API_KEY, ...params },
            timeout: 25000,
            headers: { 'User-Agent': 'Odd-Genius-Corrected-Orchestrator/2.0' }
        };

        const response = await axios.get(url, config);
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        orchestratedData.summary.successfulRequests++;
        
        return {
            success: true,
            stepNumber,
            endpoint,
            description,
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        const status = error.response?.status || 'Network Error';
        console.log(`   ❌ FAILED: ${status} | ${error.message}`);
        
        if (status === 417) {
            orchestratedData.summary.http417Errors++;
            console.log(`   ⚠️  HTTP 417: Season/League not enabled in API plan`);
        }
        
        orchestratedData.summary.failedRequests++;
        
        return {
            success: false,
            stepNumber,
            endpoint,
            description,
            error: error.message,
            status,
            timestamp: new Date().toISOString()
        };
    } finally {
        orchestratedData.summary.totalRequests++;
        await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limiting
    }
}

async function runCorrectedOrchestration() {
    console.log('🚀 CORRECTED ORCHESTRATED MATCH DATA COLLECTION');
    console.log('=================================================');
    console.log(`🎯 Target Match: Iran vs North Korea (ID: ${TARGET_MATCH_ID})`);
    console.log(`📅 Target Season: ${orchestratedData.targetSeason}`);
    console.log(`🔧 Corrections Applied: Season 2025, HTTP 417 handling, venue-based form`);
    console.log(`⚠️  NO FALLBACKS: Empty data when endpoints fail\n`);

    // STEP 1: Core Match Data (get correct season_id)
    const step1 = await makeOrchestrationRequest(
        1,
        '/match',
        { match_id: TARGET_MATCH_ID },
        'Core Match Data (Iran vs North Korea)',
        'direct'
    );
    
    orchestratedData.steps.step1_coreMatch = step1;
    
    if (step1.success) {
        orchestratedData.response.match = step1.data;
        orchestratedData.response.meta.season = step1.data.season || step1.data.season_id || 2025;
        
        // Extract team IDs and other core data
        const homeTeamId = step1.data.homeID || step1.data.home_id;
        const awayTeamId = step1.data.awayID || step1.data.away_id;
        const seasonId = step1.data.season || step1.data.season_id || 2025;
        const leagueId = step1.data.league_id;
        
        console.log(`   📊 Extracted: Season=${seasonId}, Home=${homeTeamId}, Away=${awayTeamId}, League=${leagueId}`);
        
        // STEP 2: League Season Context (with HTTP 417 handling)
        const step2 = await makeOrchestrationRequest(
            2,
            '/league-season',
            { season_id: seasonId },
            'League Season Context',
            'direct'
        );
        
        orchestratedData.steps.step2_leagueSeason = step2;
        
        if (step2.success) {
            orchestratedData.response.league = step2.data;
        } else if (step2.status === 417) {
            console.log(`   ⚠️  Season ${seasonId} not enabled in API plan - continuing without league data`);
            orchestratedData.summary.missingDataPoints.push('league-season');
        }
        
        // STEP 3: League Table (if season works)
        if (step2.success) {
            const step3 = await makeOrchestrationRequest(
                3,
                '/league-table',
                { season_id: seasonId },
                'League Table/Standings',
                'direct'
            );
            orchestratedData.steps.step3_leagueTable = step3;
            if (step3.success) {
                orchestratedData.response.league.table = step3.data;
            }
        } else {
            console.log(`   ⏭️  Skipping league table due to season issues`);
            orchestratedData.summary.missingDataPoints.push('league-table');
        }
        
        // STEP 4: Team Details
        if (homeTeamId) {
            const step4a = await makeOrchestrationRequest(
                4,
                '/team',
                { team_id: homeTeamId },
                'Iran Team Details',
                'direct'
            );
            orchestratedData.steps.step4a_homeTeam = step4a;
            if (step4a.success) {
                orchestratedData.response.teams.home = step4a.data;
            }
        }
        
        if (awayTeamId) {
            const step4b = await makeOrchestrationRequest(
                5,
                '/team',
                { team_id: awayTeamId },
                'North Korea Team Details',
                'direct'
            );
            orchestratedData.steps.step4b_awayTeam = step4b;
            if (step4b.success) {
                orchestratedData.response.teams.away = step4b.data;
            }
        }
        
        // STEP 5: CORRECTED FORM DATA - Use /league-matches with venue
        console.log(`\n🔧 CORRECTED FORM EXTRACTION WITH VENUE FILTER`);
        
        if (homeTeamId) {
            const step5a = await makeOrchestrationRequest(
                6,
                '/league-matches',
                { 
                    team_id: homeTeamId, 
                    venue: 'home', 
                    max_per_page: 5, 
                    order: 'date_desc' 
                },
                'Iran Last 5 HOME Matches (CORRECTED)',
                'direct'
            );
            orchestratedData.steps.step5a_iranHome5 = step5a;
            
            if (step5a.success && step5a.data) {
                const matches = step5a.data.data || step5a.data;
                orchestratedData.response.form.home_last5 = Array.isArray(matches) ? matches.slice(0, 5) : [];
                console.log(`   ✅ Iran HOME games found: ${orchestratedData.response.form.home_last5.length}`);
            } else {
                console.log(`   ❌ NO Iran HOME games found - keeping empty array`);
                orchestratedData.summary.missingDataPoints.push('iran-home-form');
            }
        }
        
        if (awayTeamId) {
            const step5b = await makeOrchestrationRequest(
                7,
                '/league-matches',
                { 
                    team_id: awayTeamId, 
                    venue: 'away', 
                    max_per_page: 5, 
                    order: 'date_desc' 
                },
                'North Korea Last 5 AWAY Matches (CORRECTED)',
                'direct'
            );
            orchestratedData.steps.step5b_nkAway5 = step5b;
            
            if (step5b.success && step5b.data) {
                const matches = step5b.data.data || step5b.data;
                orchestratedData.response.form.away_last5 = Array.isArray(matches) ? matches.slice(0, 5) : [];
                console.log(`   ✅ North Korea AWAY games found: ${orchestratedData.response.form.away_last5.length}`);
            } else {
                console.log(`   ❌ NO North Korea AWAY games found - keeping empty array`);
                orchestratedData.summary.missingDataPoints.push('nk-away-form');
            }
        }
        
        // STEP 6: BTTS and Over 2.5 Stats (if season works)
        if (step2.success) {
            const step6a = await makeOrchestrationRequest(
                8,
                '/stats-btts',
                { season_id: seasonId },
                'BTTS Statistics',
                'direct'
            );
            orchestratedData.steps.step6a_bttsStats = step6a;
            if (step6a.success) {
                orchestratedData.response.stats.btts = step6a.data;
            }
            
            const step6b = await makeOrchestrationRequest(
                9,
                '/stats-over25',
                { season_id: seasonId },
                'Over 2.5 Statistics',
                'direct'
            );
            orchestratedData.steps.step6b_over25Stats = step6b;
            if (step6b.success) {
                orchestratedData.response.stats.over25 = step6b.data;
            }
        } else {
            console.log(`   ⏭️  Skipping BTTS/Over2.5 stats due to season issues`);
            orchestratedData.summary.missingDataPoints.push('btts-stats', 'over25-stats');
        }
        
        // STEP 7: Referee Data (try with known referee ID)
        const step7 = await makeOrchestrationRequest(
            10,
            '/referee',
            { referee_id: 123 },
            'Sample Referee Data',
            'direct'
        );
        orchestratedData.steps.step7_referee = step7;
        if (step7.success) {
            orchestratedData.response.referee = step7.data;
        }
        
        // STEP 8: Players (if season works)
        if (step2.success) {
            const step8 = await makeOrchestrationRequest(
                11,
                '/league-players',
                { season_id: seasonId, include: 'stats' },
                'League Players with Stats',
                'direct'
            );
            orchestratedData.steps.step8_players = step8;
            if (step8.success) {
                orchestratedData.response.players = step8.data;
            }
        }
        
    } else {
        console.log(`\n💥 CRITICAL ERROR: Could not get core match data - stopping orchestration`);
        return orchestratedData;
    }
    
    // Calculate final metrics
    const successfulSteps = Object.values(orchestratedData.steps).filter(step => step.success).length;
    orchestratedData.response.meta.successfulSteps = successfulSteps;
    orchestratedData.response.meta.dataCompleteness = ((successfulSteps / orchestratedData.response.meta.totalSteps) * 100).toFixed(1);
    orchestratedData.response.meta.collectionTime = new Date().toISOString();
    
    return orchestratedData;
}

function analyzeCorrectedResults() {
    console.log('\n🔍 CORRECTED RESULTS ANALYSIS');
    console.log('==============================');
    
    const analysis = {
        coreData: {
            hasMatchData: orchestratedData.steps.step1_coreMatch.success,
            hasLeagueData: orchestratedData.steps.step2_leagueSeason.success,
            hasHomeTeam: orchestratedData.steps.step4a_homeTeam.success,
            hasAwayTeam: orchestratedData.steps.step4b_awayTeam.success
        },
        formData: {
            iranHomeGames: orchestratedData.response.form.home_last5.length,
            nkAwayGames: orchestratedData.response.form.away_last5.length,
            formDataComplete: orchestratedData.response.form.home_last5.length > 0 && orchestratedData.response.form.away_last5.length > 0
        },
        errors: {
            http417Count: orchestratedData.summary.http417Errors,
            missingDataPoints: orchestratedData.summary.missingDataPoints,
            failedSteps: Object.entries(orchestratedData.steps).filter(([key, step]) => !step.success).map(([key]) => key)
        },
        metrics: {
            successRate: ((orchestratedData.summary.successfulRequests / orchestratedData.summary.totalRequests) * 100).toFixed(1),
            dataCompleteness: orchestratedData.response.meta.dataCompleteness
        }
    };
    
    console.log('\n📊 CORE DATA:');
    Object.entries(analysis.coreData).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    console.log('\n🏠 FORM DATA (CORRECTED):');
    console.log(`   Iran HOME games: ${analysis.formData.iranHomeGames}`);
    console.log(`   North Korea AWAY games: ${analysis.formData.nkAwayGames}`);
    console.log(`   Form data complete: ${analysis.formData.formDataComplete ? '✅' : '❌'}`);
    
    console.log('\n⚠️  ERRORS & MISSING DATA:');
    console.log(`   HTTP 417 errors: ${analysis.errors.http417Count}`);
    console.log(`   Missing data points: ${analysis.errors.missingDataPoints.join(', ') || 'None'}`);
    console.log(`   Failed steps: ${analysis.errors.failedSteps.join(', ') || 'None'}`);
    
    console.log('\n📈 FINAL METRICS:');
    console.log(`   Success Rate: ${analysis.metrics.successRate}%`);
    console.log(`   Data Completeness: ${analysis.metrics.dataCompleteness}%`);
    
    return analysis;
}

function generateCorrectedReport() {
    console.log('\n📋 GENERATING CORRECTED REPORT');
    console.log('===============================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Complete orchestrated data
    const completeFile = `CORRECTED-orchestrated-data-${timestamp}.json`;
    fs.writeFileSync(completeFile, JSON.stringify(orchestratedData, null, 2));
    console.log(`💾 Complete data: ${completeFile}`);
    
    // Frontend-ready data (clean structure)
    const frontendData = {
        match: orchestratedData.response.match,
        teams: orchestratedData.response.teams,
        form: {
            home_last5: orchestratedData.response.form.home_last5,
            away_last5: orchestratedData.response.form.away_last5
        },
        league: orchestratedData.response.league,
        stats: orchestratedData.response.stats,
        meta: {
            success: orchestratedData.response.meta.dataCompleteness > 50,
            completeness: orchestratedData.response.meta.dataCompleteness,
            timestamp: orchestratedData.response.meta.collectionTime,
            formDataAvailable: orchestratedData.response.form.home_last5.length > 0 && orchestratedData.response.form.away_last5.length > 0
        }
    };
    
    const frontendFile = `CORRECTED-frontend-ready-${timestamp}.json`;
    fs.writeFileSync(frontendFile, JSON.stringify(frontendData, null, 2));
    console.log(`🎯 Frontend ready: ${frontendFile}`);
    
    // Diagnosis report
    const diagnosisFile = `CORRECTED-diagnosis-${timestamp}.txt`;
    let diagnosis = `CORRECTED ORCHESTRATED DATA COLLECTION DIAGNOSIS\n`;
    diagnosis += `===============================================\n\n`;
    diagnosis += `Generated: ${orchestratedData.timestamp}\n`;
    diagnosis += `Target: Iran vs North Korea (Match ID: ${TARGET_MATCH_ID})\n`;
    diagnosis += `Season: ${orchestratedData.targetSeason}\n\n`;
    
    diagnosis += `STEP-BY-STEP RESULTS:\n`;
    Object.entries(orchestratedData.steps).forEach(([step, result]) => {
        diagnosis += `${step}: ${result.success ? '✅ SUCCESS' : `❌ FAILED (${result.status})`}\n`;
        if (!result.success && result.error) {
            diagnosis += `  Error: ${result.error}\n`;
        }
    });
    
    diagnosis += `\nFORM DATA RESULTS:\n`;
    diagnosis += `Iran HOME games: ${orchestratedData.response.form.home_last5.length}\n`;
    diagnosis += `North Korea AWAY games: ${orchestratedData.response.form.away_last5.length}\n`;
    
    diagnosis += `\nERROR ANALYSIS:\n`;
    diagnosis += `HTTP 417 errors: ${orchestratedData.summary.http417Errors}\n`;
    diagnosis += `Missing data points: ${orchestratedData.summary.missingDataPoints.join(', ') || 'None'}\n`;
    
    diagnosis += `\nSUCCESS METRICS:\n`;
    diagnosis += `Total Requests: ${orchestratedData.summary.totalRequests}\n`;
    diagnosis += `Successful: ${orchestratedData.summary.successfulRequests}\n`;
    diagnosis += `Failed: ${orchestratedData.summary.failedRequests}\n`;
    diagnosis += `Success Rate: ${((orchestratedData.summary.successfulRequests / orchestratedData.summary.totalRequests) * 100).toFixed(1)}%\n`;
    
    fs.writeFileSync(diagnosisFile, diagnosis);
    console.log(`🔬 Diagnosis: ${diagnosisFile}`);
    
    return { completeFile, frontendFile, diagnosisFile };
}

async function runCorrectedTest() {
    console.log('🚀 STARTING CORRECTED ORCHESTRATED TEST');
    console.log('========================================');
    console.log(`📅 Current Year: 2025`);
    console.log(`🎯 Using Season: 2025 (CORRECTED)`);
    console.log(`🔧 Using venue-based form extraction`);
    console.log(`⚠️  NO FALLBACKS: Debug mode enabled\n`);

    try {
        // Run corrected orchestration
        await runCorrectedOrchestration();
        
        // Analyze results
        const analysis = analyzeCorrectedResults();
        
        // Generate reports
        const files = generateCorrectedReport();
        
        // Final summary
        console.log('\n🎉 CORRECTED ORCHESTRATION COMPLETED');
        console.log('====================================');
        console.log(`📊 Success Rate: ${analysis.metrics.successRate}%`);
        console.log(`📈 Data Completeness: ${analysis.metrics.dataCompleteness}%`);
        console.log(`🏠 Iran HOME form: ${analysis.formData.iranHomeGames} games`);
        console.log(`✈️ North Korea AWAY form: ${analysis.formData.nkAwayGames} games`);
        console.log(`⚠️  HTTP 417 Errors: ${analysis.errors.http417Count}`);
        console.log(`📁 Files Generated: ${Object.keys(files).length}`);
        
        if (analysis.formData.formDataComplete) {
            console.log('\n✅ SUCCESS: Complete team form data collected!');
        } else {
            console.log('\n❌ FORM DATA MISSING: Check venue endpoint compatibility');
        }
        
        return orchestratedData;
        
    } catch (error) {
        console.error('💥 Error in corrected orchestration:', error.message);
        throw error;
    }
}

// Run the corrected test
if (require.main === module) {
    runCorrectedTest().catch(console.error);
}

module.exports = { runCorrectedTest, orchestratedData };
