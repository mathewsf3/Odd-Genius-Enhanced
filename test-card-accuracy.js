// Test script to verify card statistics accuracy
// Run this in browser console on the match page

console.log('🔍 Testing Card Statistics Accuracy...');

// Expected data based on your analysis
const expectedData = {
  bragantino: {
    last5: {
      matches: [
        { date: '2025-05-23', opponent: 'Criciúma', yellowCards: 4, redCards: 0, venue: 'home' },
        { date: '2025-05-18', opponent: 'Palmeiras', yellowCards: 2, redCards: 0, venue: 'home' },
        { date: '2025-05-10', opponent: 'Grêmio', yellowCards: 3, redCards: 0, venue: 'away' },
        { date: '2025-05-05', opponent: 'Mirassol', yellowCards: 2, redCards: 0, venue: 'home' },
        { date: '2025-05-01', opponent: 'Criciúma', yellowCards: 1, redCards: 0, venue: 'away' }
      ],
      totalYellow: 12,
      totalRed: 0,
      totalCards: 12,
      averagePerMatch: 2.4
    }
  },
  juventude: {
    last5: {
      matches: [
        { date: '2025-05-18', opponent: 'Fluminense', yellowCards: 4, redCards: 0, venue: 'home' },
        { date: '2025-05-10', opponent: 'Fortaleza', yellowCards: 4, redCards: 0, venue: 'away' },
        { date: '2025-05-05', opponent: 'Atl-MG', yellowCards: 2, redCards: 0, venue: 'home' },
        { date: '2025-04-26', opponent: 'Internacional', yellowCards: 2, redCards: 0, venue: 'away' },
        { date: '2025-04-20', opponent: 'Mirassol', yellowCards: 2, redCards: 0, venue: 'home' }
      ],
      totalYellow: 14,
      totalRed: 0,
      totalCards: 14,
      averagePerMatch: 2.8
    }
  },
  combined: {
    expectedTotal: 5.2, // 2.4 + 2.8
    expectedOver3_5: 'Should be calculated from actual match totals',
    expectedOver4_5: 'Should be calculated from actual match totals'
  }
};

// Function to test the API endpoint directly
async function testCardStatsAPI() {
  try {
    const matchId = window.location.pathname.split('/').pop();
    console.log(`\n📊 Testing card stats API for match ID: ${matchId}`);
    
    // Test both 5 and 10 game counts
    for (const gameCount of [5, 10]) {
      console.log(`\n🎯 Testing with ${gameCount} games:`);
      
      const response = await fetch(`http://localhost:5000/api/card-stats/${matchId}?gameCount=${gameCount}`);
      const data = await response.json();
      
      console.log(`Response status: ${response.status}`);
      
      if (data.homeStats && data.awayStats) {
        console.log(`\n🏠 Home Team (${data.homeStats.teamName}):`);
        console.log(`- Total yellow cards: ${data.homeStats.totalYellowCards}`);
        console.log(`- Total red cards: ${data.homeStats.totalRedCards}`);
        console.log(`- Total cards: ${data.homeStats.totalCards}`);
        console.log(`- Average cards per match: ${data.homeStats.averageCardsPerMatch}`);
        console.log(`- Matches analyzed: ${data.homeStats.matchesAnalyzed}`);
        
        console.log(`\n🚌 Away Team (${data.awayStats.teamName}):`);
        console.log(`- Total yellow cards: ${data.awayStats.totalYellowCards}`);
        console.log(`- Total red cards: ${data.awayStats.totalRedCards}`);
        console.log(`- Total cards: ${data.awayStats.totalCards}`);
        console.log(`- Average cards per match: ${data.awayStats.averageCardsPerMatch}`);
        console.log(`- Matches analyzed: ${data.awayStats.matchesAnalyzed}`);
        
        if (data.combinedStats) {
          console.log(`\n🔄 Combined Stats:`);
          console.log(`- Expected cards: ${data.combinedStats.expectedCards}`);
          console.log(`- Over 3.5 rate: ${data.combinedStats.overRates["3.5"]}%`);
          console.log(`- Over 4.5 rate: ${data.combinedStats.overRates["4.5"]}%`);
          console.log(`- Over 5.5 rate: ${data.combinedStats.overRates["5.5"]}%`);
        }
        
        // Compare with expected data for last 5 games
        if (gameCount === 5) {
          console.log(`\n📈 Accuracy Check (Last 5 games):`);
          
          // Check Bragantino
          if (data.homeStats.teamName.toLowerCase().includes('bragantino')) {
            const expected = expectedData.bragantino.last5;
            const actual = data.homeStats;
            
            console.log(`\n🔍 Bragantino Comparison:`);
            console.log(`Expected average: ${expected.averagePerMatch} | Actual: ${actual.averageCardsPerMatch} | Diff: ${(actual.averageCardsPerMatch - expected.averagePerMatch).toFixed(2)}`);
            console.log(`Expected total: ${expected.totalCards} | Actual: ${actual.totalCards} | Diff: ${actual.totalCards - expected.totalCards}`);
            
            if (Math.abs(actual.averageCardsPerMatch - expected.averagePerMatch) > 0.1) {
              console.warn(`❌ Bragantino average cards per match is off by ${Math.abs(actual.averageCardsPerMatch - expected.averagePerMatch).toFixed(2)}`);
            } else {
              console.log(`✅ Bragantino data looks accurate`);
            }
          }
          
          // Check Juventude
          if (data.awayStats.teamName.toLowerCase().includes('juventude')) {
            const expected = expectedData.juventude.last5;
            const actual = data.awayStats;
            
            console.log(`\n🔍 Juventude Comparison:`);
            console.log(`Expected average: ${expected.averagePerMatch} | Actual: ${actual.averageCardsPerMatch} | Diff: ${(actual.averageCardsPerMatch - expected.averagePerMatch).toFixed(2)}`);
            console.log(`Expected total: ${expected.totalCards} | Actual: ${actual.totalCards} | Diff: ${actual.totalCards - expected.totalCards}`);
            
            if (Math.abs(actual.averageCardsPerMatch - expected.averagePerMatch) > 0.1) {
              console.warn(`❌ Juventude average cards per match is off by ${Math.abs(actual.averageCardsPerMatch - expected.averagePerMatch).toFixed(2)}`);
            } else {
              console.log(`✅ Juventude data looks accurate`);
            }
          }
          
          // Check combined expected total
          if (data.combinedStats) {
            const expectedCombined = expectedData.combined.expectedTotal;
            const actualCombined = data.combinedStats.expectedCards;
            
            console.log(`\n🔍 Combined Stats Comparison:`);
            console.log(`Expected total: ${expectedCombined} | Actual: ${actualCombined} | Diff: ${(actualCombined - expectedCombined).toFixed(2)}`);
            
            if (Math.abs(actualCombined - expectedCombined) > 0.2) {
              console.warn(`❌ Combined expected cards is off by ${Math.abs(actualCombined - expectedCombined).toFixed(2)}`);
            } else {
              console.log(`✅ Combined stats look accurate`);
            }
          }
        }
        
      } else {
        console.error(`❌ Invalid response structure:`, data);
      }
    }
    
  } catch (error) {
    console.error('Error testing card stats API:', error);
  }
}

