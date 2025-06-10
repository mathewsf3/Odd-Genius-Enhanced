/**
 * ALTERNATIVE TEAM FORM EXTRACTION STRATEGY
 * 
 * 🎯 Since individual team match endpoints return 404, let's try:
 * 1. Extract team form from today's matches data (we know this works)  
 * 2. Look for other matches involving Iran (8607) and North Korea (8597)
 * 3. Use working endpoints to find historical data
 * 4. Extract form patterns from available data
 * 
 * Target: Iran (8607) last 5 HOME games, North Korea (8597) last 5 AWAY games
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';
const BACKEND_API = 'http://localhost:5000';

// Target teams
const IRAN_ID = 8607;
const NORTH_KOREA_ID = 8597;

let alternativeData = {
    timestamp: new Date().toISOString(),
    strategy: 'ALTERNATIVE FORM EXTRACTION FROM WORKING ENDPOINTS',
    iranForm: { homeGames: [], allAppearances: [] },
    northKoreaForm: { awayGames: [], allAppearances: [] },
    dataSource: {},
    summary: { requests: 0, successful: 0, failed: 0 }
};

async function makeRequest(url, params = {}, description = '') {
    console.log(`🔄 ${description}`);
    
    try {
        const response = await axios.get(url, {
            params: { key: API_KEY, ...params },
            timeout: 25000
        });
        
        console.log(`   ✅ SUCCESS: ${response.status} | ${JSON.stringify(response.data).length} bytes`);
        alternativeData.summary.successful++;
        
        return {
            success: true,
            url,
            description,
            data: response.data,
            size: JSON.stringify(response.data).length
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.response?.status || 'Network'} | ${error.message}`);
        alternativeData.summary.failed++;
        return { success: false, url, description, error: error.message };
    } finally {
        alternativeData.summary.requests++;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

async function extractFromWorkingEndpoints() {
    console.log('🚀 ALTERNATIVE TEAM FORM EXTRACTION');
    console.log('====================================');
    console.log(`🎯 Target: Iran (${IRAN_ID}) home games, North Korea (${NORTH_KOREA_ID}) away games\n`);

    // Strategy 1: Today's matches (we know this works and has lots of data)
    console.log('📊 Strategy 1: Extract from today\'s matches...');
    const todayResult = await makeRequest(`${DIRECT_API}/todays-matches`, {}, 'Today\'s Matches Data');
    alternativeData.dataSource.todaysMatches = todayResult;
    
    if (todayResult.success) {
        const matches = todayResult.data.data || todayResult.data;
        if (Array.isArray(matches)) {
            console.log(`   📈 Analyzing ${matches.length} matches for team appearances...`);
            
            matches.forEach(match => {
                // Check for Iran appearances
                if (match.homeID === IRAN_ID || match.home_id === IRAN_ID) {
                    alternativeData.iranForm.allAppearances.push({...match, appearance: 'home'});
                    if (match.status === 'complete') {
                        alternativeData.iranForm.homeGames.push(match);
                    }
                } else if (match.awayID === IRAN_ID || match.away_id === IRAN_ID) {
                    alternativeData.iranForm.allAppearances.push({...match, appearance: 'away'});
                }
                
                // Check for North Korea appearances
                if (match.awayID === NORTH_KOREA_ID || match.away_id === NORTH_KOREA_ID) {
                    alternativeData.northKoreaForm.allAppearances.push({...match, appearance: 'away'});
                    if (match.status === 'complete') {
                        alternativeData.northKoreaForm.awayGames.push(match);
                    }
                } else if (match.homeID === NORTH_KOREA_ID || match.home_id === NORTH_KOREA_ID) {
                    alternativeData.northKoreaForm.allAppearances.push({...match, appearance: 'home'});
                }
            });
        }
    }
    
    // Strategy 2: Backend today matches (might have different data structure)
    console.log('📊 Strategy 2: Backend today matches...');
    const backendTodayResult = await makeRequest(`${BACKEND_API}/api/footystats/today`, {}, 'Backend Today Matches');
    alternativeData.dataSource.backendToday = backendTodayResult;
    
    // Strategy 3: Try league-based approach with working league IDs
    console.log('📊 Strategy 3: League-based search...');
    
    // Get league list first to find active leagues
    const leaguesResult = await makeRequest(`${DIRECT_API}/league-list`, {}, 'Available Leagues');
    alternativeData.dataSource.leagues = leaguesResult;
    
    if (leaguesResult.success && leaguesResult.data) {
        const leagues = leaguesResult.data.data || leaguesResult.data;
        if (Array.isArray(leagues)) {
            console.log(`   📈 Found ${leagues.length} leagues, checking for Asian/International competitions...`);
            
            // Look for likely leagues that might contain Iran/North Korea
            const targetLeagues = leagues.filter(league => {
                const leagueName = (league.name || '').toLowerCase();
                const countryName = (league.country || '').toLowerCase();
                return leagueName.includes('asia') || leagueName.includes('world') || 
                       leagueName.includes('international') || leagueName.includes('qualification') ||
                       countryName.includes('asia') || countryName.includes('international');
            }).slice(0, 5); // Limit to first 5 matches
            
            console.log(`   🎯 Found ${targetLeagues.length} potential leagues for Asian teams`);
            
            for (const league of targetLeagues) {
                const leagueMatchesResult = await makeRequest(`${DIRECT_API}/league-matches`, 
                    { league_id: league.id, season_id: 2026 }, 
                    `League ${league.name} 2026 Matches`);
                    
                if (leagueMatchesResult.success) {
                    const leagueMatches = leagueMatchesResult.data.data || leagueMatchesResult.data;
                    if (Array.isArray(leagueMatches)) {
                        console.log(`   📊 League ${league.name}: ${leagueMatches.length} matches`);
                        
                        leagueMatches.forEach(match => {
                            // Check for Iran home games
                            if ((match.homeID === IRAN_ID || match.home_id === IRAN_ID) && 
                                match.status === 'complete') {
                                alternativeData.iranForm.homeGames.push({...match, league: league.name});
                            }
                            
                            // Check for North Korea away games  
                            if ((match.awayID === NORTH_KOREA_ID || match.away_id === NORTH_KOREA_ID) && 
                                match.status === 'complete') {
                                alternativeData.northKoreaForm.awayGames.push({...match, league: league.name});
                            }
                        });
                    }
                }
            }
        }
    }
    
    // Strategy 4: Use BTTS/Over2.5 data which might contain historical match info
    console.log('📊 Strategy 4: Statistical data analysis...');
    const bttsResult = await makeRequest(`${BACKEND_API}/api/footystats/btts-stats`, {}, 'BTTS Statistical Data');
    alternativeData.dataSource.bttsStats = bttsResult;
    
    const over25Result = await makeRequest(`${BACKEND_API}/api/footystats/over25-stats`, {}, 'Over 2.5 Statistical Data');
    alternativeData.dataSource.over25Stats = over25Result;
}

function analyzeExtractedForm() {
    console.log('\n🔍 ANALYZING EXTRACTED FORM DATA');
    console.log('=================================');
    
    // Remove duplicates and sort by date
    alternativeData.iranForm.homeGames = alternativeData.iranForm.homeGames
        .filter((match, index, self) => index === self.findIndex(m => m.id === match.id))
        .sort((a, b) => new Date(b.date || b.datetime || 0) - new Date(a.date || a.datetime || 0))
        .slice(0, 5);
    
    alternativeData.northKoreaForm.awayGames = alternativeData.northKoreaForm.awayGames
        .filter((match, index, self) => index === self.findIndex(m => m.id === match.id))
        .sort((a, b) => new Date(b.date || b.datetime || 0) - new Date(a.date || a.datetime || 0))
        .slice(0, 5);
    
    console.log(`🏠 Iran Home Games Found: ${alternativeData.iranForm.homeGames.length}`);
    alternativeData.iranForm.homeGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const opponent = game.awayTeam?.name || game.away_name || `Team ${game.awayID || game.away_id}`;
        const result = game.homeGoalCount > game.awayGoalCount ? 'W' : 
                      game.homeGoalCount < game.awayGoalCount ? 'L' : 'D';
        console.log(`   ${index + 1}. ${game.date || 'Date N/A'} vs ${opponent} ${score} (${result}) ${game.league ? '[' + game.league + ']' : ''}`);
    });
    
    console.log(`\n✈️ North Korea Away Games Found: ${alternativeData.northKoreaForm.awayGames.length}`);
    alternativeData.northKoreaForm.awayGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const opponent = game.homeTeam?.name || game.home_name || `Team ${game.homeID || game.home_id}`;
        const result = game.awayGoalCount > game.homeGoalCount ? 'W' : 
                      game.awayGoalCount < game.homeGoalCount ? 'L' : 'D';
        console.log(`   ${index + 1}. ${game.date || 'Date N/A'} @ ${opponent} ${score} (${result}) ${game.league ? '[' + game.league + ']' : ''}`);
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Iran Total Appearances: ${alternativeData.iranForm.allAppearances.length}`);
    console.log(`   North Korea Total Appearances: ${alternativeData.northKoreaForm.allAppearances.length}`);
    console.log(`   Iran Home Games (Target: 5): ${alternativeData.iranForm.homeGames.length}`);
    console.log(`   North Korea Away Games (Target: 5): ${alternativeData.northKoreaForm.awayGames.length}`);
    
    const successRate = ((alternativeData.summary.successful / alternativeData.summary.requests) * 100).toFixed(1);
    console.log(`   Data Collection Success Rate: ${successRate}%`);
    
    return {
        iranHomeGames: alternativeData.iranForm.homeGames.length,
        northKoreaAwayGames: alternativeData.northKoreaForm.awayGames.length,
        totalAppearances: alternativeData.iranForm.allAppearances.length + alternativeData.northKoreaForm.allAppearances.length
    };
}

function generateAlternativeReport() {
    console.log('\n📋 GENERATING ALTERNATIVE REPORT');
    console.log('=================================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save complete data
    const dataFile = `ALTERNATIVE-form-extraction-${timestamp}.json`;
    fs.writeFileSync(dataFile, JSON.stringify(alternativeData, null, 2));
    console.log(`💾 Complete data: ${dataFile}`);
    
    // Create focused report
    const focusedReport = {
        strategy: alternativeData.strategy,
        results: {
            iranHomeGames: alternativeData.iranForm.homeGames,
            northKoreaAwayGames: alternativeData.northKoreaForm.awayGames,
            iranAppearances: alternativeData.iranForm.allAppearances,
            northKoreaAppearances: alternativeData.northKoreaForm.allAppearances
        },
        summary: alternativeData.summary
    };
    
    const reportFile = `ALTERNATIVE-form-report-${timestamp}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(focusedReport, null, 2));
    console.log(`📊 Focused report: ${reportFile}`);
    
    // Text summary
    const textFile = `ALTERNATIVE-form-summary-${timestamp}.txt`;
    let summary = `ALTERNATIVE TEAM FORM EXTRACTION RESULTS\n`;
    summary += `=======================================\n\n`;
    summary += `Strategy: ${alternativeData.strategy}\n`;
    summary += `Generated: ${alternativeData.timestamp}\n\n`;
    
    summary += `IRAN (${IRAN_ID}) HOME GAMES FOUND: ${alternativeData.iranForm.homeGames.length}\n`;
    alternativeData.iranForm.homeGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const opponent = game.awayTeam?.name || game.away_name || `Team ${game.awayID || game.away_id}`;
        const result = game.homeGoalCount > game.awayGoalCount ? 'W' : 
                      game.homeGoalCount < game.awayGoalCount ? 'L' : 'D';
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} vs ${opponent} ${score} (${result})\n`;
    });
    
    summary += `\nNORTH KOREA (${NORTH_KOREA_ID}) AWAY GAMES FOUND: ${alternativeData.northKoreaForm.awayGames.length}\n`;
    alternativeData.northKoreaForm.awayGames.forEach((game, index) => {
        const score = `${game.homeGoalCount || 0}-${game.awayGoalCount || 0}`;
        const opponent = game.homeTeam?.name || game.home_name || `Team ${game.homeID || game.home_id}`;
        const result = game.awayGoalCount > game.homeGoalCount ? 'W' : 
                      game.awayGoalCount < game.homeGoalCount ? 'L' : 'D';
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} @ ${opponent} ${score} (${result})\n`;
    });
    
    summary += `\nSUMMARY:\n`;
    summary += `Total Requests: ${alternativeData.summary.requests}\n`;
    summary += `Successful: ${alternativeData.summary.successful}\n`;
    summary += `Failed: ${alternativeData.summary.failed}\n`;
    summary += `Success Rate: ${((alternativeData.summary.successful / alternativeData.summary.requests) * 100).toFixed(1)}%\n`;
    
    fs.writeFileSync(textFile, summary);
    console.log(`📄 Text summary: ${textFile}`);
    
    return { dataFile, reportFile, textFile };
}

async function runAlternativeExtraction() {
    try {
        await extractFromWorkingEndpoints();
        const results = analyzeExtractedForm();
        const files = generateAlternativeReport();
        
        console.log('\n🎉 ALTERNATIVE EXTRACTION COMPLETED!');
        console.log('====================================');
        
        if (results.iranHomeGames > 0 || results.northKoreaAwayGames > 0) {
            console.log('✅ SUCCESS: Found team form data using alternative approach!');
            console.log(`🏠 Iran Home Games: ${results.iranHomeGames}`);
            console.log(`✈️ North Korea Away Games: ${results.northKoreaAwayGames}`);
            console.log(`📊 Total Team Appearances: ${results.totalAppearances}`);
        } else {
            console.log('⚠️ No historical form data found, but we have complete current match info');
            console.log('💡 Teams might be new to the league or have limited match history');
        }
        
        return alternativeData;
        
    } catch (error) {
        console.error('💥 Error in alternative extraction:', error.message);
        throw error;
    }
}

if (require.main === module) {
    runAlternativeExtraction().catch(console.error);
}

module.exports = { runAlternativeExtraction, alternativeData };
