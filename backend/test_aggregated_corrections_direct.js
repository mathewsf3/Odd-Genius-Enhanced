const playerStatsEnhancementService = require('./backend/src/services/playerStatsEnhancementService');

async function testAggregatedCorrections() {
    console.log('=== TESTING AGGREGATED CORRECTIONS DIRECTLY ===');
    console.log('=== VERIFYING CORRECTION LOGIC ===\n');
    
    try {
        // Test data structure similar to what the API returns
        const testPlayerStats = {
            homeTeamPlayers: {
                players: [
                    { playerName: 'Joselu', playerGoals: 0, playerAssists: 0, playerMatchPlayed: 3 },
                    { playerName: 'Fabián Ruiz', playerGoals: 0, playerAssists: 1, playerMatchPlayed: 8 },
                    { playerName: 'Ferran Torres', playerGoals: 0, playerAssists: 0, playerMatchPlayed: 5 },
                    { playerName: 'Bryan Gil', playerGoals: 0, playerAssists: 0, playerMatchPlayed: 1 },
                    { playerName: 'Bryan Zaragoza', playerGoals: 0, playerAssists: 0, playerMatchPlayed: 3 },
                    { playerName: 'Mikel Oyarzabal', playerGoals: 4, playerAssists: 0, playerMatchPlayed: 8 }
                ],
                gameCount: 10
            },
            awayTeamPlayers: {
                players: [
                    { playerName: 'Adrien Rabiot', playerGoals: 0, playerAssists: 0, playerMatchPlayed: 5 },
                    { playerName: 'Lucas Digne', playerGoals: 0, playerAssists: 1, playerMatchPlayed: 5 },
                    { playerName: 'Michael Olise', playerGoals: 1, playerAssists: 1, playerMatchPlayed: 3 },
                    { playerName: 'Ousmane Dembélé', playerGoals: 1, playerAssists: 0, playerMatchPlayed: 4 },
                    { playerName: 'Randal Kolo Muani', playerGoals: 2, playerAssists: 0, playerMatchPlayed: 5 }
                ],
                gameCount: 5
            }
        };
        
        // Test match info for Spain
        const spainMatchInfo = {
            homeTeamName: 'Spain',
            awayTeamName: 'France',
            date: '2025-06-05'
        };
        
        console.log('=== 1. TESTING SPAIN CORRECTIONS ===');
        console.log('Original Spain players:');
        testPlayerStats.homeTeamPlayers.players.forEach(player => {
            console.log(`  ${player.playerName}: ${player.playerGoals}G, ${player.playerAssists}A`);
        });
        
        // Apply enhancements
        const enhancedStats = playerStatsEnhancementService.enhancePlayerStats(testPlayerStats, spainMatchInfo);
        
        console.log('\nEnhanced Spain players:');
        enhancedStats.homeTeamPlayers.players.forEach(player => {
            const hasCorrections = player.hasCorrections ? ' (CORRECTED)' : '';
            console.log(`  ${player.playerName}: ${player.playerGoals}G, ${player.playerAssists}A${hasCorrections}`);
            if (player.hasCorrections) {
                console.log(`    Corrections: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
                if (player.correctionDetails.appliedCorrections) {
                    console.log(`    Applied from: ${player.correctionDetails.appliedCorrections.map(c => c.matchKey).join(', ')}`);
                }
            }
        });
        
        // Test match info for France
        const franceMatchInfo = {
            homeTeamName: 'Spain',
            awayTeamName: 'France',
            date: '2025-06-05'
        };
        
        console.log('\n=== 2. TESTING FRANCE CORRECTIONS ===');
        console.log('Original France players:');
        testPlayerStats.awayTeamPlayers.players.forEach(player => {
            console.log(`  ${player.playerName}: ${player.playerGoals}G, ${player.playerAssists}A`);
        });
        
        // Apply enhancements to France (away team)
        const enhancedFranceStats = playerStatsEnhancementService.enhancePlayerStats(testPlayerStats, franceMatchInfo);
        
        console.log('\nEnhanced France players:');
        enhancedFranceStats.awayTeamPlayers.players.forEach(player => {
            const hasCorrections = player.hasCorrections ? ' (CORRECTED)' : '';
            console.log(`  ${player.playerName}: ${player.playerGoals}G, ${player.playerAssists}A${hasCorrections}`);
            if (player.hasCorrections) {
                console.log(`    Corrections: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
                if (player.correctionDetails.appliedCorrections) {
                    console.log(`    Applied from: ${player.correctionDetails.appliedCorrections.map(c => c.matchKey).join(', ')}`);
                }
            }
        });
        
        console.log('\n=== 3. TESTING INDIVIDUAL CORRECTION LOOKUP ===');
        
        // Test individual players
        const testPlayers = ['Joselu', 'Fabián Ruiz', 'Ferran Torres', 'Adrien Rabiot', 'Lucas Digne'];
        
        testPlayers.forEach(playerName => {
            console.log(`\nTesting corrections for ${playerName}:`);
            
            // We need to access the internal function, so let's test manually
            const normalizedName = playerStatsEnhancementService.normalizePlayerName(playerName);
            console.log(`  Normalized name: ${normalizedName}`);
            
            // Check available corrections
            const corrections = playerStatsEnhancementService.MATCH_DATA_CORRECTIONS;
            let totalCorrections = { goals: 0, assists: 0 };
            let appliedCorrections = [];
            
            Object.entries(corrections).forEach(([matchKey, matchData]) => {
                if (matchData.corrections) {
                    const playerCorrection = matchData.corrections.find(correction => {
                        const correctionPlayerName = playerStatsEnhancementService.normalizePlayerName(correction.player);
                        return correctionPlayerName === normalizedName;
                    });
                    
                    if (playerCorrection) {
                        totalCorrections.goals += playerCorrection.goals || 0;
                        totalCorrections.assists += playerCorrection.assists || 0;
                        appliedCorrections.push({
                            matchKey: matchKey,
                            goals: playerCorrection.goals || 0,
                            assists: playerCorrection.assists || 0
                        });
                    }
                }
            });
            
            console.log(`  Total corrections: +${totalCorrections.goals}G, +${totalCorrections.assists}A`);
            console.log(`  Applied from ${appliedCorrections.length} matches:`);
            appliedCorrections.forEach(correction => {
                console.log(`    ${correction.matchKey}: +${correction.goals}G, +${correction.assists}A`);
            });
        });
        
        console.log('\n=== 4. AVAILABLE CORRECTION KEYS ===');
        const corrections = playerStatsEnhancementService.MATCH_DATA_CORRECTIONS;
        Object.keys(corrections).forEach(key => {
            console.log(`  ${key}: ${corrections[key].corrections.length} corrections`);
        });
        
        console.log('\n=== DIRECT TEST COMPLETE ===');
        
    } catch (error) {
        console.error('Error in direct test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAggregatedCorrections();
