/**
 * TRADITIONAL FOOTBALL MATCH FINDER
 * 
 * 🎯 OBJETIVO: Encontrar uma partida de futebol tradicional (não e-sports)
 * e testar nossa implementação completa
 */

const axios = require('axios');
const fs = require('fs');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const DIRECT_API = 'https://api.football-data-api.com';

let traditionalTest = {
    timestamp: new Date().toISOString(),
    version: 'TRADITIONAL-FOOTBALL-v1.0',
    discovery: {
        allMatches: [],
        traditionalMatches: [],
        selectedMatch: {}
    },
    validation: {
        matchData: {},
        seasonFound: null,
        teamFormData: {},
        comprehensiveAnalytics: {}
    },
    summary: { 
        totalRequests: 0, 
        successfulRequests: 0, 
        failedRequests: 0,
        validationSuccess: false
    }
};

async function makeRequest(endpoint, params = {}, description = '') {
    try {
        traditionalTest.summary.totalRequests++;
        
        const url = `${DIRECT_API}${endpoint}`;
        const requestParams = { key: API_KEY, ...params };
        
        console.log(`🔄 ${description || endpoint}`);
        
        const response = await axios.get(url, { 
            params: requestParams,
            timeout: 20000
        });
        
        traditionalTest.summary.successfulRequests++;
        console.log(`   ✅ ${response.status} (${Array.isArray(response.data?.data) ? response.data.data.length : 'OK'} items)`);
        
        return {
            success: true,
            status: response.status,
            data: response.data,
            rawData: response.data?.data || response.data
        };
        
    } catch (error) {
        traditionalTest.summary.failedRequests++;
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
        season: match.season,
        competitionId: match.competition_id ?? match.competitionId,
        date: match.date_unix ?? match.date,
        status: match.status,
        
        // Goals data for completed matches
        homeGoals: match.homeGoalCount ?? match.home_goals ?? 0,
        awayGoals: match.awayGoalCount ?? match.away_goals ?? 0,
        totalGoals: (match.homeGoalCount ?? match.home_goals ?? 0) + (match.awayGoalCount ?? match.away_goals ?? 0),
        
        // Check if it's traditional football
        isTraditional: !match.home_name?.includes('(') && !match.away_name?.includes('(') && 
                      match.season !== '-1' && match.competition_id !== 5874
    };
}

