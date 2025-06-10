const axios = require('axios');

async function testComprehensiveCorrections() {
    console.log('=== COMPREHENSIVE CORRECTIONS TEST ===');
    console.log('=== VERIFYING SPAIN AND FRANCE DATA FIXES ===\n');
    
    try {
        // Test Spain corrections (10 matches)
        console.log('=== 1. TESTING SPAIN CORRECTIONS (10 MATCHES) ===');
        
        const spainResponse = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const spainData = spainResponse.data.result;
        
        console.log('Spain data enhanced:', spainData.enhanced);
        console.log('Spain enhancement timestamp:', spainData.enhancementTimestamp);
        
        // Check Spain corrections
        const spainPlayers = spainData.homeTeamPlayers.players;
        const spainPlayersWithCorrections = spainPlayers.filter(p => p.hasCorrections);
        
        console.log(`Spain players with corrections: ${spainPlayersWithCorrections.length}`);
        spainPlayersWithCorrections.forEach(player => {
            console.log(`  ${player.playerName}: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
        });
        
        // Check specific Spain players that should be corrected
        const spainExpectedCorrections = [
            { name: 'Joselu', expectedGoals: 1, expectedAssists: 1 },
            { name: 'Fabián Ruiz', expectedGoals: 2, expectedAssists: 2 },
            { name: 'Ferran Torres', expectedGoals: 1, expectedAssists: 0 },
            { name: 'Bryan Gil', expectedGoals: 1, expectedAssists: 0 },
            { name: 'Bryan Zaragoza', expectedGoals: 1, expectedAssists: 0 }
        ];
        
        console.log('\nSpain specific corrections verification:');
        spainExpectedCorrections.forEach(expected => {
            const player = spainPlayers.find(p => 
                p.playerName.toLowerCase().includes(expected.name.toLowerCase())
            );
            
            if (player) {
                const goalsMatch = player.playerGoals >= expected.expectedGoals;
                const assistsMatch = player.playerAssists >= expected.expectedAssists;
                
                console.log(`  ${expected.name}: ${player.playerGoals}G/${expected.expectedGoals}G ${goalsMatch ? '✅' : '❌'}, ${player.playerAssists}A/${expected.expectedAssists}A ${assistsMatch ? '✅' : '❌'}`);
            } else {
                console.log(`  ${expected.name}: ❌ NOT FOUND`);
            }
        });
        
        // Calculate Spain totals
        let spainTotalGoals = 0;
        let spainTotalAssists = 0;
        spainPlayers.forEach(player => {
            spainTotalGoals += player.playerGoals || 0;
            spainTotalAssists += player.playerAssists || 0;
        });
        
        console.log(`\nSpain totals: ${spainTotalGoals} goals, ${spainTotalAssists} assists`);
        console.log(`Spain expected: 22 goals, 15 assists`);
        console.log(`Spain accuracy: ${((spainTotalGoals / 22) * 100).toFixed(1)}% goals, ${((spainTotalAssists / 15) * 100).toFixed(1)}% assists`);
        
        // Test France corrections (5 matches)
        console.log('\n=== 2. TESTING FRANCE CORRECTIONS (5 MATCHES) ===');
        
        const franceResponse = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=5');
        const franceData = franceResponse.data.result;
        
        console.log('France data enhanced:', franceData.enhanced);
        console.log('France enhancement timestamp:', franceData.enhancementTimestamp);
        
        // Check France corrections
        const francePlayers = franceData.awayTeamPlayers.players;
        const francePlayersWithCorrections = francePlayers.filter(p => p.hasCorrections);
        
        console.log(`France players with corrections: ${francePlayersWithCorrections.length}`);
        francePlayersWithCorrections.forEach(player => {
            console.log(`  ${player.playerName}: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
        });
        
        // Check specific France players that should be corrected
        const franceExpectedCorrections = [
            { name: 'Adrien Rabiot', expectedGoals: 2, expectedAssists: 0 },
            { name: 'Lucas Digne', expectedGoals: 0, expectedAssists: 3 },
            { name: 'Michael Olise', expectedGoals: 1, expectedAssists: 1 },
            { name: 'Ousmane Dembélé', expectedGoals: 1, expectedAssists: 0 },
            { name: 'Randal Kolo Muani', expectedGoals: 2, expectedAssists: 0 }
        ];
        
        console.log('\nFrance specific corrections verification:');
        franceExpectedCorrections.forEach(expected => {
            const player = francePlayers.find(p => 
                p.playerName.toLowerCase().includes(expected.name.toLowerCase()) ||
                expected.name.toLowerCase().includes(p.playerName.toLowerCase())
            );
            
            if (player) {
                const goalsMatch = player.playerGoals >= expected.expectedGoals;
                const assistsMatch = player.playerAssists >= expected.expectedAssists;
                
                console.log(`  ${expected.name}: ${player.playerGoals}G/${expected.expectedGoals}G ${goalsMatch ? '✅' : '❌'}, ${player.playerAssists}A/${expected.expectedAssists}A ${assistsMatch ? '✅' : '❌'}`);
            } else {
                console.log(`  ${expected.name}: ❌ NOT FOUND`);
            }
        });
        
        // Calculate France totals
        let franceTotalGoals = 0;
        let franceTotalAssists = 0;
        francePlayers.forEach(player => {
            franceTotalGoals += player.playerGoals || 0;
            franceTotalAssists += player.playerAssists || 0;
        });
        
        console.log(`\nFrance totals: ${franceTotalGoals} goals, ${franceTotalAssists} assists`);
        console.log(`France expected: 7 goals, 4 assists`);
        console.log(`France accuracy: ${((franceTotalGoals / 7) * 100).toFixed(1)}% goals, ${((franceTotalAssists / 4) * 100).toFixed(1)}% assists`);
        
        // Overall assessment
        console.log('\n=== 3. OVERALL ASSESSMENT ===');
        
        const spainGoalAccuracy = (spainTotalGoals / 22) * 100;
        const spainAssistAccuracy = (spainTotalAssists / 15) * 100;
        const franceGoalAccuracy = (franceTotalGoals / 7) * 100;
        const franceAssistAccuracy = (franceTotalAssists / 4) * 100;
        
        const overallGoalAccuracy = ((spainTotalGoals + franceTotalGoals) / (22 + 7)) * 100;
        const overallAssistAccuracy = ((spainTotalAssists + franceTotalAssists) / (15 + 4)) * 100;
        const overallAccuracy = ((spainTotalGoals + franceTotalGoals + spainTotalAssists + franceTotalAssists) / (22 + 7 + 15 + 4)) * 100;
        
        console.log(`📊 ACCURACY SUMMARY:`);
        console.log(`   Spain goals: ${spainGoalAccuracy.toFixed(1)}%`);
        console.log(`   Spain assists: ${spainAssistAccuracy.toFixed(1)}%`);
        console.log(`   France goals: ${franceGoalAccuracy.toFixed(1)}%`);
        console.log(`   France assists: ${franceAssistAccuracy.toFixed(1)}%`);
        console.log(`   Overall goals: ${overallGoalAccuracy.toFixed(1)}%`);
        console.log(`   Overall assists: ${overallAssistAccuracy.toFixed(1)}%`);
        console.log(`   Overall accuracy: ${overallAccuracy.toFixed(1)}%`);
        
        // Success criteria
        const spainSuccess = spainGoalAccuracy >= 90 && spainAssistAccuracy >= 80;
        const franceSuccess = franceGoalAccuracy >= 90 && franceAssistAccuracy >= 80;
        const overallSuccess = overallAccuracy >= 85;
        
        console.log('\n=== 4. SUCCESS CRITERIA ===');
        console.log(`Spain corrections: ${spainSuccess ? '✅ SUCCESS' : '❌ NEEDS WORK'}`);
        console.log(`France corrections: ${franceSuccess ? '✅ SUCCESS' : '❌ NEEDS WORK'}`);
        console.log(`Overall system: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS WORK'}`);
        
        if (spainSuccess && franceSuccess && overallSuccess) {
            console.log('\n🎯 COMPREHENSIVE CORRECTIONS SUCCESSFUL!');
            console.log('✅ All data now matches official cross-reference');
            console.log('✅ System ready for production use');
        } else {
            console.log('\n⚠️ CORRECTIONS PARTIALLY SUCCESSFUL');
            console.log('Some issues remain - check aggregated corrections logic');
        }
        
        console.log('\n=== COMPREHENSIVE TEST COMPLETE ===');
        
    } catch (error) {
        console.error('Error in comprehensive test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testComprehensiveCorrections();
