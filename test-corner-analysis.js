const axios = require('axios');

async function testCornerAnalysis() {
  console.log('Testing Enhanced Corner Analysis Features...\n');
  
  try {
    const baseUrl = 'http://localhost:3000/api';
    
    // Test queries that should trigger corner analysis
    const testQueries = [
      "Arsenal vs Chelsea corner analysis",
      "Manchester United vs Liverpool betting analysis",
      "Real Madrid Barcelona over under corners",
      "Show me corner predictions for today's matches"
    ];
    
    for (const query of testQueries) {
      console.log(`\n🧪 Testing: "${query}"`);
      console.log('=' * 60);
      
      try {
        const response = await axios.post(`${baseUrl}/chat`, { 
          message: query 
        });
        
        const responseText = response.data.message;
        
        // Check for enhanced corner analysis features
        console.log('\n📊 Response:');
        console.log(responseText.substring(0, 500) + '...');
        
        // Analyze content for corner betting features
        const hasCornerAnalysis = responseText.includes('Corners Analysis');
        const hasBettingMarkets = responseText.includes('Over/Under Markets');
        const hasExpectedTotals = responseText.includes('Expected Total Corners');
        const hasProbabilities = responseText.includes('probability');
        const hasRecommendations = responseText.includes('recommendation');
        const hasConfidence = responseText.includes('confidence');
        
        console.log('\n✅ Feature Detection:');
        console.log(`• Corner Analysis: ${hasCornerAnalysis ? '✓' : '✗'}`);
        console.log(`• Betting Markets: ${hasBettingMarkets ? '✓' : '✗'}`);
        console.log(`• Expected Totals: ${hasExpectedTotals ? '✓' : '✗'}`);
        console.log(`• Probabilities: ${hasProbabilities ? '✓' : '✗'}`);
        console.log(`• Recommendations: ${hasRecommendations ? '✓' : '✗'}`);
        console.log(`• Confidence Levels: ${hasConfidence ? '✓' : '✗'}`);
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎯 Testing complete!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testCornerAnalysis();
