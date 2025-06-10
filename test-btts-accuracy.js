// Test script to verify BTTS statistics accuracy
// Run this in browser console on the match page

console.log('🔍 Testing BTTS Statistics Accuracy...');

// Expected data based on your detailed analysis
const expectedData = {
  h2h: {
    totalMatches: 10,
    bttsYes: 6,
    bttsRate: 60 // This should be correct according to your analysis
  },
  bragantino: {
    last10: {
      bttsYes: 4,
      bttsRate: 40,
      cleanSheets: 4, // Updated based on your analysis
      cleanSheetRate: 40, // Updated: 4/10 = 40%
      failedToScore: 3, // Updated based on your analysis
      failedToScoreRate: 30, // Updated: 3/10 = 30%
      goalsFor: 15,
      averageGoalsFor: 1.5
    }
  },
  juventude: {
    last10: {
      bttsYes: 4, // Your analysis shows this should be 40%, not 60%
      bttsRate: 40,
      cleanSheets: 1,
      cleanSheetRate: 10, // 1/10 = 10%
      failedToScore: 6,
      failedToScoreRate: 60, // 6/10 = 60%
      goalsFor: 5,
      averageGoalsFor: 0.5
    }
  },
  combined: {
    averageGoalsTotal: 2.0, // 1.5 + 0.5 = 2.0 (not 2.2)
    expectedUI: 2.0 // Should now show 2.0 after fix
  }
};

