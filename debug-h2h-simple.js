// Simple debug script for browser console
// Navigate to http://localhost:3000/match/1569357 and click H2H tab, then run this

console.log('🔍 Simple H2H Debug Check...');

// Check if H2H table exists
const tables = document.querySelectorAll('table');
console.log(`Found ${tables.length} tables on page`);

if (tables.length > 0) {
  tables.forEach((table, index) => {
    const rows = table.querySelectorAll('tbody tr');
    console.log(`Table ${index + 1}: ${rows.length} rows`);
    
    if (rows.length > 0) {
      const firstRow = rows[0];
      const images = firstRow.querySelectorAll('img');
      console.log(`First row has ${images.length} images`);
      
      images.forEach((img, imgIndex) => {
        console.log(`Image ${imgIndex + 1}:`);
        console.log(`  - src: ${img.src}`);
        console.log(`  - alt: ${img.alt}`);
        console.log(`  - loaded: ${img.complete && img.naturalWidth > 0}`);
        
        if (!img.src || img.src.includes('ui-avatars.com')) {
          console.log(`  - ⚠️ Using fallback image`);
        } else {
          console.log(`  - ✅ Using real logo`);
        }
      });
    }
  });
} else {
  console.log('❌ No tables found - H2H data might not be loaded');
}

// Check for any error messages
const errorElements = document.querySelectorAll('[role="alert"], .chakra-alert');
if (errorElements.length > 0) {
  console.log('⚠️ Found error elements:', errorElements);
}

// Check for loading indicators
const loadingElements = document.querySelectorAll('[data-testid*="loading"], .chakra-spinner');
if (loadingElements.length > 0) {
  console.log('🔄 Found loading elements:', loadingElements);
}

// Try to manually fetch H2H data
console.log('\n🧪 Testing H2H API directly...');
fetch('http://localhost:5000/api/matches/1569357/h2h')
  .then(response => response.json())
  .then(data => {
    console.log('✅ H2H API Response:', data);
    
    if (data.success && data.result) {
      const h2hData = data.result;
      console.log('First Team Logo:', h2hData.firstTeam?.logo);
      console.log('Second Team Logo:', h2hData.secondTeam?.logo);
      
      if (h2hData.matches && h2hData.matches.length > 0) {
        const firstMatch = h2hData.matches[0];
        console.log('First Match Home Logo:', firstMatch.homeTeam?.logo);
        console.log('First Match Away Logo:', firstMatch.awayTeam?.logo);
      }
    }
  })
  .catch(error => {
    console.error('❌ H2H API Error:', error);
  });

console.log('\n📋 Instructions:');
console.log('1. Make sure you are on the H2H tab');
console.log('2. Check the console output above');
console.log('3. If images are using fallback (ui-avatars.com), the real logos are not loading');
console.log('4. If no tables are found, the H2H data is not being rendered');
