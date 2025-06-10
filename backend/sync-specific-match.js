const MappingNew = require('./src/services/MappingNew');
const logger = require('./src/utils/logger');

async function syncSpecificMatch() {
  try {
    const matchId = process.argv[2] || '1458266';
    
    console.log(`🔄 Syncing specific match: ${matchId}`);
    
    // Initialize the mapping system
    await MappingNew.initialize();
    
    // Check if match exists
    const existingMatch = MappingNew.findMatchByApiId(matchId);
    if (existingMatch) {
      console.log(`✅ Match ${matchId} already exists in unified system: ${existingMatch.id}`);
    } else {
      console.log(`❌ Match ${matchId} not found in unified system`);
    }
    
    // Try to get complete data
    const completeData = await MappingNew.getCompleteMatchData(matchId);
    if (completeData) {
      console.log(`✅ Complete data retrieved for match ${matchId}:`);
      console.log(`   - Home Team: ${completeData.merged?.homeTeam?.name}`);
      console.log(`   - Away Team: ${completeData.merged?.awayTeam?.name}`);
      console.log(`   - League: ${completeData.merged?.league?.name}`);
      console.log(`   - Date: ${completeData.merged?.date}`);
      console.log(`   - Sources: ${Object.keys(completeData.sources || {}).join(', ')}`);
    } else {
      console.log(`❌ Could not retrieve complete data for match ${matchId}`);
    }
    
    // Force a sync for this specific match
    console.log(`🔄 Forcing sync for match ${matchId}...`);
    
    // Try to sync from AllSports
    try {
      const axios = require('axios');
      const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
      
      const response = await axios.get('https://apiv2.allsportsapi.com/football/', {
        params: {
          met: 'Fixtures',
          APIkey: API_KEY,
          matchId: matchId
        },
        timeout: 15000
      });
      
      if (response.data?.result?.length > 0) {
        const match = response.data.result[0];
        console.log(`✅ Found match in AllSports API:`);
        console.log(`   - ${match.event_home_team} vs ${match.event_away_team}`);
        console.log(`   - League: ${match.league_name}`);
        console.log(`   - Date: ${match.event_date}`);
        console.log(`   - Status: ${match.event_status}`);
        
        // Try to add to unified system
        const added = await MappingNew.addMatch({
          allSportsId: matchId,
          homeTeam: {
            allSportsId: match.home_team_key,
            name: match.event_home_team
          },
          awayTeam: {
            allSportsId: match.away_team_key,
            name: match.event_away_team
          },
          league: {
            allSportsId: match.league_key,
            name: match.league_name
          },
          date: match.event_date
        });
        
        if (added) {
          console.log(`✅ Successfully added match to unified system`);
        } else {
          console.log(`⚠️ Match may already exist in unified system`);
        }
      } else {
        console.log(`❌ Match ${matchId} not found in AllSports API`);
      }
    } catch (error) {
      console.error(`❌ Error syncing from AllSports: ${error.message}`);
    }
    
    // Test the complete data again
    const finalData = await MappingNew.getCompleteMatchData(matchId);
    if (finalData) {
      console.log(`✅ Final verification - match data available:`);
      console.log(`   - Universal ID: ${finalData.universal?.id}`);
      console.log(`   - Merged data available: ${!!finalData.merged}`);
      console.log(`   - Sources: ${Object.keys(finalData.sources || {}).join(', ')}`);
    } else {
      console.log(`❌ Final verification failed - no data available`);
    }
    
    console.log(`✅ Sync complete for match ${matchId}`);
    
  } catch (error) {
    console.error(`❌ Error syncing match: ${error.message}`);
    console.error(error.stack);
  }
}

// Run if called directly
if (require.main === module) {
  syncSpecificMatch().then(() => {
    console.log('Sync completed');
    process.exit(0);
  }).catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
}

module.exports = syncSpecificMatch;
