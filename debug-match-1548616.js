// Debug script for match 1548616
const axios = require('axios');

async function debugMatch() {
  console.log('🔍 Debugging Match 1548616...');
  
  try {
    // Get match data
    const response = await axios.get('http://localhost:5000/api/matches/1548616');
    
    console.log('\n📊 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data?.result) {
      const match = response.data.result;
      console.log('\n🏠 Home Team:');
      console.log('- ID:', match.homeTeam?.id);
      console.log('- Name:', match.homeTeam?.name);
      console.log('- Logo:', match.homeTeam?.logo);
      
      console.log('\n🏃 Away Team:');
      console.log('- ID:', match.awayTeam?.id);
      console.log('- Name:', match.awayTeam?.name);
      console.log('- Logo:', match.awayTeam?.logo);
      
      console.log('\n⚽ Match Info:');
      console.log('- Date:', match.date);
      console.log('- Time:', match.time);
      console.log('- Status:', match.status);
      console.log('- League:', match.league?.name);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugMatch();
