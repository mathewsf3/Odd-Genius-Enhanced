const playerStatsEnhancementService = require('./src/services/playerStatsEnhancementService');

async function debugMatchKeys() {
    console.log('=== DEBUGGING MATCH KEY GENERATION ===');
    console.log('=== FINDING WHY CORRECTIONS AREN\'T APPLIED ===\n');
    
    try {
        // Test match key generation with different scenarios
        const testMatches = [
            {
                homeTeamName: 'Spain',
                awayTeamName: 'Switzerland',
                date: '2024-09-08T00:00:00Z'
            },
            {
                homeTeamName: 'Spain',
                awayTeamName: 'Switzerland',
                date: '2024-11-18T00:00:00Z'
            },
            {
                homeTeamName: 'Switzerland',
                awayTeamName: 'Spain',
                date: '2024-09-08T00:00:00Z'
            },
            {
                homeTeamName: 'Spain',
                awayTeamName: 'Netherlands',
                date: '2025-03-23T00:00:00Z'
            }
        ];
        
        console.log('Testing match key generation:');
        testMatches.forEach((match, index) => {
            // We need to access the internal function, so let's test the logic manually
            const date = match.date.split('T')[0].replace(/-/g, '');
            
            let opponent = '';
            if (match.homeTeamName === 'Spain') {
                opponent = match.awayTeamName;
            } else if (match.awayTeamName === 'Spain') {
                opponent = match.homeTeamName;
            }
            
            opponent = opponent.toLowerCase()
                .replace(/\s+/g, '')
                .replace('netherlands', 'netherlands')
                .replace('switzerland', 'switzerland')
                .replace('denmark', 'denmark')
                .replace('serbia', 'serbia')
                .replace('england', 'england')
                .replace('france', 'france');
            
            const matchKey = `spain_${opponent}_${date}`;
            
            console.log(`${index + 1}. ${match.homeTeamName} vs ${match.awayTeamName} (${match.date})`);
            console.log(`   Generated key: ${matchKey}`);
            
            // Check if this key exists in corrections
            const corrections = playerStatsEnhancementService.MATCH_DATA_CORRECTIONS;
            const hasCorrections = corrections && corrections[matchKey];
            console.log(`   Has corrections: ${hasCorrections ? '✅' : '❌'}`);
            
            if (hasCorrections) {
                console.log(`   Corrections: ${corrections[matchKey].corrections.length} players`);
                corrections[matchKey].corrections.forEach(correction => {
                    console.log(`     - ${correction.player}: +${correction.goals}G, +${correction.assists}A`);
                });
            }
        });
        
        console.log('\n=== AVAILABLE CORRECTION KEYS ===');
        const corrections = playerStatsEnhancementService.MATCH_DATA_CORRECTIONS;
        if (corrections) {
            Object.keys(corrections).forEach(key => {
                console.log(`   ${key}: ${corrections[key].corrections.length} corrections`);
            });
        } else {
            console.log('❌ No corrections object found');
        }
        
        console.log('\n=== TESTING PLAYER NAME NORMALIZATION ===');
        const testPlayers = ['Joselu', 'Fabián Ruiz', 'Ferran Torres', 'Bryan Gil', 'Bryan Zaragoza'];
        
        testPlayers.forEach(player => {
            const normalized = playerStatsEnhancementService.normalizePlayerName(player);
            console.log(`   "${player}" → "${normalized}"`);
        });
        
        console.log('\n=== TESTING CORRECTION LOOKUP ===');
        
        // Test the actual correction function
        const testMatchInfo = {
            homeTeamName: 'Spain',
            awayTeamName: 'Switzerland',
            date: '2024-09-08T00:00:00Z'
        };
        
        testPlayers.forEach(player => {
            // We can't directly call getPlayerCorrections as it's not exported
            // But we can test the logic
            console.log(`Testing corrections for ${player}:`);
            
            // Manual test of the correction logic
            const date = testMatchInfo.date.split('T')[0].replace(/-/g, '');
            const opponent = 'switzerland';
            const matchKey = `spain_${opponent}_${date}`;
            
            console.log(`   Match key: ${matchKey}`);
            
            if (corrections && corrections[matchKey]) {
                const playerCorrection = corrections[matchKey].corrections.find(correction => {
                    const correctionPlayerName = playerStatsEnhancementService.normalizePlayerName(correction.player);
                    const normalizedPlayerName = playerStatsEnhancementService.normalizePlayerName(player);
                    return correctionPlayerName === normalizedPlayerName;
                });
                
                if (playerCorrection) {
                    console.log(`   ✅ Found correction: +${playerCorrection.goals}G, +${playerCorrection.assists}A`);
                } else {
                    console.log(`   ❌ No correction found`);
                }
            } else {
                console.log(`   ❌ No corrections for match key`);
            }
        });
        
        console.log('\n=== DEBUGGING COMPLETE ===');
        
    } catch (error) {
        console.error('Error in debugging:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugMatchKeys();
