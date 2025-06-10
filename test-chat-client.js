/**
 * Test client for the enhanced chat functionality
 * This script will directly test the chatService's ability to dynamically find matches
 * and provide comprehensive analysis based on user queries
 */

const axios = require('axios');

// Test queries to simulate user input
const TEST_QUERIES = [
  "Analyze Spain vs France match",
  "What do you think about Manchester United against Chelsea?",
  "Give me insights on Barcelona x Real Madrid",
  "Tell me about the Germany and England game",
  "What are the odds for Brazil versus Argentina?",
  "I'm interested in the match between Liverpool and Arsenal",
  "What's your prediction for Bayern Munich playing Dortmund?",
  "Should I bet on PSG vs Marseille?",
  "Analysis for the teams Spain and France",
  "How will AC Milan perform against Inter?"
];

async function testChatFunctionality() {
  console.log('Testing enhanced chat functionality with dynamic match search...\n');
  
  try {
    const baseUrl = 'http://localhost:3000/api';
    
    // Test each query
    for (const query of TEST_QUERIES) {
      console.log(`\n\n===== TESTING QUERY: "${query}" =====\n`);
      
      // Call the chat endpoint
      const response = await axios.post(`${baseUrl}/chat`, { message: query });
      
      // Display the response
      console.log('RESPONSE:');
      console.log('------------------------');
      console.log(response.data.message);
      console.log('------------------------');
      
      // Analyze the response quality
      const responseText = response.data.message;
      const includesMatchDetails = responseText.includes('Match Details');
      const includesBettingAnalysis = responseText.includes('Betting Analysis');
      const includesTeamForm = responseText.includes('Recent Team Form');
      const includesH2H = responseText.includes('Head-to-Head');
      
      console.log('\nResponse Quality:');
      console.log(`- Includes Match Details: ${includesMatchDetails ? '✅' : '❌'}`);
      console.log(`- Includes Betting Analysis: ${includesBettingAnalysis ? '✅' : '❌'}`);
      console.log(`- Includes Team Form: ${includesTeamForm ? '✅' : '❌'}`);
      console.log(`- Includes Head-to-Head: ${includesH2H ? '✅' : '❌'}`);
      
      // Add a delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n\nAll test queries completed!');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
  }
}

// Run the test
testChatFunctionality().catch(console.error);
