const axios = require('axios');

async function testH2HLogos() {
  try {
    console.log('🧪 Testing H2H endpoint for logo data...');
    
    const matchId = '1530359';
    const response = await axios.get(`http://localhost:5000/api/matches/${matchId}/h2h`, {
      timeout: 15000
    });
    
    if (response.data?.success && response.data.result) {
      const h2hData = response.data.result;
      
      console.log('\n📊 H2H Data Structure:');
      console.log('- First Team:', h2hData.firstTeam?.name, '| Logo:', h2hData.firstTeam?.logo ? '✅' : '❌');
      console.log('- Second Team:', h2hData.secondTeam?.name, '| Logo:', h2hData.secondTeam?.logo ? '✅' : '❌');
      console.log('- Total Matches:', h2hData.matches?.length || 0);
      
      if (h2hData.matches && h2hData.matches.length > 0) {
        console.log('\n🔍 Sample Match Data:');
        const sampleMatch = h2hData.matches[0];
        console.log('- Home Team:', sampleMatch.homeTeam?.name, '| Logo:', sampleMatch.homeTeam?.logo ? '✅' : '❌');
        console.log('- Away Team:', sampleMatch.awayTeam?.name, '| Logo:', sampleMatch.awayTeam?.logo ? '✅' : '❌');
        console.log('- Score:', `${sampleMatch.score?.home || 0} - ${sampleMatch.score?.away || 0}`);
        console.log('- Date:', sampleMatch.date);
        
        // Check if logos are actual URLs
        if (sampleMatch.homeTeam?.logo) {
          console.log('- Home Team Logo URL:', sampleMatch.homeTeam.logo);
        }
        if (sampleMatch.awayTeam?.logo) {
          console.log('- Away Team Logo URL:', sampleMatch.awayTeam.logo);
        }
        
        // Check all matches for logo consistency
        let matchesWithLogos = 0;
        let totalMatches = h2hData.matches.length;
        
        h2hData.matches.forEach(match => {
          if (match.homeTeam?.logo && match.awayTeam?.logo) {
            matchesWithLogos++;
          }
        });
        
        console.log(`\n📈 Logo Coverage: ${matchesWithLogos}/${totalMatches} matches have both team logos`);
        
        if (matchesWithLogos === totalMatches) {
          console.log('✅ SUCCESS: All matches have team logos!');
        } else {
          console.log('⚠️  WARNING: Some matches are missing team logos');
        }
      } else {
        console.log('❌ No matches found in H2H data');
      }
    } else {
      console.log('❌ Failed to get H2H data:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing H2H logos:', error.message);
  }
}

testH2HLogos();
