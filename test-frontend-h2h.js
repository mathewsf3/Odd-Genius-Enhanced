// Test script to verify frontend H2H logo display
// This can be run in the browser console

console.log('🧪 Testing Frontend H2H Logo Display...');

// Check if H2H data is loaded
const checkH2HLogos = () => {
  // Look for H2H table rows
  const h2hRows = document.querySelectorAll('table tbody tr');
  
  if (h2hRows.length === 0) {
    console.log('❌ No H2H table rows found. Make sure you are on the H2H tab.');
    return;
  }
  
  console.log(`📊 Found ${h2hRows.length} H2H table rows`);
  
  let rowsWithLogos = 0;
  let totalLogos = 0;
  
  h2hRows.forEach((row, index) => {
    const images = row.querySelectorAll('img');
    const teamLogos = Array.from(images).filter(img => 
      img.alt && (img.alt.includes('Team') || img.alt.includes('Home') || img.alt.includes('Away'))
    );
    
    if (teamLogos.length >= 2) {
      rowsWithLogos++;
    }
    
    totalLogos += teamLogos.length;
    
    if (index === 0) {
      console.log('🔍 Sample row logos:');
      teamLogos.forEach((logo, logoIndex) => {
        console.log(`  - Logo ${logoIndex + 1}: ${logo.src}`);
        console.log(`    Alt text: ${logo.alt}`);
        console.log(`    Loaded: ${logo.complete && logo.naturalWidth > 0 ? '✅' : '❌'}`);
      });
    }
  });
  
  console.log(`📈 Logo Summary:`);
  console.log(`  - Rows with logos: ${rowsWithLogos}/${h2hRows.length}`);
  console.log(`  - Total logos found: ${totalLogos}`);
  
  if (rowsWithLogos === h2hRows.length && totalLogos >= h2hRows.length * 2) {
    console.log('✅ SUCCESS: All H2H rows have team logos!');
  } else {
    console.log('⚠️  WARNING: Some H2H rows are missing team logos');
  }
};

// Check immediately
checkH2HLogos();

// Also check after a delay to allow for loading
setTimeout(() => {
  console.log('\n🔄 Checking again after 3 seconds...');
  checkH2HLogos();
}, 3000);
