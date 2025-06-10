const axios = require('axios');

async function testMatchData() {
  try {
    console.log('🧪 Testing match data endpoints for match ID 1569357...');
    
    const matchId = '1569357';
    
    // Test main match endpoint
    console.log('\n📊 Testing main match endpoint...');
    try {
      const matchResponse = await axios.get(`http://localhost:5000/api/matches/${matchId}`, {
        timeout: 15000
      });
      
      if (matchResponse.data?.success && matchResponse.data.result) {
        const matchData = matchResponse.data.result;
        console.log('✅ Main match data received');
        console.log('- Home Team:', matchData.homeTeam?.name, '| Logo:', matchData.homeTeam?.logo ? '✅' : '❌');
        console.log('- Away Team:', matchData.awayTeam?.name, '| Logo:', matchData.awayTeam?.logo ? '✅' : '❌');
        console.log('- League:', matchData.league?.name);
        console.log('- Status:', matchData.status);
        
        if (matchData.homeTeam?.logo) {
          console.log('- Home Team Logo URL:', matchData.homeTeam.logo);
        }
        if (matchData.awayTeam?.logo) {
          console.log('- Away Team Logo URL:', matchData.awayTeam.logo);
        }
      } else {
        console.log('❌ Main match endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ Main match endpoint failed:', error.message);
    }
    
    // Test live matches endpoint
    console.log('\n📊 Testing live matches endpoint...');
    try {
      const liveResponse = await axios.get('http://localhost:5000/api/matches/live', {
        timeout: 10000
      });
      
      if (liveResponse.data?.success && liveResponse.data.result) {
        const liveMatches = liveResponse.data.result;
        const targetMatch = liveMatches.find(m => m.id === matchId);
        
        if (targetMatch) {
          console.log('✅ Found match in live matches');
          console.log('- Home Team:', targetMatch.homeTeam?.name, '| Logo:', targetMatch.homeTeam?.logo ? '✅' : '❌');
          console.log('- Away Team:', targetMatch.awayTeam?.name, '| Logo:', targetMatch.awayTeam?.logo ? '✅' : '❌');
        } else {
          console.log('❌ Match not found in live matches');
        }
      }
    } catch (error) {
      console.error('❌ Live matches endpoint failed:', error.message);
    }
    
    // Test upcoming matches endpoint
    console.log('\n📊 Testing upcoming matches endpoint...');
    try {
      const upcomingResponse = await axios.get('http://localhost:5000/api/matches/upcoming', {
        timeout: 10000
      });
      
      if (upcomingResponse.data?.success && upcomingResponse.data.result) {
        const upcomingMatches = upcomingResponse.data.result;
        const targetMatch = upcomingMatches.find(m => m.id === matchId);
        
        if (targetMatch) {
          console.log('✅ Found match in upcoming matches');
          console.log('- Home Team:', targetMatch.homeTeam?.name, '| Logo:', targetMatch.homeTeam?.logo ? '✅' : '❌');
          console.log('- Away Team:', targetMatch.awayTeam?.name, '| Logo:', targetMatch.awayTeam?.logo ? '✅' : '❌');
        } else {
          console.log('❌ Match not found in upcoming matches');
        }
      }
    } catch (error) {
      console.error('❌ Upcoming matches endpoint failed:', error.message);
    }
    
    // Test unified mapping system
    console.log('\n📊 Testing unified mapping system...');
    try {
      const unifiedResponse = await axios.get(`http://localhost:5000/api/admin/mapping/match/${matchId}`, {
        timeout: 10000
      });
      
      if (unifiedResponse.data?.success && unifiedResponse.data.result) {
        const unifiedData = unifiedResponse.data.result;
        console.log('✅ Found match in unified system');
        console.log('- Universal data available:', !!unifiedData.universal);
        console.log('- AllSports data available:', !!unifiedData.allSports);
        console.log('- API Football data available:', !!unifiedData.apiFootball);
        
        if (unifiedData.universal) {
          console.log('- Home Team:', unifiedData.universal.homeTeam?.name, '| Logo:', unifiedData.universal.homeTeam?.logo ? '✅' : '❌');
          console.log('- Away Team:', unifiedData.universal.awayTeam?.name, '| Logo:', unifiedData.universal.awayTeam?.logo ? '✅' : '❌');
        }
      } else {
        console.log('❌ Match not found in unified system');
      }
    } catch (error) {
      console.error('❌ Unified mapping system failed:', error.message);
    }
    
    // Test H2H endpoint again for comparison
    console.log('\n📊 Testing H2H endpoint for comparison...');
    try {
      const h2hResponse = await axios.get(`http://localhost:5000/api/matches/${matchId}/h2h`, {
        timeout: 15000
      });
      
      if (h2hResponse.data?.success && h2hResponse.data.result) {
        const h2hData = h2hResponse.data.result;
        console.log('✅ H2H data received');
        console.log('- First Team:', h2hData.firstTeam?.name, '| Logo:', h2hData.firstTeam?.logo ? '✅' : '❌');
        console.log('- Second Team:', h2hData.secondTeam?.name, '| Logo:', h2hData.secondTeam?.logo ? '✅' : '❌');
        console.log('- Matches with logos:', h2hData.matches?.filter(m => m.homeTeam?.logo && m.awayTeam?.logo).length || 0, '/', h2hData.matches?.length || 0);
      } else {
        console.log('❌ H2H endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ H2H endpoint failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testMatchData();
