// Browser console test script for H2H logo fix
// Navigate to http://localhost:3000/match/1569357, click H2H tab, then run this

console.log('🎯 Testing H2H Logo Fix...');

// Function to check if logos are displaying correctly
const checkH2HLogos = () => {
  console.log('\n🔍 Checking H2H Logo Display...');
  
  // Look for H2H tables
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables on page`);
  
  if (tables.length === 0) {
    console.log('❌ No tables found - make sure you are on the H2H tab');
    return;
  }
  
  let h2hTable = null;
  tables.forEach((table, index) => {
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
      console.log(`Table ${index + 1}: ${rows.length} rows`);
      h2hTable = table;
    }
  });
  
  if (!h2hTable) {
    console.log('❌ No H2H table with data found');
    return;
  }
  
  const rows = h2hTable.querySelectorAll('tbody tr');
  console.log(`\n📊 Analyzing ${rows.length} H2H match rows...`);
  
  let totalLogos = 0;
  let successfulLogos = 0;
  let fallbackLogos = 0;
  
  rows.forEach((row, rowIndex) => {
    const images = row.querySelectorAll('img');
    console.log(`\nRow ${rowIndex + 1}: ${images.length} images`);
    
    images.forEach((img, imgIndex) => {
      totalLogos++;
      
      const isLoaded = img.complete && img.naturalWidth > 0;
      const isFallback = img.src.includes('ui-avatars.com');
      
      console.log(`  Image ${imgIndex + 1}:`);
      console.log(`    - Alt: ${img.alt}`);
      console.log(`    - Loaded: ${isLoaded ? '✅' : '❌'}`);
      console.log(`    - Type: ${isFallback ? 'Fallback' : 'Real Logo'}`);
      console.log(`    - URL: ${img.src}`);
      
      if (isLoaded) {
        successfulLogos++;
        if (isFallback) {
          fallbackLogos++;
        }
      }
    });
    
    // Only show first 3 rows to avoid spam
    if (rowIndex >= 2) {
      console.log(`  ... (showing first 3 of ${rows.length} rows)`);
      return false;
    }
  });
  
  console.log(`\n📈 Logo Summary:`);
  console.log(`  - Total logos: ${totalLogos}`);
  console.log(`  - Successfully loaded: ${successfulLogos}/${totalLogos}`);
  console.log(`  - Real logos: ${successfulLogos - fallbackLogos}/${totalLogos}`);
  console.log(`  - Fallback logos: ${fallbackLogos}/${totalLogos}`);
  
  if (successfulLogos === totalLogos) {
    console.log('✅ SUCCESS: All H2H logos are displaying!');
    if (fallbackLogos === 0) {
      console.log('🎉 PERFECT: All logos are real team logos (no fallbacks)!');
    } else {
      console.log(`⚠️ NOTE: ${fallbackLogos} logos are using fallback avatars`);
    }
  } else {
    console.log('❌ ISSUE: Some logos failed to load');
  }
};

// Function to check console logs for H2H component
const checkConsoleLogs = () => {
  console.log('\n📝 Monitor console for H2H component logs...');
  console.log('Look for messages starting with:');
  console.log('- 🔍 [H2H Component] (component data)');
  console.log('- ✅ [H2H] Team logo loaded successfully');
  console.log('- ❌ [H2H] Team logo load error');
};

// Function to check if H2H data is loaded
const checkH2HData = () => {
  console.log('\n📊 Checking H2H Data Loading...');
  
  // Look for loading indicators
  const spinners = document.querySelectorAll('.chakra-spinner, [data-testid*="loading"]');
  if (spinners.length > 0) {
    console.log('🔄 Loading indicators found - data may still be loading');
    return;
  }
  
  // Look for error messages
  const alerts = document.querySelectorAll('[role="alert"], .chakra-alert');
  if (alerts.length > 0) {
    console.log('⚠️ Alert messages found:', alerts);
    return;
  }
  
  // Look for "No data" messages
  const noDataElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.toLowerCase().includes('no head-to-head data')
  );
  
  if (noDataElements.length > 0) {
    console.log('❌ "No H2H data" message found - data not loaded');
    return;
  }
  
  console.log('✅ H2H data appears to be loaded');
};

// Main test function
const runH2HLogoTest = () => {
  console.log('🚀 Starting H2H Logo Test...');
  
  checkH2HData();
  checkH2HLogos();
  checkConsoleLogs();
  
  console.log('\n🎯 Test Complete!');
  console.log('\n📋 Instructions:');
  console.log('1. Make sure you clicked on the "Head to Head" tab');
  console.log('2. Wait for data to load completely');
  console.log('3. Check the Recent Encounters table for team logos');
  console.log('4. All team logos should be visible (either real logos or fallback avatars)');
  console.log('5. Check browser console for any error messages');
};

// Run the test
runH2HLogoTest();

// Set up periodic monitoring
console.log('\n🔄 Setting up periodic monitoring...');
setInterval(() => {
  console.log('\n--- Periodic Check ---');
  checkH2HLogos();
}, 10000);
