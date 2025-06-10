const axios = require('axios');

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

async function debugMatchFields() {
  try {
    console.log('🔍 Debugging Match 1544012 - Field Analysis');
    console.log('===========================================');

    const matchResponse = await axios.get(`${BASE_URL}/`, {
      params: {
        met: 'Fixtures',
        APIkey: API_KEY,
        matchId: '1544012'
      },
      timeout: 10000
    });
    
    if (matchResponse.data && matchResponse.data.result && matchResponse.data.result.length > 0) {
      const match = matchResponse.data.result[0];
      
      console.log('📋 ALL AVAILABLE FIELDS:');
      console.log('========================');
      Object.keys(match).forEach(key => {
        console.log(`${key}: ${match[key]}`);
      });
      
      console.log('\n🔍 TEAM ID FIELD ANALYSIS:');
      console.log('==========================');
      
      // Check all possible team ID fields
      const possibleHomeIdFields = [
        'event_home_team_id',
        'home_team_id', 
        'home_team_key',
        'match_hometeam_id',
        'hometeam_id'
      ];
      
      const possibleAwayIdFields = [
        'event_away_team_id',
        'away_team_id',
        'away_team_key', 
        'match_awayteam_id',
        'awayteam_id'
      ];
      
      console.log('Home Team ID Fields:');
      possibleHomeIdFields.forEach(field => {
        if (match[field] !== undefined) {
          console.log(`  ✅ ${field}: ${match[field]}`);
        } else {
          console.log(`  ❌ ${field}: undefined`);
        }
      });
      
      console.log('\nAway Team ID Fields:');
      possibleAwayIdFields.forEach(field => {
        if (match[field] !== undefined) {
          console.log(`  ✅ ${field}: ${match[field]}`);
        } else {
          console.log(`  ❌ ${field}: undefined`);
        }
      });
      
      // Try to find team IDs by searching for Bragantino and Juventude in team fixtures
      console.log('\n🔍 SEARCHING FOR TEAM IDs BY NAME:');
      console.log('==================================');
      
      // Search for Bragantino
      console.log('Searching for Bragantino team ID...');
      try {
        const bragResponse = await axios.get(`${BASE_URL}/`, {
          params: {
            met: 'Teams',
            APIkey: API_KEY,
            teamName: 'Bragantino'
          },
          timeout: 10000
        });
        
        if (bragResponse.data && bragResponse.data.result) {
          console.log('Bragantino search results:', bragResponse.data.result.length);
          if (bragResponse.data.result.length > 0) {
            bragResponse.data.result.forEach((team, index) => {
              console.log(`  ${index + 1}. ${team.team_name} (ID: ${team.team_key})`);
            });
          }
        }
      } catch (error) {
        console.log('❌ Error searching for Bragantino:', error.message);
      }
      
      // Search for Juventude
      console.log('\nSearching for Juventude team ID...');
      try {
        const juvResponse = await axios.get(`${BASE_URL}/`, {
          params: {
            met: 'Teams',
            APIkey: API_KEY,
            teamName: 'Juventude'
          },
          timeout: 10000
        });
        
        if (juvResponse.data && juvResponse.data.result) {
          console.log('Juventude search results:', juvResponse.data.result.length);
          if (juvResponse.data.result.length > 0) {
            juvResponse.data.result.forEach((team, index) => {
              console.log(`  ${index + 1}. ${team.team_name} (ID: ${team.team_key})`);
            });
          }
        }
      } catch (error) {
        console.log('❌ Error searching for Juventude:', error.message);
      }
      
      // Alternative: Try to get recent fixtures for known team IDs
      console.log('\n🔍 VERIFYING KNOWN TEAM IDs:');
      console.log('============================');
      
      const knownTeamIds = {
        'Bragantino': '2015',
        'Juventude': '1737'
      };
      
      for (const [teamName, teamId] of Object.entries(knownTeamIds)) {
        try {
          console.log(`\nTesting ${teamName} (ID: ${teamId})...`);
          const teamResponse = await axios.get(`${BASE_URL}/`, {
            params: {
              met: 'Fixtures',
              APIkey: API_KEY,
              teamId: teamId,
              from: '2025-05-20',
              to: '2025-05-30'
            },
            timeout: 10000
          });
          
          if (teamResponse.data && teamResponse.data.result && teamResponse.data.result.length > 0) {
            console.log(`✅ ${teamName} (${teamId}) has ${teamResponse.data.result.length} matches`);
            
            // Check if any match has ID 1544012
            const targetMatch = teamResponse.data.result.find(m => m.match_id === '1544012' || m.event_id === '1544012');
            if (targetMatch) {
              console.log(`🎯 Found match 1544012 in ${teamName}'s fixtures!`);
              console.log(`   Match: ${targetMatch.event_home_team} vs ${targetMatch.event_away_team}`);
            }
          } else {
            console.log(`❌ No matches found for ${teamName} (${teamId})`);
          }
        } catch (error) {
          console.log(`❌ Error testing ${teamName}: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ No match data found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMatchFields();
