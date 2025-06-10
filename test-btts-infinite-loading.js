// Test script specifically for BTTS infinite loading issue
// Run this in browser console on the match page

console.log('🔍 Testing BTTS Infinite Loading Issue...');

// Function to test the BTTS service directly with detailed monitoring
async function testBTTSInfiniteLoading() {
  try {
    const matchId = window.location.pathname.split('/').pop();
    console.log(`\n📊 Testing BTTS Infinite Loading for match ID: ${matchId}`);
    
    // Get team IDs from the page
    const homeTeamId = document.querySelector('[data-home-team-id]')?.getAttribute('data-home-team-id') || '1543';
    const awayTeamId = document.querySelector('[data-away-team-id]')?.getAttribute('data-away-team-id') || '1544';
    
    console.log(`Using team IDs: Home=${homeTeamId}, Away=${awayTeamId}`);
    
    // Test both 10 and 5 game counts with detailed monitoring
    for (const gameCount of [10, 5]) {
      console.log(`\n🎯 Testing BTTS with ${gameCount} games:`);
      console.log(`Expected timeout: ${gameCount === 5 ? '45 seconds' : '20 seconds'}`);
      
      const startTime = Date.now();
      console.log(`⏱️ Starting BTTS fetch at ${new Date().toISOString()}`);
      
      try {
        // Create a promise that will race against our own timeout
        const fetchPromise = fetch(`/api/btts-stats?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}&gameCount=${gameCount}`);
        
        // Create our own timeout to monitor the request
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Manual timeout after 50 seconds for ${gameCount} games`));
          }, 50000); // 50 second manual timeout
        });
        
        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
          console.error(`❌ API request failed with status ${response.status}: ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ BTTS fetch completed in ${duration}ms (${(duration/1000).toFixed(2)}s)`);
        
        // Analyze the response
        if (data.homeStats && data.awayStats) {
          console.log(`📊 Response Analysis:`);
          console.log(`- Home team: ${data.homeStats.teamName || 'Unknown'}`);
          console.log(`- Away team: ${data.awayStats.teamName || 'Unknown'}`);
          console.log(`- Home BTTS rate: ${data.homeStats.bttsYesPercentage}%`);
          console.log(`- Away BTTS rate: ${data.awayStats.bttsYesPercentage}%`);
          
          if (data.combinedStats) {
            console.log(`- Combined BTTS probability: ${data.combinedStats.bttsYesProbability}%`);
            console.log(`- Average total goals: ${data.combinedStats.averageTotalGoals}`);
          }
          
          // Check for the specific issues we fixed
          if (gameCount === 10) {
            if (data.awayStats.bttsYesPercentage === 60) {
              console.warn(`⚠️ Juventude still showing 60% BTTS rate - fix may not be working`);
            } else if (data.awayStats.bttsYesPercentage === 40) {
              console.log(`✅ Juventude showing correct 40% BTTS rate`);
            }
          }
          
        } else {
          console.error(`❌ Invalid response structure:`, data);
        }
        
        // Performance analysis
        if (duration > 30000) {
          console.warn(`⚠️ Request took ${(duration/1000).toFixed(2)}s - this is quite slow`);
        } else if (duration > 15000) {
          console.warn(`⚠️ Request took ${(duration/1000).toFixed(2)}s - this is slow but acceptable`);
        } else {
          console.log(`✅ Request completed in reasonable time: ${(duration/1000).toFixed(2)}s`);
        }
        
      } catch (apiError) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.error(`❌ Error testing BTTS for ${gameCount} games after ${(duration/1000).toFixed(2)}s:`, apiError);
        
        if (apiError.message?.includes('timeout') || apiError.message?.includes('Manual timeout')) {
          console.error(`🚨 CONFIRMED: Infinite loading issue for ${gameCount} games`);
          console.error(`🔍 This request timed out after ${(duration/1000).toFixed(2)} seconds`);
          
          if (gameCount === 5) {
            console.error(`🎯 ROOT CAUSE: 5-game requests are timing out`);
            console.error(`💡 SOLUTION: Need to increase timeouts or optimize API calls`);
          }
        }
        
        // Check if it's a network error
        if (apiError.name === 'TypeError' && apiError.message.includes('fetch')) {
          console.error(`🌐 Network error detected - check internet connection`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing BTTS infinite loading:', error);
  }
}

// Function to monitor the UI for infinite loading
function monitorUILoading() {
  console.log('\n🖥️ Monitoring UI for infinite loading...');
  
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
      console.log('🔄 Clicking "Last 10 Matches" tab...');
      last10Tab.click();
      
      setTimeout(() => {
        // Wait for 10-match data to load
        console.log('⏳ Waiting for Last 10 data to load...');
        
        setTimeout(() => {
          console.log('🔄 Switching to "Last 5 Matches" tab...');
          last5Tab.click();
          
          const switchTime = Date.now();
          let checkCount = 0;
          const maxChecks = 30; // Check for up to 60 seconds (30 * 2s)
          
          // Monitor for infinite loading
          const checkLoading = () => {
            checkCount++;
            const spinners = document.querySelectorAll('.chakra-spinner');
            const currentTime = Date.now();
            const elapsed = currentTime - switchTime;
            
            console.log(`📊 Check ${checkCount}/${maxChecks}: Time elapsed: ${(elapsed/1000).toFixed(1)}s, Spinners: ${spinners.length}`);
            
            if (spinners.length === 0) {
              console.log(`✅ Last 5 Matches loaded successfully in ${(elapsed/1000).toFixed(1)}s`);
              resolve(true);
            } else if (checkCount >= maxChecks) {
              console.error(`❌ INFINITE LOADING CONFIRMED - still loading after ${(elapsed/1000).toFixed(1)}s`);
              console.error(`🚨 Found ${spinners.length} active spinners`);
              resolve(false);
            } else {
              // Check again in 2 seconds
              setTimeout(checkLoading, 2000);
            }
          };
          
          // Start monitoring after 1 second
          setTimeout(checkLoading, 1000);
          
        }, 5000); // Wait 5 seconds for 10-match data
      }, 1000);
    }, 2000);
  });
}

// Function to check console for timeout errors
function checkConsoleErrors() {
  console.log('\n🔍 Checking for console errors...');
  
  // Override console.error to catch BTTS service errors
  const originalError = console.error;
  const bttsErrors = [];
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('BTTSStatsService') || message.includes('BTTS')) {
      bttsErrors.push({
        timestamp: new Date().toISOString(),
        message: message
      });
    }
    originalError.apply(console, args);
  };
  
  // Restore original console.error after 60 seconds
  setTimeout(() => {
    console.error = originalError;
    
    if (bttsErrors.length > 0) {
      console.log(`\n📋 Captured ${bttsErrors.length} BTTS-related errors:`);
      bttsErrors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.timestamp}] ${error.message}`);
      });
    } else {
      console.log(`✅ No BTTS-related errors captured`);
    }
  }, 60000);
  
  return bttsErrors;
}

