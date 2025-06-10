const MappingNew = require('./src/services/MappingNew');

async function analyzeMatch(matchId) {
  console.log(`🎯 Analyzing Match ${matchId}\n`);
  
  try {
    await MappingNew.initialize();
    console.log('✅ System initialized\n');
    
    // Try to get complete match data
    console.log('🔍 Searching for match in unified system...');
    const matchData = await MappingNew.getCompleteMatchData(matchId);
    
    if (!matchData) {
      console.log('❌ Match not found in unified system');
      console.log('💡 Trying to fetch directly from APIs...\n');
      
      // Try direct API calls
      const [asData, afData] = await Promise.all([
        MappingNew.syncManager.getMatchFromAllSports(matchId).catch(err => {
          console.log(`   AllSports API error: ${err.message}`);
          return null;
        }),
        MappingNew.syncManager.getMatchFromApiFootball(matchId).catch(err => {
          console.log(`   API Football error: ${err.message}`);
          return null;
        })
      ]);
      
      if (asData) {
        console.log('✅ Found in AllSports API:');
        console.log(`   Match: ${asData.homeTeam.name} vs ${asData.awayTeam.name}`);
        console.log(`   Date: ${asData.date}`);
        console.log(`   League: ${asData.league.name}`);
        console.log(`   Status: ${asData.status}`);
        console.log(`   Score: ${asData.score?.home || '-'} - ${asData.score?.away || '-'}`);
        
        if (asData.statistics) {
          console.log(`   Statistics: ${asData.statistics.length} items available`);
        }
        if (asData.venue) {
          console.log(`   Venue: ${asData.venue}`);
        }
      }
      
      if (afData) {
        console.log('\n✅ Found in API Football:');
        console.log(`   Match: ${afData.homeTeam.name} vs ${afData.awayTeam.name}`);
        console.log(`   Date: ${afData.date}`);
        console.log(`   League: ${afData.league.name}`);
        console.log(`   Status: ${afData.status}`);
        console.log(`   Score: ${afData.score?.home || '-'} - ${afData.score?.away || '-'}`);
        
        if (afData.statistics) {
          console.log(`   Statistics: ${afData.statistics.length} items available`);
        }
        if (afData.venue) {
          console.log(`   Venue: ${afData.venue}`);
        }
      }
      
      if (!asData && !afData) {
        console.log('❌ Match not found in either API');
        console.log('💡 This could mean:');
        console.log('   1. The match ID is incorrect');
        console.log('   2. The match is too old or too far in the future');
        console.log('   3. The match is not available in these APIs');
      } else {
        console.log('\n💡 Match found in direct API calls but not in unified system');
        console.log('   This suggests the match sync hasn\'t processed this match yet');
        console.log('   Try running: node sync-all-matches.js');
      }
      
      return;
    }
    
    console.log('✅ Match found in unified system!');
    console.log(`   Universal ID: ${matchData.id}`);
    console.log(`   Match: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
    console.log(`   Date: ${matchData.date}`);
    console.log(`   Status: ${matchData.status}`);
    console.log(`   Confidence: ${matchData.confidence}`);
    console.log(`   Verified: ${matchData.verified ? 'Yes' : 'No'}`);
    
    console.log('\n📊 Data Sources Available:');
    const sources = [];
    if (matchData.allSports) {
      sources.push('AllSports');
      console.log(`   ✅ AllSports (ID: ${matchData.allSports.id})`);
    }
    if (matchData.apiFootball) {
      sources.push('API Football');
      console.log(`   ✅ API Football (ID: ${matchData.apiFootball.id})`);
    }
    
    if (sources.length === 0) {
      console.log('   ❌ No raw data sources available');
    } else {
      console.log(`   📈 Data quality: ${sources.length === 2 ? 'Excellent (both APIs)' : 'Good (single API)'}`);
    }
    
    console.log('\n🔄 Merged Data Analysis:');
    const merged = matchData.merged;
    
    console.log(`   Score: ${merged.score?.home || '-'} - ${merged.score?.away || '-'}`);
    console.log(`   Status: ${merged.status || 'Unknown'}`);
    console.log(`   Venue: ${merged.venue || 'Unknown'}`);
    console.log(`   Referee: ${merged.referee || 'Unknown'}`);
    
    if (merged.statistics) {
      console.log(`   Statistics: ${Array.isArray(merged.statistics) ? merged.statistics.length : 'Available'} items`);
      
      // Look for corner statistics specifically
      if (Array.isArray(merged.statistics)) {
        const cornerStats = merged.statistics.find(stat => 
          stat.type?.toLowerCase().includes('corner') ||
          stat.type === 'Corners' ||
          stat.type === 'Corner Kicks'
        );
        
        if (cornerStats) {
          console.log(`   🏁 Corner Stats: Home ${cornerStats.home}, Away ${cornerStats.away}`);
        } else {
          console.log(`   🏁 Corner Stats: Not available in statistics`);
        }
      }
    } else {
      console.log(`   Statistics: Not available`);
    }
    
    if (merged.events) {
      console.log(`   Events: ${Array.isArray(merged.events) ? merged.events.length : 'Available'} items`);
    }
    
    if (merged.lineups) {
      console.log(`   Lineups: Available`);
    }
    
    console.log('\n🏠 Team Information:');
    console.log(`   Home Team:`);
    console.log(`     ID: ${matchData.homeTeam.id}`);
    console.log(`     Name: ${matchData.homeTeam.name}`);
    console.log(`     Logo: ${matchData.homeTeam.logo ? 'Available' : 'Not available'}`);
    
    console.log(`   Away Team:`);
    console.log(`     ID: ${matchData.awayTeam.id}`);
    console.log(`     Name: ${matchData.awayTeam.name}`);
    console.log(`     Logo: ${matchData.awayTeam.logo ? 'Available' : 'Not available'}`);
    
    console.log('\n🏆 League Information:');
    console.log(`   ID: ${matchData.league.id}`);
    console.log(`   Name: ${matchData.league.name}`);
    console.log(`   Logo: ${matchData.league.logo ? 'Available' : 'Not available'}`);
    
    console.log('\n⏰ Timestamps:');
    console.log(`   Last Updated: ${matchData.lastUpdated || 'Unknown'}`);
    
    console.log('\n🎯 Analysis Complete!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Get match ID from command line argument or use default
const matchId = process.argv[2] || '1570055';
console.log(`Using match ID: ${matchId}`);
console.log('Usage: node test-analyze-match.js [matchId]\n');

analyzeMatch(matchId);
