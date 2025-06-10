/**
 * FINAL CORRECTED ORCHESTRATED MATCH DATA COLLECTOR
 * 
 * FINAL FIXES:
 * 1. ✅ Extract team IDs from correct path: step1.data.data.homeID/awayID  
 * 2. ✅ Use actual season from match: step1.data.data.season (2026)
 * 3. ✅ Handle HTTP 417 gracefully but continue with team endpoints
 * 4. ✅ Test /league-matches with correct team IDs
 * 5. ✅ NO FALLBACKS - Show exactly what works and what doesn't
 * 
 * TARGET: Iran (8607) vs North Korea (8597) - Season 2026
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const TARGET_MATCH_ID = 7479469;

let finalData = {
    timestamp: new Date().toISOString(),
    version: 'FINAL-CORRECTED-v3.0',
    targetMatchId: TARGET_MATCH_ID,
    
    // Extracted from match data
    extractedData: {
        homeTeamId: null,
        awayTeamId: null,
        actualSeason: null,
        leagueId: null,
        roundId: null
    },
    
    // Test results
    tests: {
        coreMatch: { success: false, data: null },
        homeTeamData: { success: false, data: null },
        awayTeamData: { success: false, data: null },
        iranHomeMatches: { success: false, data: null, count: 0 },
        nkAwayMatches: { success: false, data: null, count: 0 },
        leagueSeason: { success: false, data: null, status: null },
        bttsStats: { success: false, data: null },
        over25Stats: { success: false, data: null }
    },
    
    // Final form data
    finalResults: {
        iranLast5Home: [],
        nkLast5Away: [],
        formDataComplete: false,
        availableEndpoints: [],
        failedEndpoints: []
    },
    
    summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0
    }
};

async function makeFinalRequest(endpoint, params = {}, description = '') {
    console.log(`\n🔄 TESTING: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Params: ${JSON.stringify(params)}`);
    
    try {
        const url = `${DIRECT_API}${endpoint}`;
        const response = await axios.get(url, {
            params: { key: API_KEY, ...params },
            timeout: 25000,
            headers: { 'User-Agent': 'Odd-Genius-Final-Test/3.0' }
        });
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        finalData.summary.successfulRequests++;
        finalData.finalResults.availableEndpoints.push(endpoint);
        
        return {
            success: true,
            endpoint,
            description,
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        const status = error.response?.status || 'Network Error';
        console.log(`   ❌ FAILED: ${status} | ${error.message}`);
        finalData.summary.failedRequests++;
        finalData.finalResults.failedEndpoints.push(`${endpoint} (${status})`);
        
        return {
            success: false,
            endpoint,
            description,
            error: error.message,
            status,
            timestamp: new Date().toISOString()
        };
    } finally {
        finalData.summary.totalRequests++;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

async function runFinalCorrectedTest() {
    console.log('🚀 FINAL CORRECTED ORCHESTRATED TEST');
    console.log('====================================');
    console.log(`🎯 Target: Iran vs North Korea (Match ID: ${TARGET_MATCH_ID})`);
    console.log(`🔧 FINAL FIXES: Correct data extraction, proper season, team IDs`);
    console.log(`⚠️  NO FALLBACKS: Debug what actually works\n`);

    // STEP 1: Get core match data and extract correct IDs
    console.log('📍 STEP 1: CORE MATCH DATA EXTRACTION');
    const coreResult = await makeFinalRequest('/match', { match_id: TARGET_MATCH_ID }, 'Core Match Data');
    finalData.tests.coreMatch = coreResult;
    
    if (!coreResult.success) {
        console.log('💥 CRITICAL: Cannot get core match data - stopping');
        return finalData;
    }
    
    // CORRECTED: Extract from data.data path
    const matchData = coreResult.data.data;
    finalData.extractedData.homeTeamId = matchData.homeID;
    finalData.extractedData.awayTeamId = matchData.awayID;
    finalData.extractedData.actualSeason = matchData.season;
    finalData.extractedData.leagueId = matchData.league_id;
    finalData.extractedData.roundId = matchData.roundID;
    
    console.log(`\n✅ EXTRACTED DATA:`);
    console.log(`   Iran Team ID: ${finalData.extractedData.homeTeamId}`);
    console.log(`   North Korea Team ID: ${finalData.extractedData.awayTeamId}`);
    console.log(`   Actual Season: ${finalData.extractedData.actualSeason}`);
    console.log(`   League ID: ${finalData.extractedData.leagueId}`);
    console.log(`   Round ID: ${finalData.extractedData.roundId}`);
    
    // STEP 2: Test team data endpoints
    console.log('\n📍 STEP 2: TEAM DATA ENDPOINTS');
    
    if (finalData.extractedData.homeTeamId) {
        const homeResult = await makeFinalRequest('/team', { team_id: finalData.extractedData.homeTeamId }, 'Iran Team Data');
        finalData.tests.homeTeamData = homeResult;
    }
    
    if (finalData.extractedData.awayTeamId) {
        const awayResult = await makeFinalRequest('/team', { team_id: finalData.extractedData.awayTeamId }, 'North Korea Team Data');
        finalData.tests.awayTeamData = awayResult;
    }
    
    // STEP 3: Test form data with /league-matches + venue
    console.log('\n📍 STEP 3: FORM DATA WITH VENUE FILTER');
    
    if (finalData.extractedData.homeTeamId) {
        const iranHomeResult = await makeFinalRequest('/league-matches', {
            team_id: finalData.extractedData.homeTeamId,
            venue: 'home',
            max_per_page: 5,
            order: 'date_desc'
        }, 'Iran Last 5 HOME Matches');
        
        finalData.tests.iranHomeMatches = iranHomeResult;
        
        if (iranHomeResult.success && iranHomeResult.data) {
            const matches = iranHomeResult.data.data || iranHomeResult.data;
            if (Array.isArray(matches)) {
                finalData.finalResults.iranLast5Home = matches.slice(0, 5);
                finalData.tests.iranHomeMatches.count = finalData.finalResults.iranLast5Home.length;
                console.log(`   ✅ Iran HOME games found: ${finalData.finalResults.iranLast5Home.length}`);
            }
        }
    }
    
    if (finalData.extractedData.awayTeamId) {
        const nkAwayResult = await makeFinalRequest('/league-matches', {
            team_id: finalData.extractedData.awayTeamId,
            venue: 'away',
            max_per_page: 5,
            order: 'date_desc'
        }, 'North Korea Last 5 AWAY Matches');
        
        finalData.tests.nkAwayMatches = nkAwayResult;
        
        if (nkAwayResult.success && nkAwayResult.data) {
            const matches = nkAwayResult.data.data || nkAwayResult.data;
            if (Array.isArray(matches)) {
                finalData.finalResults.nkLast5Away = matches.slice(0, 5);
                finalData.tests.nkAwayMatches.count = finalData.finalResults.nkLast5Away.length;
                console.log(`   ✅ North Korea AWAY games found: ${finalData.finalResults.nkLast5Away.length}`);
            }
        }
    }
    
    // STEP 4: Test league/season endpoints with actual season
    console.log('\n📍 STEP 4: LEAGUE/SEASON ENDPOINTS');
    
    if (finalData.extractedData.actualSeason) {
        const leagueResult = await makeFinalRequest('/league-season', { season_id: finalData.extractedData.actualSeason }, `League Season ${finalData.extractedData.actualSeason}`);
        finalData.tests.leagueSeason = leagueResult;
        
        if (leagueResult.success) {
            // Try BTTS and Over 2.5 stats with actual season
            const bttsResult = await makeFinalRequest('/stats-btts', { season_id: finalData.extractedData.actualSeason }, 'BTTS Statistics');
            finalData.tests.bttsStats = bttsResult;
            
            const over25Result = await makeFinalRequest('/stats-over25', { season_id: finalData.extractedData.actualSeason }, 'Over 2.5 Statistics');
            finalData.tests.over25Stats = over25Result;
        }
    }
    
    // Calculate final results
    finalData.finalResults.formDataComplete = finalData.finalResults.iranLast5Home.length > 0 && finalData.finalResults.nkLast5Away.length > 0;
    
    return finalData;
}

function analyzeFinalResults() {
    console.log('\n🔍 FINAL RESULTS ANALYSIS');
    console.log('==========================');
    
    const analysis = {
        dataExtraction: {
            coreMatchSuccess: finalData.tests.coreMatch.success,
            teamIdsExtracted: !!(finalData.extractedData.homeTeamId && finalData.extractedData.awayTeamId),
            seasonExtracted: !!finalData.extractedData.actualSeason
        },
        teamEndpoints: {
            iranTeamData: finalData.tests.homeTeamData.success,
            nkTeamData: finalData.tests.awayTeamData.success
        },
        formData: {
            iranHomeGames: finalData.finalResults.iranLast5Home.length,
            nkAwayGames: finalData.finalResults.nkLast5Away.length,
            formComplete: finalData.finalResults.formDataComplete,
            venueEndpointWorks: finalData.tests.iranHomeMatches.success || finalData.tests.nkAwayMatches.success
        },
        leagueData: {
            seasonEndpointWorks: finalData.tests.leagueSeason.success,
            bttsWorks: finalData.tests.bttsStats.success,
            over25Works: finalData.tests.over25Stats.success
        },
        endpoints: {
            available: finalData.finalResults.availableEndpoints,
            failed: finalData.finalResults.failedEndpoints,
            successRate: ((finalData.summary.successfulRequests / finalData.summary.totalRequests) * 100).toFixed(1)
        }
    };
    
    console.log('\n📊 DATA EXTRACTION:');
    Object.entries(analysis.dataExtraction).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    console.log('\n👥 TEAM ENDPOINTS:');
    Object.entries(analysis.teamEndpoints).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    console.log('\n🏠 FORM DATA:');
    console.log(`   Iran HOME games: ${analysis.formData.iranHomeGames}`);
    console.log(`   North Korea AWAY games: ${analysis.formData.nkAwayGames}`);
    console.log(`   Form data complete: ${analysis.formData.formComplete ? '✅' : '❌'}`);
    console.log(`   Venue endpoint works: ${analysis.formData.venueEndpointWorks ? '✅' : '❌'}`);
    
    console.log('\n🏆 LEAGUE DATA:');
    Object.entries(analysis.leagueData).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    console.log('\n🌐 ENDPOINT STATUS:');
    console.log(`   Available endpoints: ${analysis.endpoints.available.join(', ')}`);
    console.log(`   Failed endpoints: ${analysis.endpoints.failed.join(', ')}`);
    console.log(`   Success Rate: ${analysis.endpoints.successRate}%`);
    
    return analysis;
}

function generateFinalReport() {
    console.log('\n📋 GENERATING FINAL REPORT');
    console.log('===========================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Complete final data
    const completeFile = `FINAL-CORRECTED-complete-${timestamp}.json`;
    fs.writeFileSync(completeFile, JSON.stringify(finalData, null, 2));
    console.log(`💾 Complete data: ${completeFile}`);
    
    // Production-ready data structure
    const productionData = {
        match: {
            id: TARGET_MATCH_ID,
            homeTeamId: finalData.extractedData.homeTeamId,
            awayTeamId: finalData.extractedData.awayTeamId,
            season: finalData.extractedData.actualSeason,
            details: finalData.tests.coreMatch.data
        },
        teams: {
            home: finalData.tests.homeTeamData.data,
            away: finalData.tests.awayTeamData.data
        },
        form: {
            iranLast5Home: finalData.finalResults.iranLast5Home,
            nkLast5Away: finalData.finalResults.nkLast5Away,
            complete: finalData.finalResults.formDataComplete
        },
        endpoints: {
            working: finalData.finalResults.availableEndpoints,
            failing: finalData.finalResults.failedEndpoints
        },
        meta: {
            timestamp: finalData.timestamp,
            successRate: ((finalData.summary.successfulRequests / finalData.summary.totalRequests) * 100).toFixed(1),
            formDataAvailable: finalData.finalResults.formDataComplete
        }
    };
    
    const productionFile = `FINAL-CORRECTED-production-${timestamp}.json`;
    fs.writeFileSync(productionFile, JSON.stringify(productionData, null, 2));
    console.log(`🎯 Production ready: ${productionFile}`);
    
    // Final diagnosis
    const diagnosisFile = `FINAL-CORRECTED-diagnosis-${timestamp}.txt`;
    let diagnosis = `FINAL CORRECTED ORCHESTRATION DIAGNOSIS\n`;
    diagnosis += `======================================\n\n`;
    diagnosis += `Generated: ${finalData.timestamp}\n`;
    diagnosis += `Target: Iran vs North Korea (Match ID: ${TARGET_MATCH_ID})\n\n`;
    
    diagnosis += `EXTRACTED DATA:\n`;
    diagnosis += `Iran Team ID: ${finalData.extractedData.homeTeamId}\n`;
    diagnosis += `North Korea Team ID: ${finalData.extractedData.awayTeamId}\n`;
    diagnosis += `Actual Season: ${finalData.extractedData.actualSeason}\n`;
    diagnosis += `League ID: ${finalData.extractedData.leagueId}\n`;
    diagnosis += `Round ID: ${finalData.extractedData.roundId}\n\n`;
    
    diagnosis += `FORM DATA RESULTS:\n`;
    diagnosis += `Iran HOME games: ${finalData.finalResults.iranLast5Home.length}\n`;
    diagnosis += `North Korea AWAY games: ${finalData.finalResults.nkLast5Away.length}\n`;
    diagnosis += `Form data complete: ${finalData.finalResults.formDataComplete}\n\n`;
    
    diagnosis += `ENDPOINT RESULTS:\n`;
    Object.entries(finalData.tests).forEach(([test, result]) => {
        diagnosis += `${test}: ${result.success ? '✅ SUCCESS' : `❌ FAILED (${result.status})`}\n`;
    });
    
    diagnosis += `\nWORKING ENDPOINTS:\n`;
    finalData.finalResults.availableEndpoints.forEach(endpoint => {
        diagnosis += `✅ ${endpoint}\n`;
    });
    
    diagnosis += `\nFAILED ENDPOINTS:\n`;
    finalData.finalResults.failedEndpoints.forEach(endpoint => {
        diagnosis += `❌ ${endpoint}\n`;
    });
    
    diagnosis += `\nSUCCESS METRICS:\n`;
    diagnosis += `Total Requests: ${finalData.summary.totalRequests}\n`;
    diagnosis += `Successful: ${finalData.summary.successfulRequests}\n`;
    diagnosis += `Failed: ${finalData.summary.failedRequests}\n`;
    diagnosis += `Success Rate: ${((finalData.summary.successfulRequests / finalData.summary.totalRequests) * 100).toFixed(1)}%\n`;
    
    fs.writeFileSync(diagnosisFile, diagnosis);
    console.log(`🔬 Diagnosis: ${diagnosisFile}`);
    
    return { completeFile, productionFile, diagnosisFile };
}

async function runFinalTest() {
    console.log('🚀 STARTING FINAL CORRECTED TEST');
    console.log('=================================');
    console.log(`📅 Target Year: 2025`);
    console.log(`🔧 Will use actual season from match data`);
    console.log(`🎯 Will extract team IDs from correct data path`);
    console.log(`⚠️  NO FALLBACKS: Pure debugging mode\n`);

    try {
        // Run final corrected test
        await runFinalCorrectedTest();
        
        // Analyze results
        const analysis = analyzeFinalResults();
        
        // Generate reports
        const files = generateFinalReport();
        
        // Final summary
        console.log('\n🎉 FINAL CORRECTED TEST COMPLETED');
        console.log('==================================');
        console.log(`📊 Success Rate: ${analysis.endpoints.successRate}%`);
        console.log(`🏠 Iran HOME form: ${analysis.formData.iranHomeGames} games`);
        console.log(`✈️ North Korea AWAY form: ${analysis.formData.nkAwayGames} games`);
        console.log(`🔧 Venue endpoint works: ${analysis.formData.venueEndpointWorks ? 'YES' : 'NO'}`);
        console.log(`📁 Files Generated: ${Object.keys(files).length}`);
        
        if (analysis.formData.formComplete) {
            console.log('\n✅ FINAL SUCCESS: Complete team form data collected!');
            console.log('🎯 Ready for frontend integration!');
        } else {
            console.log('\n⚠️  FORM DATA INCOMPLETE:');
            if (!analysis.formData.venueEndpointWorks) {
                console.log('   - /league-matches with venue parameter not supported');
                console.log('   - Need alternative approach for team form data');
            }
        }
        
        return finalData;
        
    } catch (error) {
        console.error('💥 Error in final corrected test:', error.message);
        throw error;
    }
}

// Run the final test
if (require.main === module) {
    runFinalTest().catch(console.error);
}

module.exports = { runFinalTest, finalData };