// Function to check what's displayed in the UI
function checkUIValues() {
  console.log('\n🖥️ Checking UI Values...');
  
  // Look for card statistics in the UI
  const cardElements = document.querySelectorAll('[class*="card"], [data-testid*="card"]');
  console.log(`Found ${cardElements.length} potential card elements`);
  
  // Look for specific values
  const statNumbers = document.querySelectorAll('.chakra-stat__number, [class*="stat-number"]');
  console.log(`Found ${statNumbers.length} stat number elements`);
  
  statNumbers.forEach((el, index) => {
    const text = el.textContent?.trim();
    if (text && (text.includes('.') || !isNaN(parseFloat(text)))) {
      console.log(`Stat ${index + 1}: ${text}`);
    }
  });
  
  // Look for team names and their associated values
  const teamElements = document.querySelectorAll('[class*="team"], [class*="home"], [class*="away"]');
  console.log(`Found ${teamElements.length} potential team elements`);
}

// Function to provide debugging recommendations
function provideRecommendations() {
  console.log('\n💡 Debugging Recommendations:');
  console.log('1. Check backend logs for card extraction details');
  console.log('2. Verify AllSportsAPI field names being used');
  console.log('3. Check if cards from Copa do Brasil are being included/excluded');
  console.log('4. Verify date filtering is working correctly');
  console.log('5. Check if yellow2 + red card scenarios are handled properly');
  console.log('\n🔧 Potential fixes:');
  console.log('- Use met=Fixtures&include=cards for more complete data');
  console.log('- Check both yellowcards and yellowcards_ft fields');
  console.log('- Ensure statistics array is being parsed correctly');
  console.log('- Verify team ID matching logic');
}

// Run all tests
console.log('🚀 Starting Card Accuracy Tests...\n');

// Test 1: Check API data
testCardStatsAPI();

// Test 2: Check UI values
setTimeout(() => {
  checkUIValues();
}, 2000);

// Test 3: Provide recommendations
setTimeout(() => {
  provideRecommendations();
}, 3000);

console.log('\n✅ Card Accuracy Tests Initiated!');
console.log('Check the logs above to identify discrepancies.');
console.log('\nExpected Results:');
console.log('- Bragantino: 2.4 cards/match (last 5)');
console.log('- Juventude: 2.8 cards/match (last 5)');
console.log('- Combined: 5.2 expected total');
