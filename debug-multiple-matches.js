const axios = require('axios');

// Debug script to examine multiple matches for corner data patterns
async function debugMultipleMatches() {
  console.log('🔍 Examining Multiple Matches for Corner Data Patterns...\n');

  try {
    const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
    const fromDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];

    console.log('1. Fetching team 7417 matches...');
    const response = await axios.get(`https://apiv2.allsportsapi.com/football/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        teamId: '7417',
        from: fromDate,
        to: toDate
      },
      timeout: 10000
    });

    console.log(`Total matches returned: ${response.data.result?.length || 0}\n`);
    
    if (response.data.result && response.data.result.length > 0) {
      const matches = response.data.result;
      
      // Find finished matches
      const finishedMatches = matches.filter(m => 
        (m.event_status === 'Finished' || m.match_status === 'Finished') ||
        (m.event_status === 'FT' || m.match_status === 'FT')
      );
      
      console.log(`2. Found ${finishedMatches.length} finished matches`);
      
      let matchesWithCornerStats = 0;
      let matchesWithCornerEvents = 0;
      let uniqueStatTypes = new Set();
      
      finishedMatches.slice(0, 10).forEach((match, index) => {
        console.log(`\n--- Match ${index + 1}: ${match.event_home_team || match.match_hometeam_name} vs ${match.event_away_team || match.match_awayteam_name} ---`);
        console.log(`   Date: ${match.event_date || match.match_date}`);
        console.log(`   Status: ${match.event_status || match.match_status}`);
        
        // Check statistics array
        if (match.statistics && Array.isArray(match.statistics)) {
          console.log(`   Statistics types: ${match.statistics.map(s => s.type).join(', ')}`);
          
          match.statistics.forEach(stat => uniqueStatTypes.add(stat.type));
          
          const cornerStat = match.statistics.find(s => 
            s.type.toLowerCase().includes('corner') ||
            s.type === 'Corners' ||
            s.type === 'Corner Kicks'
          );
          
          if (cornerStat) {
            matchesWithCornerStats++;
            console.log(`   ✅ CORNER STAT FOUND: ${cornerStat.type} - Home: ${cornerStat.home}, Away: ${cornerStat.away}`);
          }
        }
        
        // Check events array for corner events
        if (match.events && Array.isArray(match.events)) {
          const cornerEvents = match.events.filter(e => 
            e.type?.toLowerCase().includes('corner') ||
            e.detail?.toLowerCase().includes('corner') ||
            e.type === 'corner_kick' ||
            e.type === 'Corner'
          );
          
          if (cornerEvents.length > 0) {
            matchesWithCornerEvents++;
            console.log(`   ✅ CORNER EVENTS FOUND: ${cornerEvents.length} events`);
            console.log(`      Sample: ${JSON.stringify(cornerEvents[0], null, 2)}`);
          }
        }
        
        // Check for any field that might contain corner data
        const allFields = Object.keys(match);
        const cornerFields = allFields.filter(field => 
          field.toLowerCase().includes('corner')
        );
        
        if (cornerFields.length > 0) {
          console.log(`   Corner fields found: ${cornerFields.join(', ')}`);
          cornerFields.forEach(field => {
            console.log(`      ${field}: ${match[field]}`);
          });
        }
      });
      
      console.log(`\n3. Summary:`);
      console.log(`   Matches with corner statistics: ${matchesWithCornerStats}/${finishedMatches.slice(0, 10).length}`);
      console.log(`   Matches with corner events: ${matchesWithCornerEvents}/${finishedMatches.slice(0, 10).length}`);
      console.log(`   All unique statistic types found: ${Array.from(uniqueStatTypes).sort().join(', ')}`);
      
      // Try a different team that might have corner data
      console.log(`\n4. Trying a different team (7419) for comparison...`);
      
      const response2 = await axios.get(`https://apiv2.allsportsapi.com/football/`, {
        params: {
          met: 'Fixtures',
          APIkey: API_KEY,
          teamId: '7419',
          from: fromDate,
          to: toDate
        },
        timeout: 10000
      });
      
      if (response2.data.result && response2.data.result.length > 0) {
        const team2Matches = response2.data.result;
        const team2Finished = team2Matches.filter(m => 
          (m.event_status === 'Finished' || m.match_status === 'Finished') ||
          (m.event_status === 'FT' || m.match_status === 'FT')
        );
        
        console.log(`   Team 7419 finished matches: ${team2Finished.length}`);
        
        if (team2Finished.length > 0) {
          const firstMatch = team2Finished[0];
          console.log(`   Sample match: ${firstMatch.event_home_team || firstMatch.match_hometeam_name} vs ${firstMatch.event_away_team || firstMatch.match_awayteam_name}`);
          
          if (firstMatch.statistics) {
            console.log(`   Statistics types: ${firstMatch.statistics.map(s => s.type).join(', ')}`);
            
            const cornerStat = firstMatch.statistics.find(s => 
              s.type.toLowerCase().includes('corner') ||
              s.type === 'Corners' ||
              s.type === 'Corner Kicks'
            );
            
            if (cornerStat) {
              console.log(`   ✅ Team 7419 HAS corner data: ${cornerStat.type} - Home: ${cornerStat.home}, Away: ${cornerStat.away}`);
            } else {
              console.log(`   ❌ Team 7419 also lacks corner statistics`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMultipleMatches().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});
