const axios = require('axios');

async function debugPlayerDataSource() {
    console.log('=== DEBUGGING PLAYER DATA SOURCE ===');
    console.log('=== FINDING WHY PLAYERS ARE MISSING ===\n');
    
    try {
        // Test the AllSportsAPI directly to see what data we're getting
        const API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
        const BASE_URL = 'https://apiv2.allsportsapi.com/football/';
        
        console.log('=== 1. TESTING SPAIN RECENT MATCHES ===');
        
        // Get Spain's recent matches
        const spainTeamId = '19'; // Spain team ID
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
        
        if (matchesResponse.data.result) {
            const matches = matchesResponse.data.result
                .filter(match => {
                    const status = match.event_status || match.status;
                    return status === 'Finished' || status === 'finished' || status === 'FT';
                })
                .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
                .slice(0, 10);
                
            console.log(`Found ${matches.length} recent finished matches for Spain:`);
            matches.forEach((match, index) => {
                const isHome = match.home_team_key == spainTeamId;
                const opponent = isHome ? match.event_away_team : match.event_home_team;
                const score = `${match.event_final_result || 'N/A'}`;
                console.log(`${index + 1}. ${match.event_date} vs ${opponent} (${score}) - Match ID: ${match.event_key}`);
            });
            
            console.log('\n=== 2. TESTING PLAYER STATS FOR SPECIFIC MATCHES ===');
            
            // Test the problematic match: Spain 4-1 Switzerland (should have Joselu, Fabián Ruiz 2x, Ferran Torres)
            // Let's find this match in our list
            const switzerlandMatch = matches.find(match => 
                (match.event_home_team.includes('Switzerland') || match.event_away_team.includes('Switzerland')) &&
                match.event_final_result && 
                (match.event_final_result.includes('4-1') || match.event_final_result.includes('1-4'))
            );
            
            if (switzerlandMatch) {
                console.log(`\nFound Switzerland match: ${switzerlandMatch.event_date} - ${switzerlandMatch.event_home_team} vs ${switzerlandMatch.event_away_team} (${switzerlandMatch.event_final_result})`);
                console.log(`Match ID: ${switzerlandMatch.event_key}`);
                
                // Get player stats for this specific match
                console.log('\n=== 3. FETCHING PLAYER STATS FOR SWITZERLAND MATCH ===');
                
                const playerStatsResponse = await axios.get(BASE_URL, {
                    params: {
                        met: 'Fixtures',
                        APIkey: API_KEY,
                        matchId: switzerlandMatch.event_key,
                        withPlayerStats: 1
                    }
                });
                
                if (playerStatsResponse.data.result && playerStatsResponse.data.result[0]) {
                    const matchData = playerStatsResponse.data.result[0];
                    console.log('Match data structure:');
                    console.log('Keys:', Object.keys(matchData));
                    
                    if (matchData.player_stats) {
                        console.log('\nPlayer stats structure:');
                        console.log('Player stats keys:', Object.keys(matchData.player_stats));
                        
                        const isSpainHome = matchData.home_team_key == spainTeamId;
                        const spainSide = isSpainHome ? 'home' : 'away';
                        
                        console.log(`\nSpain is playing as: ${spainSide}`);
                        
                        if (matchData.player_stats[spainSide]) {
                            const spainPlayers = matchData.player_stats[spainSide];
                            console.log(`\nFound ${spainPlayers.length} Spain players in this match:`);
                            
                            // Look for the missing players
                            const playersWithGoals = spainPlayers.filter(p => (p.player_goals || 0) > 0);
                            const playersWithAssists = spainPlayers.filter(p => (p.player_assists || 0) > 0);
                            
                            console.log('\n📊 PLAYERS WITH GOALS:');
                            playersWithGoals.forEach(player => {
                                console.log(`   ${player.player_name}: ${player.player_goals} goals`);
                            });
                            
                            console.log('\n📊 PLAYERS WITH ASSISTS:');
                            playersWithAssists.forEach(player => {
                                console.log(`   ${player.player_name}: ${player.player_assists} assists`);
                            });
                            
                            // Check for the specific missing players
                            const joselu = spainPlayers.find(p => p.player_name && p.player_name.toLowerCase().includes('joselu'));
                            const fabian = spainPlayers.find(p => p.player_name && p.player_name.toLowerCase().includes('fabián'));
                            const ferran = spainPlayers.find(p => p.player_name && p.player_name.toLowerCase().includes('ferran'));
                            
                            console.log('\n🔍 CHECKING FOR MISSING PLAYERS:');
                            console.log(`   Joselu: ${joselu ? `Found - ${joselu.player_name} (${joselu.player_goals} goals)` : 'NOT FOUND'}`);
                            console.log(`   Fabián Ruiz: ${fabian ? `Found - ${fabian.player_name} (${fabian.player_goals} goals)` : 'NOT FOUND'}`);
                            console.log(`   Ferran Torres: ${ferran ? `Found - ${ferran.player_name} (${ferran.player_goals} goals)` : 'NOT FOUND'}`);
                            
                            // Show all players for debugging
                            console.log('\n📋 ALL SPAIN PLAYERS IN THIS MATCH:');
                            spainPlayers.forEach((player, index) => {
                                console.log(`   ${index + 1}. ${player.player_name} - Goals: ${player.player_goals || 0}, Assists: ${player.player_assists || 0}, Minutes: ${player.player_minutes_played || 0}`);
                            });
                            
                        } else {
                            console.log(`❌ No player stats found for Spain (${spainSide} side)`);
                        }
                    } else {
                        console.log('❌ No player_stats field in match data');
                        console.log('Available fields:', Object.keys(matchData));
                    }
                } else {
                    console.log('❌ No match data returned for player stats');
                }
            } else {
                console.log('❌ Could not find Spain vs Switzerland 4-1 match in recent matches');
                console.log('Available matches:');
                matches.forEach(match => {
                    const isHome = match.home_team_key == spainTeamId;
                    const opponent = isHome ? match.event_away_team : match.event_home_team;
                    console.log(`   ${match.event_date} vs ${opponent} (${match.event_final_result})`);
                });
            }
            
            console.log('\n=== 4. TESTING ANOTHER RECENT MATCH ===');
            
            // Test the most recent match
            if (matches.length > 0) {
                const recentMatch = matches[0];
                console.log(`\nTesting most recent match: ${recentMatch.event_date} - ${recentMatch.event_home_team} vs ${recentMatch.event_away_team}`);
                
                const recentPlayerStatsResponse = await axios.get(BASE_URL, {
                    params: {
                        met: 'Fixtures',
                        APIkey: API_KEY,
                        matchId: recentMatch.event_key,
                        withPlayerStats: 1
                    }
                });
                
                if (recentPlayerStatsResponse.data.result && recentPlayerStatsResponse.data.result[0]) {
                    const matchData = recentPlayerStatsResponse.data.result[0];
                    
                    if (matchData.player_stats) {
                        const isSpainHome = matchData.home_team_key == spainTeamId;
                        const spainSide = isSpainHome ? 'home' : 'away';
                        
                        if (matchData.player_stats[spainSide]) {
                            const spainPlayers = matchData.player_stats[spainSide];
                            const playersWithGoals = spainPlayers.filter(p => (p.player_goals || 0) > 0);
                            
                            console.log(`Found ${playersWithGoals.length} Spain players with goals:`);
                            playersWithGoals.forEach(player => {
                                console.log(`   ${player.player_name}: ${player.player_goals} goals`);
                            });
                        }
                    }
                }
            }
            
        } else {
            console.log('❌ No matches returned from API');
        }
        
        console.log('\n=== 5. TESTING OUR SYSTEM DATA ===');
        
        // Compare with our system
        const systemResponse = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const systemData = systemResponse.data.result;
        
        console.log('\nSystem data structure:');
        console.log('Keys:', Object.keys(systemData));
        console.log(`Home team players: ${systemData.homeTeamPlayers.players.length}`);
        console.log(`Game count: ${systemData.homeTeamPlayers.gameCount}`);
        
        const systemPlayersWithGoals = systemData.homeTeamPlayers.players.filter(p => (p.playerGoals || 0) > 0);
        console.log('\nSystem players with goals:');
        systemPlayersWithGoals.forEach(player => {
            console.log(`   ${player.playerName}: ${player.playerGoals} goals`);
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

debugPlayerDataSource();
