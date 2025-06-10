/**
 * FORM DATA EXTRACTION FIXER
 * 
 * 🎯 OBJECTIVE: Extract team form data from the successful /lastx API calls
 * We got 176KB + 177KB of data but didn't extract the form properly
 * 
 * This script will analyze the orchestrated data and fix the form extraction
 * to get the last 5 HOME games for Iran and last 5 AWAY games for North Korea
 */

const fs = require('fs');

// Load the orchestrated data
const dataFile = 'ORCHESTRATED-complete-data-2025-06-10T16-16-38-239Z.json';
const orchestratedData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

function analyzeAndFixFormData() {
    console.log('🔧 ANALYZING AND FIXING FORM DATA EXTRACTION');
    console.log('=============================================');
    
    const TARGET_MATCH = {
        homeTeamId: 8607, // Iran
        awayTeamId: 8597  // North Korea
    };
    
    // Find the lastx data for both teams
    const homeLastXStep = orchestratedData.orchestration.stepDetails.find(step => 
        step.step === 5 && step.description.includes('Home Team Last 10')
    );
    
    const awayLastXStep = orchestratedData.orchestration.stepDetails.find(step => 
        step.step === 6 && step.description.includes('Away Team Last 10')
    );
    
    console.log(`\n📊 FOUND DATA:`);
    console.log(`Home Team (Iran) LastX Data: ${homeLastXStep ? 'YES' : 'NO'} - ${homeLastXStep?.data_size_bytes || 0} bytes`);
    console.log(`Away Team (North Korea) LastX Data: ${awayLastXStep ? 'YES' : 'NO'} - ${awayLastXStep?.data_size_bytes || 0} bytes`);
    
    const fixedFormData = {
        home_last5_home: [],
        away_last5_away: [],
        home_all_matches: [],
        away_all_matches: [],
        analysis: {
            home_data_structure: null,
            away_data_structure: null,
            extraction_method: null
        }
    };
    
    // Analyze home team data
    if (homeLastXStep && homeLastXStep.success && homeLastXStep.data) {
        console.log(`\n🏠 ANALYZING IRAN (HOME TEAM) DATA:`);
        
        const homeData = homeLastXStep.data;
        console.log(`   Data keys: ${Object.keys(homeData).join(', ')}`);
        
        // Check different possible data structures
        if (homeData.data && Array.isArray(homeData.data)) {
            console.log(`   Found data array with ${homeData.data.length} items`);
            fixedFormData.home_all_matches = homeData.data;
            fixedFormData.analysis.home_data_structure = 'data_array';
            
            // Filter for home games (where Iran is the home team)
            const homeGames = homeData.data.filter(match => {
                return match.homeID === TARGET_MATCH.homeTeamId || 
                       match.home_id === TARGET_MATCH.homeTeamId ||
                       match.team_a_id === TARGET_MATCH.homeTeamId;
            });
            
            fixedFormData.home_last5_home = homeGames.slice(0, 5);
            console.log(`   Found ${homeGames.length} home games, taking first 5`);
            
        } else if (Array.isArray(homeData)) {
            console.log(`   Direct array with ${homeData.length} items`);
            fixedFormData.home_all_matches = homeData;
            fixedFormData.analysis.home_data_structure = 'direct_array';
            
            const homeGames = homeData.filter(match => {
                return match.homeID === TARGET_MATCH.homeTeamId || 
                       match.home_id === TARGET_MATCH.homeTeamId ||
                       match.team_a_id === TARGET_MATCH.homeTeamId;
            });
            
            fixedFormData.home_last5_home = homeGames.slice(0, 5);
            console.log(`   Found ${homeGames.length} home games, taking first 5`);
            
        } else {
            console.log(`   Unknown data structure`);
            console.log(`   Sample keys: ${JSON.stringify(Object.keys(homeData)).substring(0, 200)}`);
            fixedFormData.analysis.home_data_structure = 'unknown';
        }
        
        // Print sample of found home games
        if (fixedFormData.home_last5_home.length > 0) {
            console.log(`   Sample home game:`, JSON.stringify(fixedFormData.home_last5_home[0], null, 2).substring(0, 300));
        }
    }
    
    // Analyze away team data
    if (awayLastXStep && awayLastXStep.success && awayLastXStep.data) {
        console.log(`\n✈️ ANALYZING NORTH KOREA (AWAY TEAM) DATA:`);
        
        const awayData = awayLastXStep.data;
        console.log(`   Data keys: ${Object.keys(awayData).join(', ')}`);
        
        // Check different possible data structures
        if (awayData.data && Array.isArray(awayData.data)) {
            console.log(`   Found data array with ${awayData.data.length} items`);
            fixedFormData.away_all_matches = awayData.data;
            fixedFormData.analysis.away_data_structure = 'data_array';
            
            // Filter for away games (where North Korea is the away team)
            const awayGames = awayData.data.filter(match => {
                return match.awayID === TARGET_MATCH.awayTeamId || 
                       match.away_id === TARGET_MATCH.awayTeamId ||
                       match.team_b_id === TARGET_MATCH.awayTeamId;
            });
            
            fixedFormData.away_last5_away = awayGames.slice(0, 5);
            console.log(`   Found ${awayGames.length} away games, taking first 5`);
            
        } else if (Array.isArray(awayData)) {
            console.log(`   Direct array with ${awayData.length} items`);
            fixedFormData.away_all_matches = awayData;
            fixedFormData.analysis.away_data_structure = 'direct_array';
            
            const awayGames = awayData.filter(match => {
                return match.awayID === TARGET_MATCH.awayTeamId || 
                       match.away_id === TARGET_MATCH.awayTeamId ||
                       match.team_b_id === TARGET_MATCH.awayTeamId;
            });
            
            fixedFormData.away_last5_away = awayGames.slice(0, 5);
            console.log(`   Found ${awayGames.length} away games, taking first 5`);
            
        } else {
            console.log(`   Unknown data structure`);
            console.log(`   Sample keys: ${JSON.stringify(Object.keys(awayData)).substring(0, 200)}`);
            fixedFormData.analysis.away_data_structure = 'unknown';
        }
        
        // Print sample of found away games
        if (fixedFormData.away_last5_away.length > 0) {
            console.log(`   Sample away game:`, JSON.stringify(fixedFormData.away_last5_away[0], null, 2).substring(0, 300));
        }
    }
    
    // Final analysis
    console.log(`\n📊 FIXED FORM DATA SUMMARY:`);
    console.log(`Iran (Home) Last 5 Home Games: ${fixedFormData.home_last5_home.length}`);
    console.log(`North Korea (Away) Last 5 Away Games: ${fixedFormData.away_last5_away.length}`);
    console.log(`Total Iran Matches Available: ${fixedFormData.home_all_matches.length}`);
    console.log(`Total North Korea Matches Available: ${fixedFormData.away_all_matches.length}`);
    
    fixedFormData.analysis.extraction_method = 'manual_filtering_by_team_id';
    fixedFormData.analysis.success = fixedFormData.home_last5_home.length > 0 && fixedFormData.away_last5_away.length > 0;
    
    return fixedFormData;
}

