// FINAL COMPREHENSIVE TEAM FORM EXTRACTION
// Last attempt to get Iran's home games and North Korea's away games

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.footystats.org';

// Target teams from our match
const IRAN_ID = 8607;
const NORTH_KOREA_ID = 8597;
const TARGET_MATCH_ID = 7479469;

console.log('🔍 FINAL TEAM FORM EXTRACTION ATTEMPT');
console.log('=====================================');
console.log(`🎯 Iran (${IRAN_ID}) - Looking for last 5 HOME games`);
console.log(`🎯 North Korea (${NORTH_KOREA_ID}) - Looking for last 5 AWAY games`);

async function makeRequest(endpoint, params = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const response = await axios.get(url, {
            params: { key: API_KEY, ...params },
            timeout: 30000
        });
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        return response.data;
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.response?.status || 'TIMEOUT'} | ${error.message}`);
        return null;
    }
}

async function extractTeamForm() {
    const results = {
        iranHomeGames: [],
        northKoreaAwayGames: [],
        totalRequests: 0,
        successfulRequests: 0,
        strategiesAttempted: []
    };

    // STRATEGY 1: Direct team match history (already know this fails, but trying one more time)
    console.log('\n📊 STRATEGY 1: Direct team match queries');
    console.log('🔄 Iran matches via /matches endpoint');
    results.totalRequests++;
    const iranMatches = await makeRequest('/matches', { team_id: IRAN_ID });
    if (iranMatches) {
        results.successfulRequests++;
        results.strategiesAttempted.push('Direct Iran matches - SUCCESS');
    } else {
        results.strategiesAttempted.push('Direct Iran matches - FAILED');
    }

    console.log('🔄 North Korea matches via /matches endpoint');
    results.totalRequests++;
    const nkMatches = await makeRequest('/matches', { team_id: NORTH_KOREA_ID });
    if (nkMatches) {
        results.successfulRequests++;
        results.strategiesAttempted.push('Direct North Korea matches - SUCCESS');
    } else {
        results.strategiesAttempted.push('Direct North Korea matches - FAILED');
    }

    // STRATEGY 2: Get detailed info about our target match first
    console.log('\n📊 STRATEGY 2: Detailed match analysis');
    console.log('🔄 Target match details');
    results.totalRequests++;
    const matchDetails = await makeRequest('/match', { id: TARGET_MATCH_ID });
    if (matchDetails) {
        results.successfulRequests++;
        results.strategiesAttempted.push('Target match details - SUCCESS');
        
        // Extract league info from the match
        if (matchDetails.league_id) {
            console.log(`🏆 Found league ID: ${matchDetails.league_id}`);
            
            // Try to get all matches from this league
            console.log('🔄 League matches');
            results.totalRequests++;
            const leagueMatches = await makeRequest('/league-season', { 
                id: matchDetails.league_id,
                season_id: matchDetails.season
            });
            
            if (leagueMatches && leagueMatches.data) {
                results.successfulRequests++;
                results.strategiesAttempted.push('League season matches - SUCCESS');
                
                // Filter matches for our teams
                const allMatches = leagueMatches.data;
                console.log(`📊 Found ${allMatches.length} matches in league`);
                
                // Look for Iran home games
                const iranHomeMatches = allMatches.filter(match => 
                    match.homeID == IRAN_ID && match.id != TARGET_MATCH_ID
                ).slice(-5); // Last 5
                
                // Look for North Korea away games  
                const nkAwayMatches = allMatches.filter(match => 
                    match.awayID == NORTH_KOREA_ID && match.id != TARGET_MATCH_ID
                ).slice(-5); // Last 5
                
                results.iranHomeGames = iranHomeMatches;
                results.northKoreaAwayGames = nkAwayMatches;
                
                console.log(`🏠 Iran home games found: ${iranHomeMatches.length}`);
                console.log(`✈️ North Korea away games found: ${nkAwayMatches.length}`);
            } else {
                results.strategiesAttempted.push('League season matches - FAILED');
            }
        }
    } else {
        results.strategiesAttempted.push('Target match details - FAILED');
    }

    // STRATEGY 3: Alternative league search using team details
    console.log('\n📊 STRATEGY 3: Team-specific league discovery');
    
    console.log('🔄 Iran team details');
    results.totalRequests++;
    const iranTeam = await makeRequest('/team', { id: IRAN_ID });
    if (iranTeam) {
        results.successfulRequests++;
        results.strategiesAttempted.push('Iran team details - SUCCESS');
        console.log(`📝 Iran league: ${iranTeam.league_name} (ID: ${iranTeam.league_id})`);
    } else {
        results.strategiesAttempted.push('Iran team details - FAILED');
    }

    console.log('🔄 North Korea team details');
    results.totalRequests++;
    const nkTeam = await makeRequest('/team', { id: NORTH_KOREA_ID });
    if (nkTeam) {
        results.successfulRequests++;
        results.strategiesAttempted.push('North Korea team details - SUCCESS');
        console.log(`📝 North Korea league: ${nkTeam.league_name} (ID: ${nkTeam.league_id})`);
    } else {
        results.strategiesAttempted.push('North Korea team details - FAILED');
    }

    // STRATEGY 4: Brute force recent match analysis
    console.log('\n📊 STRATEGY 4: Recent matches analysis');
    console.log('🔄 All today matches (looking for patterns)');
    results.totalRequests++;
    const todayMatches = await makeRequest('/todays-matches');
    if (todayMatches && todayMatches.data) {
        results.successfulRequests++;
        results.strategiesAttempted.push('Today matches analysis - SUCCESS');
        
        // Check if any teams appear multiple times (indicating form data)
        const teamAppearances = {};
        todayMatches.data.forEach(match => {
            teamAppearances[match.homeID] = (teamAppearances[match.homeID] || 0) + 1;
            teamAppearances[match.awayID] = (teamAppearances[match.awayID] || 0) + 1;
        });
        
        console.log(`📊 Teams with multiple appearances today: ${Object.keys(teamAppearances).filter(id => teamAppearances[id] > 1).length}`);
    } else {
        results.strategiesAttempted.push('Today matches analysis - FAILED');
    }

    return results;
}

async function generateFinalReport(results) {
    const timestamp = new Date().toISOString();
    const successRate = ((results.successfulRequests / results.totalRequests) * 100).toFixed(1);
    
    console.log('\n🔍 FINAL EXTRACTION RESULTS');
    console.log('============================');
    console.log(`🏠 Iran Home Games Found: ${results.iranHomeGames.length}`);
    console.log(`✈️ North Korea Away Games Found: ${results.northKoreaAwayGames.length}`);
    console.log(`📊 Success Rate: ${successRate}% (${results.successfulRequests}/${results.totalRequests})`);
    
    // Generate detailed report
    const report = {
        timestamp,
        task: "Final Team Form Extraction",
        targets: {
            iranId: IRAN_ID,
            northKoreaId: NORTH_KOREA_ID,
            targetMatchId: TARGET_MATCH_ID
        },
        results: {
            iranHomeGames: results.iranHomeGames,
            northKoreaAwayGames: results.northKoreaAwayGames,
            iranHomeGameCount: results.iranHomeGames.length,
            northKoreaAwayGameCount: results.northKoreaAwayGames.length
        },
        performance: {
            totalRequests: results.totalRequests,
            successfulRequests: results.successfulRequests,
            successRate: successRate + '%'
        },
        strategiesAttempted: results.strategiesAttempted,
        conclusion: results.iranHomeGames.length + results.northKoreaAwayGames.length > 0 
            ? "SUCCESS: Historical form data extracted"
            : "LIMITATION: No historical form data available in FootyStats for these teams"
    };
    
    // Save detailed report
    const reportFile = `FINAL-team-form-report-${timestamp.replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`💾 Detailed report: ${reportFile}`);
    
    // Save summary
    const summaryFile = `FINAL-team-form-summary-${timestamp.replace(/[:.]/g, '-')}.txt`;
    const summary = `FINAL TEAM FORM EXTRACTION SUMMARY
Generated: ${timestamp}

OBJECTIVE:
- Iran (${IRAN_ID}): Find last 5 HOME games
- North Korea (${NORTH_KOREA_ID}): Find last 5 AWAY games

RESULTS:
- Iran Home Games Found: ${results.iranHomeGames.length}/5
- North Korea Away Games Found: ${results.northKoreaAwayGames.length}/5
- API Success Rate: ${successRate}%

STRATEGIES ATTEMPTED:
${results.strategiesAttempted.map(s => '- ' + s).join('\n')}

CONCLUSION:
${report.conclusion}

RECOMMENDATION:
${results.iranHomeGames.length + results.northKoreaAwayGames.length === 0 
    ? "FootyStats API may not have historical match data for these international teams. Consider using current match data and statistical averages for predictions."
    : "Proceed with the extracted form data for analysis."}
`;
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Summary report: ${summaryFile}`);
    
    return report;
}

async function main() {
    try {
        const results = await extractTeamForm();
        const report = await generateFinalReport(results);
        
        console.log('\n🎉 FINAL EXTRACTION COMPLETED!');
        console.log('===============================');
        
        if (report.conclusion.includes('SUCCESS')) {
            console.log('✅ Historical form data successfully extracted');
        } else {
            console.log('⚠️ No historical form data available');
            console.log('💡 Teams may be international squads with limited FootyStats history');
            console.log('🔧 Recommendation: Use current match data and statistical modeling');
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
    }
}

main();
