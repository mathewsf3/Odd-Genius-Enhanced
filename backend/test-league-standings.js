const allSportsApiService = require('./src/services/allSportsApiService');

async function testLeagueStandings() {
  try {
    console.log('🔍 Testing league standings for match 1569357...');
    
    // First, get the match details to find the league ID
    console.log('\n1. Getting match details...');
    const matchDetails = await allSportsApiService.getMatchStats('1569357');
    
    if (!matchDetails) {
      console.log('❌ Match not found');
      return;
    }
    
    console.log('📋 Match details:', {
      homeTeam: matchDetails.homeTeam?.name,
      awayTeam: matchDetails.awayTeam?.name,
      league: matchDetails.league?.name,
      leagueId: matchDetails.league?.id
    });
    
    if (!matchDetails.league?.id) {
      console.log('❌ No league ID found in match details');
      return;
    }
    
    // Test league standings
    console.log('\n2. Getting league standings...');
    const standings = await allSportsApiService.getLeagueStandings(matchDetails.league.id);
    
    if (!standings) {
      console.log('❌ No standings data returned');
      return;
    }
    
    console.log('📊 League standings result:', {
      leagueName: standings.league?.name,
      teamsCount: standings.standings?.length,
      hasStandings: !!standings.standings
    });
    
    if (standings.standings && standings.standings.length > 0) {
      console.log('\n3. Checking for duplicates...');
      
      // Check for duplicate team IDs
      const teamIds = standings.standings.map(team => team.team.id);
      const uniqueTeamIds = [...new Set(teamIds)];
      
      console.log('📋 Team analysis:', {
        totalTeams: teamIds.length,
        uniqueTeams: uniqueTeamIds.length,
        hasDuplicates: teamIds.length !== uniqueTeamIds.length
      });
      
      if (teamIds.length !== uniqueTeamIds.length) {
        console.log('⚠️ DUPLICATES FOUND!');
        
        // Find duplicates
        const duplicates = teamIds.filter((id, index) => teamIds.indexOf(id) !== index);
        const uniqueDuplicates = [...new Set(duplicates)];
        
        console.log('🔍 Duplicate team IDs:', uniqueDuplicates);
        
        // Show duplicate entries
        uniqueDuplicates.forEach(duplicateId => {
          const duplicateEntries = standings.standings.filter(team => team.team.id === duplicateId);
          console.log(`\n📋 Duplicate entries for team ID ${duplicateId}:`);
          duplicateEntries.forEach((entry, index) => {
            console.log(`  Entry ${index + 1}:`, {
              position: entry.position,
              name: entry.team.name,
              points: entry.points,
              played: entry.played
            });
          });
        });
      } else {
        console.log('✅ No duplicates found in team IDs');
      }
      
      // Check for duplicate positions
      const positions = standings.standings.map(team => team.position);
      const uniquePositions = [...new Set(positions)];
      
      if (positions.length !== uniquePositions.length) {
        console.log('⚠️ Duplicate positions found!');
        const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
        console.log('🔍 Duplicate positions:', [...new Set(duplicatePositions)]);
      } else {
        console.log('✅ No duplicate positions found');
      }
      
      // Show first few teams
      console.log('\n4. First 5 teams in standings:');
      standings.standings.slice(0, 5).forEach(team => {
        console.log(`  ${team.position}. ${team.team.name} - ${team.points} pts (${team.played} played)`);
      });
    }
    
    console.log('\n🏁 League standings test completed');
    
  } catch (error) {
    console.error('❌ League standings test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testLeagueStandings().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