function generateFixedFormReport(fixedData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save the fixed form data
    const fixedFile = `FIXED-form-data-${timestamp}.json`;
    fs.writeFileSync(fixedFile, JSON.stringify(fixedData, null, 2));
    console.log(`\n💾 Fixed form data saved: ${fixedFile}`);
    
    // Create a summary report
    const summaryFile = `FIXED-form-summary-${timestamp}.txt`;
    let summary = `FIXED TEAM FORM DATA EXTRACTION\n`;
    summary += `===============================\n\n`;
    summary += `Target Match: Iran vs North Korea (ID: 7479469)\n`;
    summary += `Generated: ${new Date().toISOString()}\n\n`;
    
    summary += `EXTRACTION RESULTS:\n`;
    summary += `Iran (Home) Last 5 Home Games: ${fixedData.home_last5_home.length}\n`;
    fixedData.home_last5_home.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0} vs ${game.awayTeamName || 'Unknown'}\n`;
    });
    
    summary += `\nNorth Korea (Away) Last 5 Away Games: ${fixedData.away_last5_away.length}\n`;
    fixedData.away_last5_away.forEach((game, index) => {
        summary += `  ${index + 1}. ${game.date || 'Date N/A'} - Score: ${game.homeGoalCount || 0}-${game.awayGoalCount || 0} at ${game.homeTeamName || 'Unknown'}\n`;
    });
    
    summary += `\nDATA ANALYSIS:\n`;
    summary += `Iran Data Structure: ${fixedData.analysis.home_data_structure}\n`;
    summary += `North Korea Data Structure: ${fixedData.analysis.away_data_structure}\n`;
    summary += `Extraction Method: ${fixedData.analysis.extraction_method}\n`;
    summary += `Extraction Success: ${fixedData.analysis.success ? 'YES' : 'NO'}\n`;
    summary += `Total Iran Matches: ${fixedData.home_all_matches.length}\n`;
    summary += `Total North Korea Matches: ${fixedData.away_all_matches.length}\n`;
    
    fs.writeFileSync(summaryFile, summary);
    console.log(`📄 Fixed form summary: ${summaryFile}`);
    
    return { fixedFile, summaryFile };
}

// Run the form data fixer
console.log('🔧 FORM DATA EXTRACTION FIXER');
console.log('==============================');
console.log(`📁 Analyzing data from: ${dataFile}`);

try {
    const fixedData = analyzeAndFixFormData();
    const files = generateFixedFormReport(fixedData);
    
    console.log('\n🎉 FORM DATA FIXING COMPLETED!');
    console.log('==============================');
    
    if (fixedData.analysis.success) {
        console.log('✅ SUCCESS: Team form data successfully extracted!');
        console.log(`🏠 Iran: ${fixedData.home_last5_home.length} home games found`);
        console.log(`✈️ North Korea: ${fixedData.away_last5_away.length} away games found`);
    } else {
        console.log('⚠️ PARTIAL: Some form data missing or structure unknown');
        console.log(`🏠 Iran: ${fixedData.home_last5_home.length} home games found`);
        console.log(`✈️ North Korea: ${fixedData.away_last5_away.length} away games found`);
    }
    
} catch (error) {
    console.error('💥 Error in form data fixing:', error.message);
}
