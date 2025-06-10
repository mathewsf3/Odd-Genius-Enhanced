const axios = require('axios');

async function testFrontendFix() {
  try {
    console.log('🧪 Testing frontend fix for match 1569357...');
    
    const matchId = '1569357';
    
    // Test the main match endpoint that frontend uses first
    console.log('\n📊 Testing main match endpoint (what frontend tries first)...');
    try {
      const mainResponse = await axios.get(`http://localhost:5000/api/matches/${matchId}`, {
        timeout: 15000
      });
      
      if (mainResponse.data?.success && mainResponse.data.result) {
        const result = mainResponse.data.result;
        console.log('✅ Main endpoint returned data');
        console.log('- Home Team Name:', result.homeTeam?.name || result.event_home_team || 'MISSING');
        console.log('- Away Team Name:', result.awayTeam?.name || result.event_away_team || 'MISSING');
        console.log('- Home Team Logo:', result.homeTeam?.logo || result.home_team_logo || 'MISSING');
        console.log('- Away Team Logo:', result.awayTeam?.logo || result.away_team_logo || 'MISSING');
        
        const hasValidTeamData = (
          (result.homeTeam?.name || result.event_home_team) &&
          (result.awayTeam?.name || result.event_away_team)
        );
        
        if (hasValidTeamData) {
          console.log('✅ Main endpoint has valid team data - no fallback needed');
        } else {
          console.log('⚠️ Main endpoint missing team data - frontend will use fallback');
        }
      } else {
        console.log('❌ Main endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ Main endpoint failed:', error.message);
    }
    
    // Test live matches endpoint (first fallback)
    console.log('\n📊 Testing live matches endpoint (first fallback)...');
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
          
          if (targetMatch.homeTeam?.logo) {
            console.log('- Home Logo URL:', targetMatch.homeTeam.logo);
          }
          if (targetMatch.awayTeam?.logo) {
            console.log('- Away Logo URL:', targetMatch.awayTeam.logo);
          }
        } else {
          console.log('❌ Match not found in live matches');
        }
      } else {
        console.log('❌ Live matches endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ Live matches endpoint failed:', error.message);
    }
    
    // Test upcoming matches endpoint (second fallback)
    console.log('\n📊 Testing upcoming matches endpoint (second fallback)...');
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
          
          if (targetMatch.homeTeam?.logo) {
            console.log('- Home Logo URL:', targetMatch.homeTeam.logo);
          }
          if (targetMatch.awayTeam?.logo) {
            console.log('- Away Logo URL:', targetMatch.awayTeam.logo);
          }
        } else {
          console.log('❌ Match not found in upcoming matches');
        }
      } else {
        console.log('❌ Upcoming matches endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ Upcoming matches endpoint failed:', error.message);
    }
    
    // Test H2H endpoint to confirm it still works
    console.log('\n📊 Testing H2H endpoint (should still work)...');
    try {
      const h2hResponse = await axios.get(`http://localhost:5000/api/matches/${matchId}/h2h`, {
        timeout: 15000
      });
      
      if (h2hResponse.data?.success && h2hResponse.data.result) {
        const h2hData = h2hResponse.data.result;
        console.log('✅ H2H endpoint working');
        console.log('- First Team:', h2hData.firstTeam?.name, '| Logo:', h2hData.firstTeam?.logo ? '✅' : '❌');
        console.log('- Second Team:', h2hData.secondTeam?.name, '| Logo:', h2hData.secondTeam?.logo ? '✅' : '❌');
        console.log('- Matches with logos:', h2hData.matches?.filter(m => m.homeTeam?.logo && m.awayTeam?.logo).length || 0, '/', h2hData.matches?.length || 0);
      } else {
        console.log('❌ H2H endpoint returned no data');
      }
    } catch (error) {
      console.error('❌ H2H endpoint failed:', error.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('The frontend fix should now:');
    console.log('1. Try the main endpoint first');
    console.log('2. If team data is missing, fallback to live matches');
    console.log('3. If still missing, fallback to upcoming matches');
    console.log('4. This ensures the match header gets proper team data with logos');
    console.log('5. The H2H endpoint already has the backend fix to include logos');
    console.log('6. Result: Both match header AND H2H table should show logos');
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testFrontendFix();
