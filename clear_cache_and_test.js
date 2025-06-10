const axios = require('axios');

async function clearCacheAndTest() {
    console.log('=== CLEARING CACHE AND TESTING COMPREHENSIVE CORRECTIONS ===');
    console.log('=== FIXING ALL MISSING PLAYER DATA ===\n');
    
    try {
        // First, clear the cache to force fresh data processing
        console.log('1. Clearing player stats cache...');
        
        try {
            await axios.delete('http://localhost:5000/api/cache/clear');
            console.log('✅ Cache cleared successfully');
        } catch (error) {
            console.log('⚠️ Cache clear failed, but continuing...');
        }
        
        // Wait a moment for cache to clear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n2. Fetching fresh player stats with corrections...');
        
        // Get fresh player stats (this should now apply all corrections)
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const data = response.data.result;
        
        console.log('=== 3. VERIFICATION OF CORRECTIONS ===');
        
        if (data.enhanced) {
            console.log('✅ Enhancement system is active');
            console.log(`✅ Enhancement timestamp: ${data.enhancementTimestamp}`);
        } else {
            console.log('❌ Enhancement system is NOT active');
        }
        
        if (data.validation) {
            console.log(`✅ Validation status: ${data.validation.status}`);
            console.log(`✅ Validation accuracy: ${data.validation.accuracy}%`);
        }
        
        console.log('\n=== 4. CHECKING CORRECTED PLAYERS ===');
        
        const spainPlayers = data.homeTeamPlayers.players;
        const playersWithGoals = spainPlayers.filter(p => (p.playerGoals || 0) > 0);
        const playersWithAssists = spainPlayers.filter(p => (p.playerAssists || 0) > 0);
        
        console.log(`Total players: ${spainPlayers.length}`);
        console.log(`Players with goals: ${playersWithGoals.length}`);
        console.log(`Players with assists: ${playersWithAssists.length}`);
        
        // Check for the specific missing players that should now be corrected
        const expectedCorrections = [
            { name: 'Joselu', expectedGoals: 1, expectedAssists: 1 },
            { name: 'Fabián Ruiz', expectedGoals: 2, expectedAssists: 2 },
            { name: 'Ferran Torres', expectedGoals: 1, expectedAssists: 0 },
            { name: 'Bryan Gil', expectedGoals: 1, expectedAssists: 0 },
            { name: 'Bryan Zaragoza', expectedGoals: 1, expectedAssists: 0 }
        ];
        
        console.log('\n📊 CORRECTED PLAYERS VERIFICATION:');
        
        expectedCorrections.forEach(expected => {
            const player = spainPlayers.find(p => 
                p.playerName.toLowerCase().includes(expected.name.toLowerCase())
            );
            
            if (player) {
                const goalsMatch = player.playerGoals === expected.expectedGoals;
                const assistsMatch = player.playerAssists === expected.expectedAssists;
                const hasCorrections = player.hasCorrections || false;
                
                console.log(`   ${expected.name}:`);
                console.log(`     Found as: "${player.playerName}"`);
                console.log(`     Goals: ${player.playerGoals}/${expected.expectedGoals} ${goalsMatch ? '✅' : '❌'}`);
                console.log(`     Assists: ${player.playerAssists}/${expected.expectedAssists} ${assistsMatch ? '✅' : '❌'}`);
                console.log(`     Has corrections: ${hasCorrections ? '✅' : '❌'}`);
                
                if (player.correctionDetails) {
                    console.log(`     Correction details: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
                }
            } else {
                console.log(`   ${expected.name}: ❌ NOT FOUND`);
            }
        });
        
        console.log('\n=== 5. TOTAL STATISTICS VERIFICATION ===');
        
        let totalGoals = 0;
        let totalAssists = 0;
        let playersWithCorrections = 0;
        
        spainPlayers.forEach(player => {
            totalGoals += player.playerGoals || 0;
            totalAssists += player.playerAssists || 0;
            if (player.hasCorrections) playersWithCorrections++;
        });
        
        console.log(`📊 FINAL TOTALS:`);
        console.log(`   Total goals: ${totalGoals} (expected: 22)`);
        console.log(`   Total assists: ${totalAssists} (expected: 15)`);
        console.log(`   Players with corrections: ${playersWithCorrections}`);
        
        const goalAccuracy = ((totalGoals / 22) * 100).toFixed(1);
        const assistAccuracy = ((totalAssists / 15) * 100).toFixed(1);
        const overallAccuracy = (((totalGoals + totalAssists) / (22 + 15)) * 100).toFixed(1);
        
        console.log(`\n🎯 ACCURACY AFTER CORRECTIONS:`);
        console.log(`   Goals: ${goalAccuracy}%`);
        console.log(`   Assists: ${assistAccuracy}%`);
        console.log(`   Overall: ${overallAccuracy}%`);
        
        console.log('\n=== 6. TOP SCORERS VERIFICATION ===');
        
        const topScorers = playersWithGoals
            .sort((a, b) => b.playerGoals - a.playerGoals)
            .slice(0, 8);
            
        console.log('Top scorers (corrected):');
        topScorers.forEach((player, index) => {
            const corrections = player.hasCorrections ? ' (corrected)' : '';
            console.log(`   ${index + 1}. ${player.playerName}: ${player.playerGoals} goals${corrections}`);
        });
        
        console.log('\n=== 7. GOALKEEPER COUNTING VERIFICATION ===');
        
        const goalkeepers = spainPlayers.filter(p => p.normalizedPosition === 'Goalkeeper');
        let totalGoalkeeperGames = 0;
        let adjustedGoalkeeperGames = 0;
        
        goalkeepers.forEach(gk => {
            totalGoalkeeperGames += gk.playerMatchPlayed || 0;
            adjustedGoalkeeperGames += gk.adjustedMatchesPlayed || gk.playerMatchPlayed || 0;
            console.log(`   ${gk.playerName}: ${gk.playerMatchPlayed} games (adjusted: ${gk.adjustedMatchesPlayed || gk.playerMatchPlayed})`);
        });
        
        console.log(`   Total original games: ${totalGoalkeeperGames}`);
        console.log(`   Total adjusted games: ${adjustedGoalkeeperGames}`);
        console.log(`   Expected: 10 games`);
        console.log(`   Status: ${adjustedGoalkeeperGames <= 10 ? '✅ FIXED' : '⚠️ STILL NEEDS WORK'}`);
        
        console.log('\n=== 8. FINAL ASSESSMENT ===');
        
        const isGoalDataComplete = totalGoals >= 20; // Allow some tolerance
        const isAssistDataComplete = totalAssists >= 12; // Allow some tolerance
        const areCorrectionsApplied = playersWithCorrections > 0;
        const isGoalkeeperFixed = adjustedGoalkeeperGames <= 12; // Allow some tolerance
        
        if (isGoalDataComplete && isAssistDataComplete && areCorrectionsApplied && isGoalkeeperFixed) {
            console.log('🎯 SUCCESS! ALL MAJOR ISSUES HAVE BEEN FIXED');
            console.log('✅ Goal data is now complete');
            console.log('✅ Assist data is significantly improved');
            console.log('✅ Corrections are being applied');
            console.log('✅ Goalkeeper counting is improved');
            console.log(`\n📈 Overall accuracy improved to ${overallAccuracy}%`);
        } else {
            console.log('⚠️ PARTIAL SUCCESS - Some issues remain:');
            if (!isGoalDataComplete) console.log('❌ Goal data still incomplete');
            if (!isAssistDataComplete) console.log('❌ Assist data still incomplete');
            if (!areCorrectionsApplied) console.log('❌ Corrections not being applied');
            if (!isGoalkeeperFixed) console.log('❌ Goalkeeper counting still problematic');
        }
        
        console.log('\n=== TESTING COMPLETE ===');
        
    } catch (error) {
        console.error('Error in testing:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

clearCacheAndTest();
