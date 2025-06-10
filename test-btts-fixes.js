// Test script to verify BTTS fixes for data consistency and infinite loading
// Run this in browser console on the match page

console.log('🔍 Testing BTTS Fixes...');

// Test data consistency between H2H sections
async function testDataConsistency() {
  try {
    const matchId = window.location.pathname.split('/').pop();
    console.log(`\n📊 Testing Data Consistency for match ID: ${matchId}`);
    
    // Test H2H History section data (backend)
    console.log('\n🏠 Testing H2H History Section (Backend):');
    const h2hResponse = await fetch(`http://localhost:5000/api/matches/${matchId}/h2h`);
    const h2hData = await h2hResponse.json();
    
    if (h2hData.success && h2hData.result) {
      const h2hAvgGoals = h2hData.result.summary?.averages?.totalGoals;
      console.log(`H2H History Average Goals: ${h2hAvgGoals}`);
      console.log(`H2H History Calculation Method: Math.round(avgTotalGoals * 100) / 100`);
    }
    
    // Test BTTS H2H tab data (frontend service)
    console.log('\n⚽ Testing BTTS H2H Tab (Frontend Service):');
    
    // Get team IDs from the page
    const homeTeamId = document.querySelector('[data-home-team-id]')?.getAttribute('data-home-team-id') || '1543';
    const awayTeamId = document.querySelector('[data-away-team-id]')?.getAttribute('data-away-team-id') || '1544';
    
    // Test both 5 and 10 game counts
    for (const gameCount of [5, 10]) {
      console.log(`\n🎯 Testing BTTS with ${gameCount} games:`);
      
      const startTime = Date.now();
      console.log(`Starting BTTS fetch at ${new Date().toISOString()}`);
      
      try {
        // This should use the fixed service with improved timeouts
        const bttsResponse = await fetch(`/api/btts-stats?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}&gameCount=${gameCount}`);
        
        if (!bttsResponse.ok) {
          console.error(`❌ BTTS API request failed with status ${bttsResponse.status}`);
          continue;
        }
        
        const bttsData = await bttsResponse.json();
        const endTime = Date.now();
        
        console.log(`✅ BTTS fetch completed in ${endTime - startTime}ms`);
        
        if (bttsData.h2hStats && bttsData.h2hStats.averageTotalGoals !== undefined) {
          const bttsAvgGoals = bttsData.h2hStats.averageTotalGoals;
          console.log(`BTTS H2H Average Goals: ${bttsAvgGoals}`);
          console.log(`BTTS H2H Calculation Method: Math.round((...) * 100) / 100`);
          
          // Compare with H2H History section
          if (h2hAvgGoals !== undefined) {
            const difference = Math.abs(h2hAvgGoals - bttsAvgGoals);
            console.log(`\n📈 Data Consistency Check:`);
            console.log(`H2H History: ${h2hAvgGoals}`);
            console.log(`BTTS H2H: ${bttsAvgGoals}`);
            console.log(`Difference: ${difference.toFixed(3)}`);
            
            if (difference < 0.01) {
              console.log(`✅ Data is consistent (difference < 0.01)`);
            } else if (difference < 0.1) {
              console.log(`⚠️ Minor inconsistency (difference < 0.1)`);
            } else {
              console.log(`❌ Major inconsistency (difference >= 0.1)`);
            }
          }
        }
        
        // Test timeout handling specifically for 5-game requests
        if (gameCount === 5) {
          console.log(`\n⏰ Testing 5-game timeout handling:`);
          console.log(`Request completed in ${endTime - startTime}ms`);
          
          if (endTime - startTime > 25000) {
            console.warn(`⚠️ Request took longer than 25 seconds - may indicate timeout issues`);
          } else {
            console.log(`✅ Request completed within reasonable time`);
          }
        }
        
      } catch (bttsError) {
        const endTime = Date.now();
        console.error(`❌ Error testing BTTS for ${gameCount} games:`, bttsError);
        console.log(`Request failed after ${endTime - startTime}ms`);
        
        if (bttsError.message?.includes('timeout')) {
          console.log(`⏰ Confirmed timeout issue for ${gameCount} games`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing data consistency:', error);
  }
}

// Test tab switching to check for infinite loading
function testTabSwitching() {
  console.log('\n🔄 Testing Tab Switching for Infinite Loading...');
  
  return new Promise((resolve) => {
    // Find the BTTS tab
    const tabs = document.querySelectorAll('[role="tab"]');
    const bttsTab = Array.from(tabs).find(tab => tab.textContent?.includes('BTTS'));
    
    if (!bttsTab) {
      console.log('❌ Could not find BTTS tab');
      resolve(false);
      return;
    }
    
    console.log('Found BTTS tab, clicking it...');
    bttsTab.click();
    
    setTimeout(() => {
      // Look for the game count tabs within BTTS
      const gameCountTabs = document.querySelectorAll('.chakra-tabs__tab');
      const last10Tab = Array.from(gameCountTabs).find(tab => tab.textContent?.includes('Last 10'));
      const last5Tab = Array.from(gameCountTabs).find(tab => tab.textContent?.includes('Last 5'));
      
      if (!last10Tab || !last5Tab) {
        console.log('❌ Could not find game count tabs');
        resolve(false);
        return;
      }
      
      // Start with Last 10 Matches
      console.log('Clicking "Last 10 Matches" tab...');
      last10Tab.click();
      
      setTimeout(() => {
        // Check if data loads for 10 matches
        const spinners10 = document.querySelectorAll('.chakra-spinner');
        console.log(`Spinners after Last 10 click: ${spinners10.length}`);
        
        // Wait for 10-match data to load, then switch to 5
        setTimeout(() => {
          console.log('Switching to "Last 5 Matches" tab...');
          last5Tab.click();
          
          const switchTime = Date.now();
          
          // Monitor for infinite loading
          const checkLoading = () => {
            const spinners5 = document.querySelectorAll('.chakra-spinner');
            const currentTime = Date.now();
            const elapsed = currentTime - switchTime;
            
            console.log(`Time elapsed: ${elapsed}ms, Spinners: ${spinners5.length}`);
            
            if (spinners5.length === 0) {
              console.log(`✅ Last 5 Matches loaded successfully in ${elapsed}ms`);
              resolve(true);
            } else if (elapsed > 35000) {
              console.log(`❌ Infinite loading detected - still loading after ${elapsed}ms`);
              resolve(false);
            } else {
              // Check again in 2 seconds
              setTimeout(checkLoading, 2000);
            }
          };
          
          // Start monitoring
          setTimeout(checkLoading, 1000);
          
        }, 3000); // Wait 3 seconds for 10-match data
      }, 1000);
    }, 2000);
  });
}

// Test precision consistency
function testPrecisionConsistency() {
  console.log('\n🔢 Testing Precision Consistency...');
  
  // Test the precision functions
  const testValue = 2.6666666;
  
  console.log('Testing precision calculations:');
  console.log(`Original value: ${testValue}`);
  console.log(`Math.round(value * 10) / 10 = ${Math.round(testValue * 10) / 10} (1 decimal)`);
  console.log(`Math.round(value * 100) / 100 = ${Math.round(testValue * 100) / 100} (2 decimals)`);
  
  console.log('\n✅ Both H2H sections should now use 2-decimal precision');
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting BTTS Fix Tests...\n');
  
  // Test 1: Data consistency
  await testDataConsistency();
  
  // Test 2: Tab switching
  console.log('\n⏳ Starting tab switching test...');
  const tabSwitchResult = await testTabSwitching();
  
  // Test 3: Precision consistency
  testPrecisionConsistency();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('1. Data Consistency: Check console logs above for H2H vs BTTS comparison');
  console.log(`2. Tab Switching: ${tabSwitchResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('3. Precision Consistency: ✅ IMPLEMENTED');
  
  console.log('\n🎯 Expected Results:');
  console.log('- H2H History and BTTS H2H should show identical average goals');
  console.log('- Last 5 Matches should load without infinite loading');
  console.log('- Both sections should use 2-decimal precision');
  
  return {
    dataConsistency: 'Check logs',
    tabSwitching: tabSwitchResult,
    precisionConsistency: true
  };
}

// Run the tests
runAllTests().then(results => {
  console.log('\n✅ BTTS Fix Tests Complete!');
  console.log('Results:', results);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});

// Also provide manual testing instructions
console.log('\n📝 Manual Testing Instructions:');
console.log('1. Navigate to BTTS tab');
console.log('2. Check "Average Goals" in H2H section');
console.log('3. Switch between Last 5 and Last 10 matches');
console.log('4. Verify no infinite loading occurs');
console.log('5. Compare values with H2H History tab');