// Function to test BTTS API directly
async function testBTTSAPI() {
  try {
    const matchId = window.location.pathname.split('/').pop();
    console.log(`\n📊 Testing BTTS API for match ID: ${matchId}`);

    // Test both 5 and 10 game counts
    for (const gameCount of [5, 10]) {
      console.log(`\n🎯 Testing BTTS with ${gameCount} games:`);

      try {
        // Get team IDs from the page
        const homeTeamId = document.querySelector('[data-home-team-id]')?.getAttribute('data-home-team-id') || '1543';
        const awayTeamId = document.querySelector('[data-away-team-id]')?.getAttribute('data-away-team-id') || '1544';

        console.log(`Using team IDs: Home=${homeTeamId}, Away=${awayTeamId}`);

        // Test the service directly
        const startTime = Date.now();
        console.log(`Starting BTTS fetch at ${new Date().toISOString()}`);

        // This will use the same service as the component
        const response = await fetch(`/api/btts-stats?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}&gameCount=${gameCount}`);

        if (!response.ok) {
          console.error(`❌ API request failed with status ${response.status}`);
          continue;
        }

        const data = await response.json();
        const endTime = Date.now();

        console.log(`✅ BTTS fetch completed in ${endTime - startTime}ms`);
        console.log(`Response data:`, data);

        if (data.homeStats && data.awayStats) {
          console.log(`\n🏠 Home Team (${data.homeStats.teamName || 'Bragantino'}):`);
          console.log(`- Total matches: ${data.homeStats.totalMatches}`);
          console.log(`- BTTS Yes: ${data.homeStats.bttsYesCount}/${data.homeStats.totalMatches} = ${data.homeStats.bttsYesPercentage}%`);
          console.log(`- Clean Sheets: ${data.homeStats.cleanSheetCount}/${data.homeStats.totalMatches} = ${data.homeStats.cleanSheetPercentage}%`);
          console.log(`- Failed to Score: ${data.homeStats.failedToScoreCount}/${data.homeStats.totalMatches} = ${data.homeStats.failedToScorePercentage}%`);

          console.log(`\n🚌 Away Team (${data.awayStats.teamName || 'Juventude'}):`);
          console.log(`- Total matches: ${data.awayStats.totalMatches}`);
          console.log(`- BTTS Yes: ${data.awayStats.bttsYesCount}/${data.awayStats.totalMatches} = ${data.awayStats.bttsYesPercentage}%`);
          console.log(`- Clean Sheets: ${data.awayStats.cleanSheetCount}/${data.awayStats.totalMatches} = ${data.awayStats.cleanSheetPercentage}%`);
          console.log(`- Failed to Score: ${data.awayStats.failedToScoreCount}/${data.awayStats.totalMatches} = ${data.awayStats.failedToScorePercentage}%`);

          if (data.h2hStats) {
            console.log(`\n🔄 Head-to-Head:`);
            console.log(`- Total matches: ${data.h2hStats.totalMatches}`);
            console.log(`- BTTS Yes: ${data.h2hStats.bttsYesCount}/${data.h2hStats.totalMatches} = ${data.h2hStats.bttsYesPercentage}%`);
          }

          if (data.combinedStats) {
            console.log(`\n📈 Combined Stats:`);
            console.log(`- BTTS Probability: ${data.combinedStats.bttsYesProbability}%`);
            console.log(`- Prediction: ${data.combinedStats.prediction}`);
            console.log(`- Average Total Goals: ${data.combinedStats.averageTotalGoals}`);
          }

          // Compare with expected data for last 10 games
          if (gameCount === 10) {
            console.log(`\n📊 Accuracy Check (Last 10 games):`);

            // Check Bragantino
            const expectedBrag = expectedData.bragantino.last10;
            const actualBrag = data.homeStats;

            console.log(`\n🔍 Bragantino Comparison:`);
            console.log(`BTTS Rate - Expected: ${expectedBrag.bttsRate}% | Actual: ${actualBrag.bttsYesPercentage}% | Diff: ${actualBrag.bttsYesPercentage - expectedBrag.bttsRate}%`);
            console.log(`Clean Sheet Rate - Expected: ${expectedBrag.cleanSheetRate}% | Actual: ${actualBrag.cleanSheetPercentage}% | Diff: ${actualBrag.cleanSheetPercentage - expectedBrag.cleanSheetRate}%`);

            if (Math.abs(actualBrag.bttsYesPercentage - expectedBrag.bttsRate) > 5) {
              console.warn(`❌ Bragantino BTTS rate is off by ${Math.abs(actualBrag.bttsYesPercentage - expectedBrag.bttsRate)}%`);
            } else {
              console.log(`✅ Bragantino BTTS data looks accurate`);
            }

            // Check Juventude
            const expectedJuv = expectedData.juventude.last10;
            const actualJuv = data.awayStats;

            console.log(`\n🔍 Juventude Comparison:`);
            console.log(`BTTS Rate - Expected: ${expectedJuv.bttsRate}% | Actual: ${actualJuv.bttsYesPercentage}% | Diff: ${actualJuv.bttsYesPercentage - expectedJuv.bttsRate}%`);
            console.log(`Clean Sheet Rate - Expected: ${expectedJuv.cleanSheetRate}% | Actual: ${actualJuv.cleanSheetPercentage}% | Diff: ${actualJuv.cleanSheetPercentage - expectedJuv.cleanSheetRate}%`);

            if (Math.abs(actualJuv.bttsYesPercentage - expectedJuv.bttsRate) > 5) {
              console.warn(`❌ Juventude BTTS rate is off by ${Math.abs(actualJuv.bttsYesPercentage - expectedJuv.bttsRate)}% (showing ${actualJuv.bttsYesPercentage}% instead of ${expectedJuv.bttsRate}%)`);
            } else {
              console.log(`✅ Juventude BTTS data looks accurate`);
            }

            // Check H2H
            if (data.h2hStats) {
              const expectedH2H = expectedData.h2h;
              const actualH2H = data.h2hStats;

              console.log(`\n🔍 H2H Comparison:`);
              console.log(`BTTS Rate - Expected: ${expectedH2H.bttsRate}% | Actual: ${actualH2H.bttsYesPercentage}% | Diff: ${actualH2H.bttsYesPercentage - expectedH2H.bttsRate}%`);

              if (Math.abs(actualH2H.bttsYesPercentage - expectedH2H.bttsRate) > 5) {
                console.warn(`❌ H2H BTTS rate is off by ${Math.abs(actualH2H.bttsYesPercentage - expectedH2H.bttsRate)}%`);
              } else {
                console.log(`✅ H2H BTTS data looks accurate`);
              }
            }
          }

        } else {
          console.error(`❌ Invalid response structure:`, data);
        }

      } catch (apiError) {
        console.error(`❌ Error testing BTTS API for ${gameCount} games:`, apiError);

        if (apiError.message?.includes('timeout')) {
          console.log(`⏰ Request timed out for ${gameCount} games - this explains the infinite loading`);
        }
      }
    }

  } catch (error) {
    console.error('Error testing BTTS API:', error);
  }
}

