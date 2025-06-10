// Test script to debug card player data
// Run this in browser console on the match page

console.log('🔍 Testing Card Player Data...');

// Function to test the API endpoint directly
async function testCardPlayerAPI() {
  try {
    const matchId = window.location.pathname.split('/').pop();
    console.log(`Testing card stats for match ID: ${matchId}`);
    
    // Test both 5 and 10 game counts
    for (const gameCount of [5, 10]) {
      console.log(`\n📊 Testing with ${gameCount} games:`);
      
      const response = await fetch(`http://localhost:5000/api/card-stats/${matchId}?gameCount=${gameCount}`);
      const data = await response.json();
      
      console.log(`Response status: ${response.status}`);
      console.log(`Full response:`, data);
      
      if (data.homeStats) {
        console.log(`Home team (${data.homeStats.teamName}):`);
        console.log(`- Total cards: ${data.homeStats.totalCards}`);
        console.log(`- Most carded players:`, data.homeStats.mostCardedPlayers);
        console.log(`- Player count: ${data.homeStats.mostCardedPlayers?.length || 0}`);
        
        if (data.homeStats.mostCardedPlayers?.length > 0) {
          console.log(`- First player:`, data.homeStats.mostCardedPlayers[0]);
        }
      }
      
      if (data.awayStats) {
        console.log(`Away team (${data.awayStats.teamName}):`);
        console.log(`- Total cards: ${data.awayStats.totalCards}`);
        console.log(`- Most carded players:`, data.awayStats.mostCardedPlayers);
        console.log(`- Player count: ${data.awayStats.mostCardedPlayers?.length || 0}`);
        
        if (data.awayStats.mostCardedPlayers?.length > 0) {
          console.log(`- First player:`, data.awayStats.mostCardedPlayers[0]);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing card player API:', error);
  }
}

// Function to check what data is currently in the component
function checkCurrentComponentData() {
  console.log('\n🔍 Checking current component data...');
  
  // Try to find the card tab component data
  const cardTabElements = document.querySelectorAll('[data-testid="card-tab"], .card-tab, [class*="card"]');
  console.log(`Found ${cardTabElements.length} potential card tab elements`);
  
  // Check if there are any "No player card data available" messages
  const noDataMessages = Array.from(document.querySelectorAll('td')).filter(td => 
    td.textContent?.includes('No player card data available')
  );
  
  if (noDataMessages.length > 0) {
    console.log(`❌ Found ${noDataMessages.length} "No player card data available" messages`);
  } else {
    console.log(`✅ No "No player card data available" messages found`);
  }
  
  // Check for player tables
  const playerTables = document.querySelectorAll('table');
  console.log(`Found ${playerTables.length} tables on the page`);
  
  playerTables.forEach((table, index) => {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
    if (headers.some(h => h?.includes('Player') || h?.includes('Yellow') || h?.includes('Red'))) {
      console.log(`Table ${index + 1} appears to be a player table:`, headers);
      
      const rows = table.querySelectorAll('tbody tr');
      console.log(`- Has ${rows.length} data rows`);
      
      if (rows.length > 0) {
        const firstRowCells = Array.from(rows[0].querySelectorAll('td')).map(td => td.textContent);
        console.log(`- First row data:`, firstRowCells);
      }
    }
  });
}

// Function to simulate the component's data processing
function simulateDataProcessing() {
  console.log('\n🧪 Simulating data processing...');
  
  // Mock data structure that should work
  const mockPlayerData = [
    {
      playerId: 'player_1',
      playerName: 'João Silva',
      yellowCards: 3,
      redCards: 0,
      totalCards: 3,
      matchesPlayed: 5,
      cardsPerMatch: 0.6
    },
    {
      playerId: 'player_2', 
      playerName: 'Carlos Santos',
      yellowCards: 2,
      redCards: 1,
      totalCards: 3,
      matchesPlayed: 5,
      cardsPerMatch: 0.6
    }
  ];
  
  console.log('Mock player data structure:', mockPlayerData);
  
  // Test the rendering logic
  const hasValidData = mockPlayerData && mockPlayerData.length > 0;
  console.log('Has valid data:', hasValidData);
  
  if (hasValidData) {
    console.log('✅ Mock data would render correctly');
    mockPlayerData.forEach((player, index) => {
      console.log(`Player ${index + 1}: ${player.playerName} - ${player.yellowCards}Y, ${player.redCards}R, ${player.totalCards}T`);
    });
  } else {
    console.log('❌ Mock data would show "No Data" message');
  }
}

// Run all tests
console.log('🚀 Starting Card Player Data Tests...\n');

// Test 1: Check current component state
checkCurrentComponentData();

// Test 2: Test API directly
testCardPlayerAPI();

// Test 3: Simulate data processing
simulateDataProcessing();

console.log('\n✅ Card Player Data Tests Complete!');
console.log('Check the logs above to identify the issue.');
console.log('\nNext steps:');
console.log('1. If API returns empty mostCardedPlayers arrays, the issue is in the backend');
console.log('2. If API returns data but component shows "No Data", the issue is in the frontend');
console.log('3. If both work, check the data flow between service and component');