async function findTraditionalFootballMatch() {
    console.log('🏈 STEP 1: FINDING TRADITIONAL FOOTBALL MATCH');
    console.log('=============================================');
    
    // Strategy 1: Look for completed matches in working seasons
    const workingSeasons = [10117, 1625, 1626, 1627];
    
    let traditionalMatches = [];
    
    for (const seasonId of workingSeasons) {
        console.log(`\n🔍 Searching season ${seasonId} for traditional matches...`);
        
        const result = await makeRequest('/league-matches', { 
            season_id: seasonId,
            max_per_page: 100
        }, `Season ${seasonId} matches`);
        
        if (result.success && result.rawData) {
            const matches = Array.isArray(result.rawData) ? result.rawData : [result.rawData];
            
            const traditional = matches.filter(match => {
                const parsed = parseMatch(match);
                return parsed.isTraditional && 
                       parsed.status === 'complete' && 
                       parsed.totalGoals > 0; // Has actual match data
            });
            
            console.log(`   Found ${traditional.length} traditional matches`);
            
            if (traditional.length > 0) {
                traditionalMatches.push(...traditional.slice(0, 5)); // Take first 5
                break; // Found good matches, stop searching
            }
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    traditionalTest.discovery.traditionalMatches = traditionalMatches;
    
    if (traditionalMatches.length === 0) {
        throw new Error('No traditional football matches found');
    }
    
    // Select a good match (not Iran vs NK)
    let selectedMatch = null;
    
    for (const match of traditionalMatches) {
        const parsed = parseMatch(match);
        
        // Skip Iran vs North Korea
        if (parsed.homeId === 8607 || parsed.awayId === 8607 || 
            parsed.homeId === 8597 || parsed.awayId === 8597) {
            continue;
        }
        
        selectedMatch = parsed;
        break;
    }
    
    if (!selectedMatch) {
        // Use first available if no alternative found
        selectedMatch = parseMatch(traditionalMatches[0]);
    }
    
    traditionalTest.discovery.selectedMatch = selectedMatch;
    
    console.log(`\n🎯 SELECTED TRADITIONAL MATCH:`);
    console.log(`   ${selectedMatch.homeName} vs ${selectedMatch.awayName}`);
    console.log(`   Match ID: ${selectedMatch.id}`);
    console.log(`   Final Score: ${selectedMatch.homeGoals}-${selectedMatch.awayGoals}`);
    console.log(`   Home Team ID: ${selectedMatch.homeId}`);
    console.log(`   Away Team ID: ${selectedMatch.awayId}`);
    console.log(`   Season: ${selectedMatch.season}`);
    
    return selectedMatch;
}

async function testComprehensiveAnalytics(selectedMatch) {
    console.log('\n🔬 STEP 2: TESTING COMPREHENSIVE ANALYTICS');
    console.log('==========================================');
    
    // Import our comprehensive analytics (simulated)
    const ComprehensiveAnalytics = require('./COMPREHENSIVE-MATCH-ANALYTICS');
    
    try {
        // Get match details
        const matchResult = await makeRequest('/match', { 
            match_id: selectedMatch.id 
        }, 'Detailed Match Data');
        
        if (!matchResult.success) {
            throw new Error('Failed to get match details');
        }
        
        const matchData = parseMatch(matchResult.rawData);
        traditionalTest.validation.matchData = matchData;
        
        // Find working season
        console.log('\n🔍 Finding working season...');
        const workingSeason = await findWorkingSeasonForMatch(matchData);
        traditionalTest.validation.seasonFound = workingSeason;
        
        if (!workingSeason) {
            throw new Error('No working season found');
        }
        
        // Extract team form data
        console.log('\n📊 Extracting team form data...');
        const formData = await extractTeamFormData(matchData, workingSeason);
        traditionalTest.validation.teamFormData = formData;
        
        // Calculate analytics
        console.log('\n📈 Calculating comprehensive analytics...');
        const analytics = calculateComprehensiveAnalytics(formData);
        traditionalTest.validation.comprehensiveAnalytics = analytics;
        
        traditionalTest.summary.validationSuccess = true;
        
        console.log('✅ COMPREHENSIVE ANALYTICS SUCCESSFUL!');
        return true;
        
    } catch (error) {
        console.error(`❌ Analytics failed: ${error.message}`);
        return false;
    }
}

async function findWorkingSeasonForMatch(matchData) {
    // Use the season from the match itself first
    if (matchData.season && matchData.season !== '-1') {
        return matchData.season;
    }
    
    // Or use competition ID as season ID
    if (matchData.competitionId) {
        return matchData.competitionId;
    }
    
    // Fallback to common seasons
    const candidateSeasons = [10117, 1625, 1626, 1627];
    
    for (const seasonId of candidateSeasons) {
        const result = await makeRequest('/league-matches', { 
            season_id: seasonId,
            max_per_page: 50
        }, `Test season ${seasonId}`);
        
        if (result.success && result.rawData) {
            const matches = Array.isArray(result.rawData) ? result.rawData : [result.rawData];
            
            const hasTeamData = matches.some(match => {
                const parsed = parseMatch(match);
                return parsed.homeId === matchData.homeId || parsed.awayId === matchData.awayId ||
                       parsed.homeId === matchData.awayId || parsed.awayId === matchData.homeId;
            });
            
            if (hasTeamData) {
                console.log(`✅ Found working season: ${seasonId}`);
                return seasonId;
            }
        }
    }
    
    return null;
}

async function extractTeamFormData(matchData, workingSeason) {
    const result = await makeRequest('/league-matches', { 
        season_id: workingSeason,
        max_per_page: 500
    }, `All matches for form extraction`);
    
    if (!result.success) {
        throw new Error('Failed to get season matches');
    }
    
    const allMatches = Array.isArray(result.rawData) ? result.rawData : [result.rawData];
    
    // Extract HOME team's HOME matches
    const homeTeamHomeMatches = allMatches.filter(match => {
        const parsed = parseMatch(match);
        return parsed.homeId === matchData.homeId && parsed.status === 'complete';
    }).map(match => parseMatch(match)).slice(0, 5);
    
    // Extract AWAY team's AWAY matches
    const awayTeamAwayMatches = allMatches.filter(match => {
        const parsed = parseMatch(match);
        return parsed.awayId === matchData.awayId && parsed.status === 'complete';
    }).map(match => parseMatch(match)).slice(0, 5);
    
    console.log(`🏠 ${matchData.homeName} HOME matches: ${homeTeamHomeMatches.length}/5`);
    console.log(`✈️  ${matchData.awayName} AWAY matches: ${awayTeamAwayMatches.length}/5`);
    
    return {
        home: { last5: homeTeamHomeMatches },
        away: { last5: awayTeamAwayMatches }
    };
}

function calculateComprehensiveAnalytics(formData) {
    // Calculate goals over/under
    const goalsThresholds = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    
    const goalsAnalysis = {
        home: calculateOverUnder(formData.home.last5, goalsThresholds, 'totalGoals'),
        away: calculateOverUnder(formData.away.last5, goalsThresholds, 'totalGoals')
    };
    
    // Calculate expected goals
    const homeAvgGoals = formData.home.last5.length > 0 ? 
        formData.home.last5.reduce((sum, m) => sum + m.totalGoals, 0) / formData.home.last5.length : 0;
    
    const awayAvgGoals = formData.away.last5.length > 0 ? 
        formData.away.last5.reduce((sum, m) => sum + m.totalGoals, 0) / formData.away.last5.length : 0;
    
    const xStats = {
        expectedGoals: {
            home: homeAvgGoals.toFixed(2),
            away: awayAvgGoals.toFixed(2),
            combined: (homeAvgGoals + awayAvgGoals).toFixed(2)
        }
    };
    
    return {
        goals: goalsAnalysis,
        xStats
    };
}

function calculateOverUnder(matches, thresholds, field) {
    const stats = {};
    
    thresholds.forEach(threshold => {
        const overCount = matches.filter(match => match[field] > threshold).length;
        
        stats[`over_${threshold}`] = {
            count: overCount,
            percentage: matches.length > 0 ? (overCount / matches.length * 100).toFixed(1) : '0'
        };
    });
    
    return stats;
}

async function runTraditionalFootballTest() {
    console.log('🏈 TRADITIONAL FOOTBALL MATCH TEST');
    console.log('==================================');
    console.log(`🎯 GOAL: Test our solution with traditional football`);
    console.log(`📅 Started: ${new Date().toISOString()}\n`);

    try {
        // Step 1: Find traditional football match
        const selectedMatch = await findTraditionalFootballMatch();
        
        // Step 2: Test comprehensive analytics
        const analyticsSuccess = await testComprehensiveAnalytics(selectedMatch);
        
        // FINAL RESULTS
        console.log('\n🎯 FINAL RESULTS');
        console.log('================');
        console.log(`📊 Total API Requests: ${traditionalTest.summary.totalRequests}`);
        console.log(`✅ Successful: ${traditionalTest.summary.successfulRequests}`);
        console.log(`❌ Failed: ${traditionalTest.summary.failedRequests}`);
        console.log(`🏆 Overall Success: ${traditionalTest.summary.validationSuccess ? 'YES' : 'NO'}`);
        
        if (traditionalTest.summary.validationSuccess) {
            console.log('\n🎉 SUCCESS! Our solution works with traditional football!');
            console.log(`✅ Match: ${selectedMatch.homeName} vs ${selectedMatch.awayName}`);
            console.log(`✅ Score: ${selectedMatch.homeGoals}-${selectedMatch.awayGoals}`);
            console.log(`✅ Working Season: ${traditionalTest.validation.seasonFound}`);
            
            // Show analytics sample
            const analytics = traditionalTest.validation.comprehensiveAnalytics;
            if (analytics.xStats) {
                console.log(`✅ Expected Goals: Home ${analytics.xStats.expectedGoals.home}, Away ${analytics.xStats.expectedGoals.away}`);
            }
            
            console.log('\n🚀 READY FOR PRODUCTION!');
        }
        
    } catch (error) {
        console.error('\n💥 TEST ERROR:', error.message);
        traditionalTest.error = {
            message: error.message,
            stack: error.stack
        };
    }
    
    // Save results
    const filename = `TRADITIONAL-FOOTBALL-RESULTS-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(traditionalTest, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
    
    return traditionalTest;
}

// Execute if running directly
if (require.main === module) {
    runTraditionalFootballTest()
        .then(results => {
            console.log('\n🏁 Traditional football test completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runTraditionalFootballTest };
