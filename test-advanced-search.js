/**
 * Advanced test cases for the dynamic match search functionality
 * This script tests edge cases and challenging search patterns
 */

const ChatServiceTest = require('./test-dynamic-search').ChatServiceTest;

// Advanced test cases
const ADVANCED_TEST_QUERIES = [
  // Partial and abbreviated names
  ["st vincent", "anguilla"],  // Testing partial team name
  ["svag", "anguilla"],  // Testing abbreviation
  ["deportes", "medellin"],  // Testing partial names for both teams
  
  // Case variations
  ["SPAIN", "FRANCE"],  // All caps
  ["BoTaFoGo Rj", "CeArA"],  // Mixed case
  
  // Special characters
  ["américa de cali", "júnior"],  // Accented characters
  ["schott-mainz", "idar_oberstein"],  // Different separators
  
  // Common variations
  ["st. vincent", "anguilla"],  // With period
  ["botafogo-rj", "ceara sc"],  // With suffix variations
  ["dep. tolima", "independiente medellin"],  // With abbreviations and full names
  
  // Reversed order
  ["france", "spain"],  // Reversed order of teams
  ["ceara", "botafogo-rj"],  // Reversed with special characters
  
  // Multiple word matches
  ["saint vincent grenadines", "anguilla"],  // Multiple word partial match
  ["america cali", "junior fc"],  // Partial multiple words
  
  // Similar team names
  ["botafogo rj", "botafogo sp"],  // Similar team names
  ["america", "junior"],  // Common partial names
];

async function runAdvancedTests() {
  console.log('Running advanced test cases for dynamic match search...\n');
  
  const chatService = new ChatServiceTest();
  
  for (const searchTerms of ADVANCED_TEST_QUERIES) {
    console.log(`\n===== TESTING ADVANCED QUERY: ${searchTerms.join(' vs ')} =====\n`);
    
    try {
      // Try to find the match
      const match = await chatService.findMatchDynamically(searchTerms);
      
      if (match) {
        console.log('Match found:');
        console.log('- Teams:', match.homeTeam?.name, 'vs', match.awayTeam?.name);
        console.log('- Date:', match.date, match.time);
        console.log('- League:', match.league?.name);
        
        if (match.id) {
          console.log('\nFetching detailed analysis...');
          const analysis = await chatService.getDetailedMatchAnalysis(match.id);
          
          if (analysis) {
            console.log('\nAnalysis data available:');
            console.log('- Match details:', analysis.matchDetails ? '✅' : '❌');
            console.log('- H2H data:', analysis.h2h ? '✅' : '❌');
            console.log('- Corners analysis:', analysis.corners ? '✅' : '❌');
            console.log('- BTTS analysis:', analysis.btts ? '✅' : '❌');
            console.log('- Cards analysis:', analysis.cards ? '✅' : '❌');
            console.log('- General analysis:', analysis.analysis ? '✅' : '❌');
          } else {
            console.log('No detailed analysis available');
          }
        }
      } else {
        console.log('No match found for these search terms');
      }
      
      // Add a delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error during test:', error.message);
    }
  }
  
  console.log('\nAll advanced tests completed!');
}

// Run the advanced tests
runAdvancedTests().catch(console.error);
