const axios = require('axios');

// Debug script to examine the actual field names in API responses
async function debugApiFieldNames() {
  console.log('🔍 Debugging API Field Names for Corner Data...\n');

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
      
      // Find a finished match to examine field names
      const finishedMatch = matches.find(m => 
        (m.event_status === 'Finished' || m.match_status === 'Finished') ||
        (m.event_status === 'FT' || m.match_status === 'FT')
      );
      
      if (finishedMatch) {
        console.log('2. Examining finished match field names:');
        console.log(`   Match: ${finishedMatch.event_home_team || finishedMatch.match_hometeam_name} vs ${finishedMatch.event_away_team || finishedMatch.match_awayteam_name}`);
        console.log(`   Date: ${finishedMatch.event_date || finishedMatch.match_date}`);
        console.log(`   Status: ${finishedMatch.event_status || finishedMatch.match_status}`);
        
        console.log('\n3. All available field names:');
        const allFields = Object.keys(finishedMatch).sort();
        allFields.forEach(field => {
          const value = finishedMatch[field];
          // Only show fields that might contain corner data or statistics
          if (field.toLowerCase().includes('corner') || 
              field.toLowerCase().includes('statistic') ||
              field.toLowerCase().includes('extra') ||
              field.toLowerCase().includes('detail') ||
              field.toLowerCase().includes('score')) {
            console.log(`   ${field}: ${JSON.stringify(value)}`);
          }
        });
        
        console.log('\n4. Looking for potential corner-related fields:');
        allFields.forEach(field => {
          const value = finishedMatch[field];
          if (typeof value === 'number' && value >= 0 && value <= 20) {
            console.log(`   ${field}: ${value} (potential corner count)`);
          }
        });
        
        // Also check if there's a statistics array
        if (finishedMatch.statistics) {
          console.log('\n5. Statistics array:');
          console.log(JSON.stringify(finishedMatch.statistics, null, 2));
        }
        
        // Check for match events
        if (finishedMatch.events) {
          console.log('\n6. Events array (first 5):');
          const cornerEvents = finishedMatch.events?.filter(e => 
            e.type?.toLowerCase().includes('corner') ||
            e.detail?.toLowerCase().includes('corner')
          ) || [];
          console.log(`   Found ${cornerEvents.length} corner events`);
          if (cornerEvents.length > 0) {
            console.log(JSON.stringify(cornerEvents.slice(0, 5), null, 2));
          }
        }
        
      } else {
        console.log('❌ No finished matches found');
        
        // Show first match structure anyway
        console.log('\n2. Examining first match (not finished):');
        const firstMatch = matches[0];
        console.log(`   Match: ${firstMatch.event_home_team || firstMatch.match_hometeam_name} vs ${firstMatch.event_away_team || firstMatch.match_awayteam_name}`);
        console.log(`   Status: ${firstMatch.event_status || firstMatch.match_status}`);
        
        console.log('\n3. All field names in first match:');
        const allFields = Object.keys(firstMatch).sort();
        allFields.forEach(field => {
          console.log(`   ${field}: ${typeof firstMatch[field]} = ${JSON.stringify(firstMatch[field])}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugApiFieldNames().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});
