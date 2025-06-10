const axios = require('axios');

async function testSpecificMatch() {
  try {
    console.log('🧪 Testing H2H endpoint for match ID 1569357...');
    
    const matchId = '1569357';
    const response = await axios.get(`http://localhost:5000/api/matches/${matchId}/h2h`, {
      timeout: 15000
    });
    
    if (response.data?.success && response.data.result) {
      const h2hData = response.data.result;
      
      console.log('\n📊 H2H Data Structure for Match 1569357:');
      console.log('- First Team:', h2hData.firstTeam?.name, '| Logo:', h2hData.firstTeam?.logo ? '✅' : '❌');
      console.log('- Second Team:', h2hData.secondTeam?.name, '| Logo:', h2hData.secondTeam?.logo ? '✅' : '❌');
      console.log('- Total Matches:', h2hData.matches?.length || 0);
      
      if (h2hData.firstTeam?.logo) {
        console.log('- First Team Logo URL:', h2hData.firstTeam.logo);
      }
      if (h2hData.secondTeam?.logo) {
        console.log('- Second Team Logo URL:', h2hData.secondTeam.logo);
      }
      
      if (h2hData.matches && h2hData.matches.length > 0) {
        console.log('\n🔍 Individual Match Logo Analysis:');
        
        h2hData.matches.forEach((match, index) => {
          console.log(`\nMatch ${index + 1}:`);
          console.log(`  Date: ${match.date}`);
          console.log(`  Home: ${match.homeTeam?.name} | Logo: ${match.homeTeam?.logo ? '✅' : '❌'}`);
          console.log(`  Away: ${match.awayTeam?.name} | Logo: ${match.awayTeam?.logo ? '✅' : '❌'}`);
          console.log(`  Score: ${match.score?.home || 0} - ${match.score?.away || 0}`);
          
          if (match.homeTeam?.logo) {
            console.log(`  Home Logo URL: ${match.homeTeam.logo}`);
          }
          if (match.awayTeam?.logo) {
            console.log(`  Away Logo URL: ${match.awayTeam.logo}`);
          }
          
          // Only show first 3 matches to avoid too much output
          if (index >= 2) {
            console.log(`  ... (showing first 3 of ${h2hData.matches.length} matches)`);
            return false;
          }
        });
        
        // Summary
        let matchesWithBothLogos = 0;
        let matchesWithHomeLogos = 0;
        let matchesWithAwayLogos = 0;
        
        h2hData.matches.forEach(match => {
          if (match.homeTeam?.logo) matchesWithHomeLogos++;
          if (match.awayTeam?.logo) matchesWithAwayLogos++;
          if (match.homeTeam?.logo && match.awayTeam?.logo) matchesWithBothLogos++;
        });
        
        console.log(`\n📈 Logo Coverage Summary:`);
        console.log(`  - Matches with home team logos: ${matchesWithHomeLogos}/${h2hData.matches.length}`);
        console.log(`  - Matches with away team logos: ${matchesWithAwayLogos}/${h2hData.matches.length}`);
        console.log(`  - Matches with both team logos: ${matchesWithBothLogos}/${h2hData.matches.length}`);
        
        if (matchesWithBothLogos === h2hData.matches.length) {
          console.log('✅ SUCCESS: All matches have both team logos!');
        } else {
          console.log('⚠️  WARNING: Some matches are missing team logos');
        }
      } else {
        console.log('❌ No matches found in H2H data');
      }
      
      // Test the main match data to compare
      console.log('\n🔍 Testing main match data for comparison...');
      const matchResponse = await axios.get(`http://localhost:5000/api/matches/${matchId}`, {
        timeout: 10000
      });
      
      if (matchResponse.data?.success && matchResponse.data.result) {
        const matchData = matchResponse.data.result;
        console.log('Main Match Data:');
        console.log('- Home Team:', matchData.homeTeam?.name, '| Logo:', matchData.homeTeam?.logo ? '✅' : '❌');
        console.log('- Away Team:', matchData.awayTeam?.name, '| Logo:', matchData.awayTeam?.logo ? '✅' : '❌');
        
        if (matchData.homeTeam?.logo) {
          console.log('- Home Team Logo URL:', matchData.homeTeam.logo);
        }
        if (matchData.awayTeam?.logo) {
          console.log('- Away Team Logo URL:', matchData.awayTeam.logo);
        }
      }
      
    } else {
      console.log('❌ Failed to get H2H data:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing H2H logos:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSpecificMatch();
