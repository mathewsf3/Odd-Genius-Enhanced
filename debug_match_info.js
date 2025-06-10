const axios = require('axios');

async function debugMatchInfo() {
    console.log('=== DEBUGGING MATCH INFO FOR ENHANCEMENT ===');
    console.log('=== CHECKING WHAT MATCH DATA IS BEING PASSED ===\n');
    
    try {
        // Get the match details first
        const matchResponse = await axios.get('http://localhost:5000/api/matches/1559456');
        const match = matchResponse.data.result;
        
        console.log('=== 1. MATCH DETAILS ===');
        console.log('Match ID:', 1559456);
        console.log('Home Team:', match.homeTeam.name);
        console.log('Away Team:', match.awayTeam.name);
        console.log('Date:', match.date);
        console.log('Event Date:', match.event_date);
        console.log('Status:', match.status);
        console.log('Score:', match.score);
        
        console.log('\n=== 2. MATCH OBJECT STRUCTURE ===');
        console.log('Keys:', Object.keys(match));
        
        // Test match key generation manually
        console.log('\n=== 3. TESTING MATCH KEY GENERATION ===');
        
        const testMatchInfo = {
            matchId: 1559456,
            homeTeamName: match.homeTeam.name,
            awayTeamName: match.awayTeam.name,
            date: match.date || match.event_date || new Date().toISOString()
        };
        
        console.log('Match info for enhancement:', testMatchInfo);
        
        // Manual match key generation
        const date = testMatchInfo.date.split('T')[0].replace(/-/g, '');
        
        let opponent = '';
        if (testMatchInfo.homeTeamName === 'Spain') {
            opponent = testMatchInfo.awayTeamName;
        } else if (testMatchInfo.awayTeamName === 'Spain') {
            opponent = testMatchInfo.homeTeamName;
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
        
        console.log('Generated match key:', matchKey);
        
        // Check if this is a historical match that should have corrections
        const expectedKeys = [
            'spain_switzerland_20241118',
            'spain_switzerland_20240908',
            'spain_denmark_20241115',
            'spain_serbia_20241015',
            'spain_netherlands_20250323',
            'spain_netherlands_20250320',
            'spain_england_20240714',
            'spain_france_20240709'
        ];
        
        console.log('\nExpected correction keys:', expectedKeys);
        console.log('Generated key matches expected:', expectedKeys.includes(matchKey) ? '✅' : '❌');
        
        if (!expectedKeys.includes(matchKey)) {
            console.log('\n⚠️ This match is not in our correction database');
            console.log('This is likely a future/upcoming match, not a historical one');
            console.log('Corrections are only applied to historical matches with known data issues');
        }
        
        console.log('\n=== 4. TESTING PLAYER STATS REQUEST ===');
        
        // Test the actual player stats request to see what's happening
        const playerStatsResponse = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const playerStats = playerStatsResponse.data.result;
        
        console.log('Player stats enhanced:', playerStats.enhanced);
        console.log('Enhancement timestamp:', playerStats.enhancementTimestamp);
        
        if (playerStats.validation) {
            console.log('Validation status:', playerStats.validation.status);
            console.log('Validation accuracy:', playerStats.validation.accuracy);
        }
        
        // Check for players with corrections
        const playersWithCorrections = playerStats.homeTeamPlayers.players.filter(p => p.hasCorrections);
        console.log('Players with corrections:', playersWithCorrections.length);
        
        playersWithCorrections.forEach(player => {
            console.log(`  ${player.playerName}: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
        });
        
        console.log('\n=== 5. CONCLUSION ===');
        
        if (expectedKeys.includes(matchKey)) {
            console.log('✅ This match should have corrections applied');
            if (playersWithCorrections.length > 0) {
                console.log('✅ Corrections are being applied successfully');
            } else {
                console.log('❌ Corrections are NOT being applied - there\'s a bug');
            }
        } else {
            console.log('ℹ️ This match is not expected to have corrections');
            console.log('This is normal for upcoming/future matches');
            console.log('Historical data corrections only apply to past matches with known issues');
        }
        
        console.log('\n=== DEBUGGING COMPLETE ===');
        
    } catch (error) {
        console.error('Error in debugging:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugMatchInfo();
