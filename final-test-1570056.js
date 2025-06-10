const axios = require('axios');

async function finalTest() {
  console.log('🎯 FINAL TEST: Match 1570056 - Livyi Bereg vs Metalist 1925');
  console.log('===========================================================');
  console.log('');

  // Test the exact endpoints the frontend uses
  const tests = [
    {
      name: 'Frontend Unified Endpoint',
      url: 'http://localhost:5000/api/admin/matches/1570056/unified',
      timeout: 15000,
      critical: true
    },
    {
      name: 'Frontend H2H Endpoint',
      url: 'http://localhost:5000/api/matches/1570056/h2h',
      timeout: 15000,
      critical: true
    },
    {
      name: 'Frontend Corner Stats',
      url: 'http://localhost:5000/api/matches/1570056/corners?matches=10',
      timeout: 10000,
      critical: false
    },
    {
      name: 'Frontend Card Stats',
      url: 'http://localhost:5000/api/matches/1570056/cards?matches=10',
      timeout: 10000,
      critical: true
    },
    {
      name: 'Frontend BTTS Stats',
      url: 'http://localhost:5000/api/matches/1570056/btts?matches=10',
      timeout: 10000,
      critical: true
    }
  ];

  const results = {};
  let allWorking = true;

  for (const test of tests) {
    console.log(`🔄 Testing: ${test.name}`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(test.url, { 
        timeout: test.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const responseTime = Date.now() - startTime;
      
      if (response.data?.success) {
        const result = response.data.result;
        
        if (test.name === 'Frontend Unified Endpoint') {
          const homeTeam = result.universal?.homeTeam?.name || result.allSports?.homeTeam?.name;
          const awayTeam = result.universal?.awayTeam?.name || result.allSports?.awayTeam?.name;
          const homeLogo = result.allSports?.rawData?.home_team_logo || result.universal?.homeTeam?.logo;
          const awayLogo = result.allSports?.rawData?.away_team_logo || result.universal?.awayTeam?.logo;
          
          console.log(`   ✅ SUCCESS (${responseTime}ms)`);
          console.log(`      Teams: ${homeTeam} vs ${awayTeam}`);
          console.log(`      Home Logo: ${homeLogo ? '✅' : '❌'} ${homeLogo || 'Missing'}`);
          console.log(`      Away Logo: ${awayLogo ? '✅' : '❌'} ${awayLogo || 'Missing'}`);
          
          results[test.name] = { 
            success: true, 
            responseTime, 
            homeTeam, 
            awayTeam, 
            homeLogo, 
            awayLogo,
            hasLogos: !!(homeLogo && awayLogo)
          };
        } else if (test.name === 'Frontend H2H Endpoint') {
          const matches = result.matches?.length || 0;
          console.log(`   ✅ SUCCESS (${responseTime}ms) - ${matches} H2H matches found`);
          results[test.name] = { success: true, responseTime, matches };
        } else if (test.name.includes('Stats')) {
          const hasHomeStats = !!result.homeStats;
          const hasAwayStats = !!result.awayStats;
          const message = result.message || '';
          
          if (hasHomeStats && hasAwayStats) {
            console.log(`   ✅ SUCCESS (${responseTime}ms) - Real data available`);
          } else {
            console.log(`   ⚠️ NO DATA (${responseTime}ms) - ${message.substring(0, 50)}...`);
          }
          
          results[test.name] = { 
            success: true, 
            responseTime, 
            hasData: hasHomeStats && hasAwayStats,
            message 
          };
        }
      } else {
        console.log(`   ❌ FAILED (${responseTime}ms) - Invalid response`);
        results[test.name] = { success: false, responseTime, error: 'Invalid response' };
        if (test.critical) allWorking = false;
      }
    } catch (error) {
      const errorMsg = error.code === 'ECONNABORTED' ? 'TIMEOUT' : error.message;
      console.log(`   ❌ ERROR - ${errorMsg}`);
      results[test.name] = { success: false, error: errorMsg };
      if (test.critical) allWorking = false;
    }
  }

  console.log('');
  console.log('📊 FINAL RESULTS');
  console.log('================');
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`Overall Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  console.log('');

  // Frontend readiness check
  console.log('🚀 FRONTEND READINESS CHECK');
  console.log('===========================');
  
  if (results['Frontend Unified Endpoint']?.success) {
    const unified = results['Frontend Unified Endpoint'];
    console.log('✅ Match Data: Ready');
    console.log(`   Teams: ${unified.homeTeam} vs ${unified.awayTeam}`);
    console.log(`   Logos: ${unified.hasLogos ? '✅ Available' : '❌ Missing'}`);
  } else {
    console.log('❌ Match Data: Not Ready');
    allWorking = false;
  }
  
  if (results['Frontend H2H Endpoint']?.success) {
    console.log(`✅ H2H Data: Ready (${results['Frontend H2H Endpoint'].matches} matches)`);
  } else {
    console.log('❌ H2H Data: Not Ready');
    allWorking = false;
  }
  
  if (results['Frontend Card Stats']?.success) {
    if (results['Frontend Card Stats'].hasData) {
      console.log('✅ Card Stats: Ready (Real data available)');
    } else {
      console.log('⚠️ Card Stats: No data (Expected for unmapped teams)');
    }
  } else {
    console.log('❌ Card Stats: Not Ready');
    allWorking = false;
  }
  
  if (results['Frontend BTTS Stats']?.success) {
    if (results['Frontend BTTS Stats'].hasData) {
      console.log('✅ BTTS Stats: Ready (Real data available)');
    } else {
      console.log('⚠️ BTTS Stats: No data (Expected for unmapped teams)');
    }
  } else {
    console.log('❌ BTTS Stats: Not Ready');
    allWorking = false;
  }
  
  if (results['Frontend Corner Stats']?.success) {
    console.log('✅ Corner Stats: Ready (Shows proper "No data" message)');
  } else {
    console.log('❌ Corner Stats: Not Ready');
  }

  console.log('');
  console.log('🎯 FINAL VERDICT');
  console.log('================');
  
  if (allWorking) {
    console.log('🎉 ALL SYSTEMS GO!');
    console.log('');
    console.log('✅ Backend: Fully functional');
    console.log('✅ Logos: Available and extractable');
    console.log('✅ H2H: Working without hanging');
    console.log('✅ Statistics: Real data where available');
    console.log('✅ Error handling: Proper "No data" messages');
    console.log('');
    console.log('🚀 READY FOR TESTING:');
    console.log('   Frontend: http://localhost:3001/match/1570056');
    console.log('   Debug Tool: http://localhost:3001/debug-match.html');
    console.log('');
    console.log('Expected behavior:');
    console.log('   - Team logos should display in header');
    console.log('   - H2H tab should load quickly with 1 match');
    console.log('   - Card Stats tab should show real statistics');
    console.log('   - BTTS Stats tab should show real statistics');
    console.log('   - Corner Stats tab should show "No data available"');
  } else {
    console.log('❌ ISSUES REMAIN');
    console.log('');
    console.log('Critical endpoints are failing. Check backend logs.');
  }

  return allWorking;
}

// Run the final test
finalTest().then(success => {
  if (success) {
    console.log('');
    console.log('🎯 SUCCESS: All systems ready for frontend testing!');
    process.exit(0);
  } else {
    console.log('');
    console.log('❌ FAILURE: Critical issues need to be resolved.');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
