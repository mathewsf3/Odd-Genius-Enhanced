const axios = require('axios');

/**
 * Test league-level statistics to see what data we can extract for estimation
 */

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const APIFOOTBALL_API_KEY = '26703e5120975e64fc728bb2661f9acd';

async function testLeagueLevelStats() {
  console.log('🔍 LEAGUE-LEVEL STATISTICS EXTRACTION TEST');
  console.log('=========================================');
  console.log('🎯 Goal: Find usable data for statistical estimation');
  console.log('📊 League: Reserve League (ID: 436)');
  console.log('=========================================');

  // Test AllSportsAPI league statistics
  console.log('\n📊 ALLSPORTS API - League Statistics Analysis...');
  try {
    const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
      params: {
        met: 'Fixtures',
        APIkey: ALLSPORTS_API_KEY,
        leagueId: '436',
        from: '2024-01-01',
        to: '2025-06-03'
      },
      timeout: 20000
    });

    const matches = response.data?.result || [];
    console.log(`✅ Total League Matches: ${matches.length}`);
    
    // Analyze available data
    let totalGoals = 0;
    let totalCards = 0;
    let totalCorners = 0;
    let matchesWithGoals = 0;
    let matchesWithCards = 0;
    let matchesWithCorners = 0;
    let matchesWithStats = 0;
    
    const goalDistribution = {};
    const cardDistribution = {};
    const cornerDistribution = {};
    
    matches.forEach(match => {
      // Goal analysis
      if (match.event_final_result && match.event_final_result !== '' && match.event_final_result !== null) {
        const scoreParts = match.event_final_result.split(' - ');
        if (scoreParts.length === 2) {
          const homeGoals = parseInt(scoreParts[0]) || 0;
          const awayGoals = parseInt(scoreParts[1]) || 0;
          const totalMatchGoals = homeGoals + awayGoals;
          
          totalGoals += totalMatchGoals;
          matchesWithGoals++;
          
          goalDistribution[totalMatchGoals] = (goalDistribution[totalMatchGoals] || 0) + 1;
        }
      }
      
      // Card analysis
      const homeCards = parseInt(match.event_home_team_cards) || 0;
      const awayCards = parseInt(match.event_away_team_cards) || 0;
      const totalMatchCards = homeCards + awayCards;
      
      if (totalMatchCards > 0) {
        totalCards += totalMatchCards;
        matchesWithCards++;
        cardDistribution[totalMatchCards] = (cardDistribution[totalMatchCards] || 0) + 1;
      }
      
      // Statistics analysis
      if (match.statistics && match.statistics.length > 0) {
        matchesWithStats++;
        
        // Look for corner statistics
        const cornerStat = match.statistics.find(stat => 
          stat.type && stat.type.toLowerCase().includes('corner')
        );
        
        if (cornerStat) {
          const homeCorners = parseInt(cornerStat.home) || 0;
          const awayCorners = parseInt(cornerStat.away) || 0;
          const totalMatchCorners = homeCorners + awayCorners;
          
          totalCorners += totalMatchCorners;
          matchesWithCorners++;
          cornerDistribution[totalMatchCorners] = (cornerDistribution[totalMatchCorners] || 0) + 1;
        }
      }
    });
    
    console.log('\n📈 LEAGUE STATISTICS SUMMARY:');
    console.log(`   ⚽ Matches with Goals: ${matchesWithGoals}/${matches.length} (${Math.round((matchesWithGoals/matches.length)*100)}%)`);
    console.log(`   🟨 Matches with Cards: ${matchesWithCards}/${matches.length} (${Math.round((matchesWithCards/matches.length)*100)}%)`);
    console.log(`   📐 Matches with Corners: ${matchesWithCorners}/${matches.length} (${Math.round((matchesWithCorners/matches.length)*100)}%)`);
    console.log(`   📊 Matches with Statistics: ${matchesWithStats}/${matches.length} (${Math.round((matchesWithStats/matches.length)*100)}%)`);
    
    if (matchesWithGoals > 0) {
      const avgGoals = totalGoals / matchesWithGoals;
      console.log(`\n⚽ GOAL STATISTICS:`);
      console.log(`   📊 Average Goals per Match: ${avgGoals.toFixed(2)}`);
      console.log(`   📈 Goal Distribution:`);
      Object.keys(goalDistribution).sort((a,b) => a-b).forEach(goals => {
        const percentage = Math.round((goalDistribution[goals] / matchesWithGoals) * 100);
        console.log(`      ${goals} goals: ${goalDistribution[goals]} matches (${percentage}%)`);
      });
    }
    
    if (matchesWithCards > 0) {
      const avgCards = totalCards / matchesWithCards;
      console.log(`\n🟨 CARD STATISTICS:`);
      console.log(`   📊 Average Cards per Match: ${avgCards.toFixed(2)}`);
      console.log(`   📈 Card Distribution:`);
      Object.keys(cardDistribution).sort((a,b) => a-b).forEach(cards => {
        const percentage = Math.round((cardDistribution[cards] / matchesWithCards) * 100);
        console.log(`      ${cards} cards: ${cardDistribution[cards]} matches (${percentage}%)`);
      });
    }
    
    if (matchesWithCorners > 0) {
      const avgCorners = totalCorners / matchesWithCorners;
      console.log(`\n📐 CORNER STATISTICS:`);
      console.log(`   📊 Average Corners per Match: ${avgCorners.toFixed(2)}`);
      console.log(`   📈 Corner Distribution:`);
      Object.keys(cornerDistribution).sort((a,b) => a-b).forEach(corners => {
        const percentage = Math.round((cornerDistribution[corners] / matchesWithCorners) * 100);
        console.log(`      ${corners} corners: ${cornerDistribution[corners]} matches (${percentage}%)`);
      });
    }

  } catch (error) {
    console.log('❌ AllSports League Stats Error:', error.message);
  }

  // Test API-Football U21 League statistics
  console.log('\n🔄 API-FOOTBALL - U21 League Analysis...');
  try {
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      headers: {
        'X-RapidAPI-Key': APIFOOTBALL_API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      params: {
        league: '515', // U21 League 1
        season: '2024'
      },
      timeout: 20000
    });

    const fixtures = response.data?.response || [];
    console.log(`✅ U21 League Fixtures: ${fixtures.length}`);
    
    if (fixtures.length > 0) {
      let totalGoals = 0;
      let fixturesWithGoals = 0;
      
      fixtures.forEach(fixture => {
        const homeGoals = fixture.goals.home || 0;
        const awayGoals = fixture.goals.away || 0;
        const totalFixtureGoals = homeGoals + awayGoals;
        
        if (fixture.fixture.status.short === 'FT') {
          totalGoals += totalFixtureGoals;
          fixturesWithGoals++;
        }
      });
      
      if (fixturesWithGoals > 0) {
        const avgGoals = totalGoals / fixturesWithGoals;
        console.log(`   ⚽ Average Goals per Match: ${avgGoals.toFixed(2)}`);
        console.log(`   📊 Finished Fixtures: ${fixturesWithGoals}/${fixtures.length}`);
      }
    }

  } catch (error) {
    console.log('❌ API-Football U21 League Error:', error.response?.status || error.message);
  }

  console.log('\n🎯 DATA EXTRACTION CONCLUSIONS:');
  console.log('===============================');
  console.log('✅ Goal data is available and can be used for BTTS analysis');
  console.log('⚠️  Card data is limited but some historical data exists');
  console.log('❌ Corner data is very limited in reserve leagues');
  console.log('❌ Player-level statistics are not available');
  console.log('✅ League-level averages can be calculated for estimation');
  
  console.log('\n💡 IMPLEMENTATION STRATEGY:');
  console.log('1. Use league averages for missing individual match data');
  console.log('2. Generate realistic estimates based on historical patterns');
  console.log('3. Show "Estimated" labels for calculated statistics');
  console.log('4. Focus on available data (goals) rather than missing data');
}

testLeagueLevelStats().catch(console.error);
