// Test script to verify Recent Form calculation
// Run this in browser console on the match page

console.log('🔍 Testing Recent Form Calculation...');

// Function to test the form calculation logic
function testFormCalculation() {
  // Mock data based on your analysis
  const bragantino = {
    teamId: '4948', // Bragantino ID
    teamName: 'Bragantino',
    fixtures: [
      {
        event_date: '2025-05-22',
        event_home_team_id: '4948',
        event_away_team_id: '5025', // Criciúma
        event_home_team: 'Bragantino',
        event_away_team: 'Criciúma',
        event_final_result: '6 - 0',
        event_status: 'Finished'
      },
      {
        event_date: '2025-05-18',
        event_home_team_id: '4948',
        event_away_team_id: '4947', // Palmeiras
        event_home_team: 'Bragantino',
        event_away_team: 'Palmeiras',
        event_final_result: '1 - 2',
        event_status: 'Finished'
      },
      {
        event_date: '2025-05-10',
        event_home_team_id: '4950', // Grêmio
        event_away_team_id: '4948',
        event_home_team: 'Grêmio',
        event_away_team: 'Bragantino',
        event_final_result: '1 - 1',
        event_status: 'Finished'
      },
      {
        event_date: '2025-05-05',
        event_home_team_id: '4948',
        event_away_team_id: '5030', // Mirassol
        event_home_team: 'Bragantino',
        event_away_team: 'Mirassol',
        event_final_result: '1 - 0',
        event_status: 'Finished'
      },
      {
        event_date: '2025-05-01',
        event_home_team_id: '5025', // Criciúma
        event_away_team_id: '4948',
        event_home_team: 'Criciúma',
        event_away_team: 'Bragantino',
        event_final_result: '0 - 1',
        event_status: 'Finished'
      }
    ]
  };

  console.log('📊 Processing Bragantino fixtures...');
  
  const formResults = [];
  
  bragantino.fixtures.forEach((fixture, index) => {
    const homeTeamId = fixture.event_home_team_id;
    const awayTeamId = fixture.event_away_team_id;
    const homeTeamName = fixture.event_home_team;
    const awayTeamName = fixture.event_away_team;
    const matchDate = fixture.event_date;
    
    // Extract scores
    const scoreParts = fixture.event_final_result.split(' - ');
    const homeScore = parseInt(scoreParts[0]);
    const awayScore = parseInt(scoreParts[1]);
    
    // Determine if Bragantino was home or away
    const isHome = String(homeTeamId) === String(bragantino.teamId);
    const opponent = isHome ? awayTeamName : homeTeamName;
    const teamScore = isHome ? homeScore : awayScore;
    const opponentScore = isHome ? awayScore : homeScore;
    
    // Determine result
    let result;
    if (teamScore > opponentScore) {
      result = 'W';
    } else if (teamScore < opponentScore) {
      result = 'L';
    } else {
      result = 'D';
    }
    
    console.log(`Match ${index + 1}: ${matchDate} - ${isHome ? 'HOME' : 'AWAY'} vs ${opponent} - Score: ${teamScore}-${opponentScore} - Result: ${result}`);
    
    formResults.push({
      result,
      score: `${teamScore}-${opponentScore}`,
      opponent,
      date: matchDate,
      isHome
    });
  });
  
  const formSequence = formResults.map(r => r.result).join('');
  console.log(`✅ Expected form sequence for Bragantino: ${formSequence} (most recent first)`);
  console.log('📝 This should match: W D D W W');
  
  return formResults;
}

// Run the test
testFormCalculation();

console.log('🎯 To verify on the actual page:');
console.log('1. Open browser DevTools');
console.log('2. Go to the match page: http://localhost:3000/match/1544012');
console.log('3. Look for [TeamFormService] logs in console');
console.log('4. Check if the form badges match the expected sequence');
