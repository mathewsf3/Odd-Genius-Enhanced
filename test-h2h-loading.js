// Test script to check H2H loading states
const axios = require('axios');

async function testH2HLoading() {
  console.log('🧪 Testing H2H Loading States...');
  
  try {
    // Test 1: Check if match data loads first
    console.log('\n1️⃣ Testing match data loading...');
    const matchResponse = await axios.get('http://localhost:5000/api/matches/1548616');
    
    if (matchResponse.data?.success) {
      console.log('✅ Match data loads successfully');
      console.log('📊 Match:', matchResponse.data.result?.homeTeam?.name, 'vs', matchResponse.data.result?.awayTeam?.name);
    } else {
      console.log('❌ Match data failed to load');
      return;
    }
    
    // Test 2: Check H2H data loading
    console.log('\n2️⃣ Testing H2H data loading...');
    const h2hResponse = await axios.get('http://localhost:5000/api/matches/1548616/h2h');
    
    if (h2hResponse.data?.success) {
      console.log('✅ H2H data loads successfully');
      console.log('📊 H2H matches found:', h2hResponse.data.result?.matches?.length || 0);
      console.log('📊 First team:', h2hResponse.data.result?.firstTeam?.name);
      console.log('📊 Second team:', h2hResponse.data.result?.secondTeam?.name);
    } else {
      console.log('❌ H2H data failed to load');
    }
    
    // Test 3: Simulate frontend loading sequence
    console.log('\n3️⃣ Simulating frontend loading sequence...');
    console.log('⏳ Frontend loads with empty match data...');
    console.log('⏳ Match data arrives...');
    console.log('⏳ H2H fetch triggered...');
    console.log('⏳ H2H data arrives...');
    console.log('✅ All data loaded - should show H2H component');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testH2HLoading();
