const axios = require('axios');

async function debugSpecificMatches() {
    console.log('=== DEBUGGING SPECIFIC MATCHES FOR MISSING PLAYERS ===');
    console.log('=== CHECKING EACH MATCH FROM CROSS-REFERENCE ===\n');
    
    try {
        const API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
        const BASE_URL = 'https://apiv2.allsportsapi.com/football/';
        const spainTeamId = '19';
        
        // Get Spain's recent matches
        const currentDate = new Date().toISOString().split('T')[0];
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const matchesResponse = await axios.get(BASE_URL, {
            params: {
                met: 'Fixtures',
                APIkey: API_KEY,
                teamId: spainTeamId,
                from: oneYearAgo,
                to: currentDate
            }
        });
        
        if (!matchesResponse.data.result) {
            console.log('❌ No matches returned from API');
            return;
        }
        
        const matches = matchesResponse.data.result
            .filter(match => {
                const status = match.event_status || match.status;
                return status === 'Finished' || status === 'finished' || status === 'FT';
            })
            .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        
        console.log('=== OFFICIAL CROSS-REFERENCE MATCHES TO CHECK ===');
        
        const officialMatches = [
            { date: '2024-09-08', opponent: 'Switzerland', expectedScore: '4-1', expectedGoals: ['Joselu', 'Fabián Ruiz', 'Fabián Ruiz', 'Ferran Torres'] },
            { date: '2024-11-18', opponent: 'Switzerland', expectedScore: '3-2', expectedGoals: ['Yeremy Pino', 'Bryan Gil', 'Bryan Zaragoza'] },
            { date: '2024-07-14', opponent: 'England', expectedScore: '2-1', expectedGoals: ['Nico Williams', 'Oyarzabal'] },
            { date: '2024-07-09', opponent: 'France', expectedScore: '2-1', expectedGoals: ['Lamine Yamal', 'Dani Olmo'] }
        ];
        
        for (const officialMatch of officialMatches) {
            console.log(`\n=== CHECKING: ${officialMatch.date} vs ${officialMatch.opponent} (${officialMatch.expectedScore}) ===`);
            
            // Find the match in our API data
            const apiMatch = matches.find(match => {
                const matchDate = match.event_date.split(' ')[0]; // Get just the date part
                const isHome = match.home_team_key == spainTeamId;
                const opponent = isHome ? match.event_away_team : match.event_home_team;
                
                return matchDate === officialMatch.date && 
                       opponent.toLowerCase().includes(officialMatch.opponent.toLowerCase());
            });
            
            if (!apiMatch) {
                console.log(`❌ Match not found in API data for ${officialMatch.date} vs ${officialMatch.opponent}`);
                continue;
            }
            
            console.log(`✅ Found match: ${apiMatch.event_home_team} vs ${apiMatch.event_away_team} (${apiMatch.event_final_result})`);
            console.log(`   Match ID: ${apiMatch.event_key}`);
            console.log(`   Expected score: ${officialMatch.expectedScore}, API score: ${apiMatch.event_final_result}`);
            
            // Get player stats for this match
            const playerStatsResponse = await axios.get(BASE_URL, {
                params: {
                    met: 'Fixtures',
                    APIkey: API_KEY,
                    matchId: apiMatch.event_key,
                    withPlayerStats: 1
                }
            });
            
            if (playerStatsResponse.data.result && playerStatsResponse.data.result[0]) {
                const matchData = playerStatsResponse.data.result[0];
                
                if (matchData.player_stats) {
                    const isSpainHome = matchData.home_team_key == spainTeamId;
                    const spainSide = isSpainHome ? 'home' : 'away';
                    
                    if (matchData.player_stats[spainSide]) {
                        const spainPlayers = matchData.player_stats[spainSide];
                        const playersWithGoals = spainPlayers.filter(p => (p.player_goals || 0) > 0);
                        
                        console.log(`   Spain players with goals (${playersWithGoals.length}):`);
                        playersWithGoals.forEach(player => {
                            console.log(`     ${player.player_name}: ${player.player_goals} goals`);
                        });
                        
                        console.log(`   Expected goals: ${officialMatch.expectedGoals.join(', ')}`);
                        
                        // Check if expected players are found
                        const foundPlayers = [];
                        const missingPlayers = [];
                        
                        officialMatch.expectedGoals.forEach(expectedPlayer => {
                            const found = playersWithGoals.find(p => 
                                p.player_name.toLowerCase().includes(expectedPlayer.toLowerCase()) ||
                                expectedPlayer.toLowerCase().includes(p.player_name.toLowerCase())
                            );
                            
                            if (found) {
                                foundPlayers.push(`${expectedPlayer} ✅ (${found.player_name}: ${found.player_goals})`);
                            } else {
                                missingPlayers.push(`${expectedPlayer} ❌`);
                            }
                        });
                        
                        console.log(`   Found players: ${foundPlayers.join(', ') || 'None'}`);
                        console.log(`   Missing players: ${missingPlayers.join(', ') || 'None'}`);
                        
                        // If there are missing players, show all players for debugging
                        if (missingPlayers.length > 0) {
                            console.log(`   \n   ALL SPAIN PLAYERS IN THIS MATCH:`);
                            spainPlayers.forEach((player, index) => {
                                console.log(`     ${index + 1}. ${player.player_name} - Goals: ${player.player_goals || 0}, Assists: ${player.player_assists || 0}, Minutes: ${player.player_minutes_played || 0}`);
                            });
                        }
                        
                    } else {
                        console.log(`   ❌ No player stats found for Spain (${spainSide} side)`);
                    }
                } else {
                    console.log('   ❌ No player_stats field in match data');
                }
            } else {
                console.log('   ❌ No match data returned for player stats');
            }
        }
        
        console.log('\n=== SUMMARY OF FINDINGS ===');
        console.log('Now let\'s check what our system is actually processing...\n');
        
        // Check what our system is processing
        const systemResponse = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const systemData = systemResponse.data.result;
        
        console.log('=== SYSTEM PROCESSED MATCHES ===');
        console.log(`Game count: ${systemData.homeTeamPlayers.gameCount}`);
        console.log(`Total players: ${systemData.homeTeamPlayers.players.length}`);
        
        const systemPlayersWithGoals = systemData.homeTeamPlayers.players
            .filter(p => (p.playerGoals || 0) > 0)
            .sort((a, b) => b.playerGoals - a.playerGoals);
            
        console.log('\nSystem players with goals (sorted by goals):');
        systemPlayersWithGoals.forEach(player => {
            console.log(`   ${player.playerName}: ${player.playerGoals} goals in ${player.playerMatchPlayed} matches`);
        });
        
        console.log('\n=== CHECKING FOR SPECIFIC MISSING PLAYERS ===');
        
        const missingPlayersToCheck = ['Joselu', 'Fabián Ruiz', 'Ferran Torres'];
        
        missingPlayersToCheck.forEach(playerName => {
            const found = systemData.homeTeamPlayers.players.find(p => 
                p.playerName.toLowerCase().includes(playerName.toLowerCase())
            );
            
            if (found) {
                console.log(`✅ ${playerName}: Found as "${found.playerName}" with ${found.playerGoals} goals`);
            } else {
                console.log(`❌ ${playerName}: NOT FOUND in system data`);
                
                // Check if there's a similar name
                const similar = systemData.homeTeamPlayers.players.find(p => {
                    const name = p.playerName.toLowerCase();
                    const searchName = playerName.toLowerCase();
                    return name.includes(searchName.split(' ')[0]) || searchName.includes(name.split(' ')[0]);
                });
                
                if (similar) {
                    console.log(`   Similar name found: "${similar.playerName}" with ${similar.playerGoals} goals`);
                }
            }
        });
        
        console.log('\n=== DEBUGGING COMPLETE ===');
        
    } catch (error) {
        console.error('Error in debugging:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

debugSpecificMatches();