// Function to test the tab switching issue
function testTabSwitching() {
  console.log('\n🔄 Testing Tab Switching...');

  // Find the BTTS tab
  const tabs = document.querySelectorAll('[role="tab"]');
  const bttsTab = Array.from(tabs).find(tab => tab.textContent?.includes('BTTS'));

  if (bttsTab) {
    console.log('Found BTTS tab, clicking it...');
    bttsTab.click();

    setTimeout(() => {
      // Look for the game count tabs within BTTS
      const gameCountTabs = document.querySelectorAll('.chakra-tabs__tab');
      const last5Tab = Array.from(gameCountTabs).find(tab => tab.textContent?.includes('Last 5'));

      if (last5Tab) {
        console.log('Found "Last 5 Matches" tab, testing click...');
        last5Tab.click();

        // Check if loading state appears
        setTimeout(() => {
          const spinners = document.querySelectorAll('.chakra-spinner');
          if (spinners.length > 0) {
            console.log('⏳ Loading spinner detected - monitoring for infinite loading...');

            // Check again after 10 seconds
            setTimeout(() => {
              const stillSpinning = document.querySelectorAll('.chakra-spinner');
              if (stillSpinning.length > 0) {
                console.warn('❌ Still loading after 10 seconds - infinite loading confirmed!');
              } else {
                console.log('✅ Loading completed successfully');
              }
            }, 10000);
          } else {
            console.log('✅ No loading spinner - data loaded immediately');
          }
        }, 1000);
      } else {
        console.log('❌ Could not find "Last 5 Matches" tab');
      }
    }, 2000);
  } else {
    console.log('❌ Could not find BTTS tab');
  }
}

// Function to provide debugging recommendations
function provideRecommendations() {
  console.log('\n💡 BTTS Debugging Recommendations:');
  console.log('1. Check if API requests are timing out for 5-game requests');
  console.log('2. Verify BTTS calculation logic (both teams must score)');
  console.log('3. Check clean sheet calculation (team conceded 0 goals)');
  console.log('4. Verify failed to score calculation (team scored 0 goals)');
  console.log('5. Ensure same fixture list is used for all calculations');
  console.log('\n🔧 Potential fixes:');
  console.log('- Add better timeout handling for 5-game requests');
  console.log('- Fix Juventude BTTS rate calculation (should be 40%, not 60%)');
  console.log('- Verify goal scoring averages match official sources');
  console.log('- Ensure clean sheet counts are accurate');
}

// Run all tests
console.log('🚀 Starting BTTS Accuracy Tests...\n');

// Test 1: Test API directly
testBTTSAPI();

// Test 2: Test tab switching after a delay
setTimeout(() => {
  testTabSwitching();
}, 3000);

// Test 3: Provide recommendations
setTimeout(() => {
  provideRecommendations();
}, 5000);

console.log('\n✅ BTTS Accuracy Tests Initiated!');
console.log('Expected Results:');
console.log('- H2H BTTS Rate: 60% ✅');
console.log('- Bragantino BTTS Rate: 40%');
console.log('- Juventude BTTS Rate: 40% (not 60%)');
console.log('- No infinite loading on "Last 5 Matches"');
