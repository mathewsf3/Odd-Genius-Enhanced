const axios = require('axios');

async function testDuplicateCheck() {
  try {
    console.log('🔍 Testing for duplicate teams in league standings...');

    // Test the league endpoint directly for Belgian league (match 1569357)
    const response = await axios.get('http://localhost:5000/api/leagues/63/standings', {
      timeout: 30000
    });

    if (!response.data || !response.data.success) {
      console.log('❌ Invalid response from league endpoint');
      return;
    }

    const standings = response.data.result?.standings;

    if (!standings || standings.length === 0) {
      console.log('❌ No standings data found');
      return;
    }

    console.log(`📊 Found ${standings.length} teams in standings`);

    // Check for duplicate team IDs
    const teamIds = standings.map(team => team.team.id);
    const uniqueTeamIds = [...new Set(teamIds)];

    console.log('📋 Team ID analysis:', {
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
        const duplicateEntries = standings.filter(team => team.team.id === duplicateId);
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

      // Show fix suggestion
      console.log('\n💡 Fix suggestion: Add deduplication logic in backend');
    } else {
      console.log('✅ No duplicates found in team IDs');
    }

    // Check for duplicate positions
    const positions = standings.map(team => team.position);
    const uniquePositions = [...new Set(positions)];

    if (positions.length !== uniquePositions.length) {
      console.log('⚠️ Duplicate positions found!');
      const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
      console.log('🔍 Duplicate positions:', [...new Set(duplicatePositions)]);
    } else {
      console.log('✅ No duplicate positions found');
    }

    // Show first few teams
    console.log('\n📋 First 5 teams in standings:');
    standings.slice(0, 5).forEach(team => {
      console.log(`  ${team.position}. ${team.team.name} (ID: ${team.team.id}) - ${team.points} pts`);
    });

    console.log('\n🏁 Duplicate check completed');

  } catch (error) {
    console.error('❌ Duplicate check failed:', error.message);
    if (error.response) {
      console.error('📋 Error details:', {
        status: error.response.status,
        statusText: error.response.statusText
      });
    }
  }
}

// Run the test
testDuplicateCheck().then(() => {
  console.log('✅ Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