// Main test function
async function runInfiniteLoadingTests() {
  console.log('🚀 Starting BTTS Infinite Loading Tests...\n');
  
  // Start monitoring console errors
  const errorMonitor = checkConsoleErrors();
  
  // Test 1: Direct API testing
  console.log('📡 Test 1: Direct API Testing');
  await testBTTSInfiniteLoading();
  
  // Test 2: UI monitoring
  console.log('\n🖥️ Test 2: UI Loading Monitoring');
  const uiResult = await monitorUILoading();
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`1. Direct API Test: Check logs above for timeout issues`);
  console.log(`2. UI Loading Test: ${uiResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n🎯 Expected Results:');
  console.log('- Both 5 and 10 game requests should complete within their timeout limits');
  console.log('- Last 5 Matches tab should load without infinite loading');
  console.log('- No timeout errors in console logs');
  
  console.log('\n💡 If tests fail:');
  console.log('1. Check console for timeout errors');
  console.log('2. Verify API endpoints are responding');
  console.log('3. Check network connectivity');
  console.log('4. Consider increasing timeout values further');
  
  return {
    apiTest: 'Check logs',
    uiTest: uiResult,
    errorMonitor: errorMonitor
  };
}

// Run the tests
runInfiniteLoadingTests().then(results => {
  console.log('\n✅ BTTS Infinite Loading Tests Complete!');
  console.log('Results:', results);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});

// Also provide manual testing instructions
console.log('\n📝 Manual Testing Instructions:');
console.log('1. Navigate to BTTS tab');
console.log('2. Click "Last 10 Matches" and wait for load');
console.log('3. Click "Last 5 Matches" and monitor for infinite loading');
console.log('4. Check browser console for timeout errors');
console.log('5. If loading takes >45 seconds, it\'s likely infinite loading');
