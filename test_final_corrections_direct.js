const axios = require('axios');

console.log('=== TESTING FINAL CORRECTIONS DIRECTLY ===');
console.log('=== VERIFYING CONTROLLER-LEVEL CORRECTIONS ===');

async function testFinalCorrections() {
  try {
    // Test Spain vs France match (ID: 1559456)
    console.log('\n=== 1. TESTING SPAIN VS FRANCE MATCH ===');
    const response = await axios.get('http://localhost:5000/api/matches/1559456/player-stats?matches=10');
    
    if (response.data.success) {
      const playerStats = response.data.result;
      
      console.log('✅ Player stats fetched successfully');
      console.log(`Enhanced: ${playerStats.enhanced}`);
      console.log(`Enhancement timestamp: ${playerStats.enhancementTimestamp}`);
      
      // Check Spain team
      const spainTeam = playerStats.homeTeamPlayers || playerStats.awayTeamPlayers;
      if (spainTeam && spainTeam.players) {
        console.log(`\n=== SPAIN TEAM VERIFICATION ===`);
        console.log(`Total players: ${spainTeam.players.length}`);
        
        // Check specific players that should have corrections
        const playersToCheck = ['Joselu', 'Fabián Ruiz', 'Ferran Torres'];
        
        playersToCheck.forEach(playerName => {
          const player = spainTeam.players.find(p => 
            p.playerName === playerName || p.originalName === playerName
          );
          
          if (player) {
            console.log(`\n${playerName}:`);
            console.log(`  Goals: ${player.playerGoals || 0}`);
            console.log(`  Assists: ${player.playerAssists || 0}`);
            console.log(`  Has corrections: ${player.hasCorrections || false}`);
            console.log(`  Correction details: ${JSON.stringify(player.correctionDetails || {})}`);
          } else {
            console.log(`\n${playerName}: ❌ NOT FOUND`);
          }
        });
        
        // Calculate totals
        const totalGoals = spainTeam.players.reduce((sum, p) => sum + (p.playerGoals || 0), 0);
        const totalAssists = spainTeam.players.reduce((sum, p) => sum + (p.playerAssists || 0), 0);
        
        console.log(`\n=== SPAIN TOTALS ===`);
        console.log(`Total goals: ${totalGoals}`);
        console.log(`Total assists: ${totalAssists}`);
        console.log(`Expected goals: 22`);
        console.log(`Expected assists: 15`);
        console.log(`Goals accuracy: ${((totalGoals / 22) * 100).toFixed(1)}%`);
        console.log(`Assists accuracy: ${((totalAssists / 15) * 100).toFixed(1)}%`);
        
        if (totalGoals >= 22 && totalAssists >= 15) {
          console.log('✅ SPAIN CORRECTIONS SUCCESSFUL');
        } else {
          console.log('❌ SPAIN CORRECTIONS INCOMPLETE');
        }
      }
      
      // Check France team
      const franceTeam = playerStats.awayTeamPlayers || playerStats.homeTeamPlayers;
      if (franceTeam && franceTeam.players && franceTeam !== spainTeam) {
        console.log(`\n=== FRANCE TEAM VERIFICATION ===`);
        console.log(`Total players: ${franceTeam.players.length}`);
        
        // Check specific players that should have corrections
        const playersToCheck = ['Adrien Rabiot', 'Lucas Digne'];
        
        playersToCheck.forEach(playerName => {
          const player = franceTeam.players.find(p => 
            p.playerName === playerName || p.originalName === playerName
          );
          
          if (player) {
            console.log(`\n${playerName}:`);
            console.log(`  Goals: ${player.playerGoals || 0}`);
            console.log(`  Assists: ${player.playerAssists || 0}`);
            console.log(`  Has corrections: ${player.hasCorrections || false}`);
            console.log(`  Correction details: ${JSON.stringify(player.correctionDetails || {})}`);
          } else {
            console.log(`\n${playerName}: ❌ NOT FOUND`);
          }
        });
        
        // Calculate totals
        const totalGoals = franceTeam.players.reduce((sum, p) => sum + (p.playerGoals || 0), 0);
        const totalAssists = franceTeam.players.reduce((sum, p) => sum + (p.playerAssists || 0), 0);
        
        console.log(`\n=== FRANCE TOTALS ===`);
        console.log(`Total goals: ${totalGoals}`);
        console.log(`Total assists: ${totalAssists}`);
        console.log(`Expected goals: 7`);
        console.log(`Expected assists: 4`);
        console.log(`Goals accuracy: ${((totalGoals / 7) * 100).toFixed(1)}%`);
        console.log(`Assists accuracy: ${((totalAssists / 4) * 100).toFixed(1)}%`);
        
        if (totalGoals >= 7 && totalAssists >= 4) {
          console.log('✅ FRANCE CORRECTIONS SUCCESSFUL');
        } else {
          console.log('❌ FRANCE CORRECTIONS INCOMPLETE');
        }
      }
      
    } else {
      console.log('❌ Failed to fetch player stats:', response.data.error);
    }
    
  } catch (error) {
    console.log('❌ Error testing final corrections:', error.message);
  }
}

testFinalCorrections().then(() => {
  console.log('\n=== FINAL CORRECTIONS TEST COMPLETE ===');
});
