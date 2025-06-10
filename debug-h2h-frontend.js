// Debug script to run in browser console
// Navigate to http://localhost:3000/match/1569357 and click H2H tab first

console.log('🔍 Debugging H2H Frontend Logo Display...');

// Function to check H2H data in React state
const checkReactState = () => {
  console.log('\n📊 Checking React Component State...');
  
  // Try to find React fiber node
  const h2hComponent = document.querySelector('[data-testid="h2h-tab"], .chakra-tabs__tabpanel');
  if (h2hComponent) {
    const reactFiber = Object.keys(h2hComponent).find(key => key.startsWith('__reactFiber'));
    if (reactFiber) {
      console.log('Found React component');
      // Try to access component props/state
      const fiber = h2hComponent[reactFiber];
      console.log('React fiber:', fiber);
    }
  }
};

// Function to check network requests
const checkNetworkRequests = () => {
  console.log('\n🌐 Checking Network Requests...');
  
  // Check if fetch was called for H2H data
  const originalFetch = window.fetch;
  let h2hRequestMade = false;
  
  window.fetch = function(...args) {
    if (args[0] && args[0].includes('/h2h')) {
      console.log('H2H API request detected:', args[0]);
      h2hRequestMade = true;
      
      return originalFetch.apply(this, args).then(response => {
        console.log('H2H API response status:', response.status);
        return response.clone().json().then(data => {
          console.log('H2H API response data:', data);
          return response;
        });
      });
    }
    return originalFetch.apply(this, args);
  };
  
  setTimeout(() => {
    if (!h2hRequestMade) {
      console.log('⚠️ No H2H API request detected yet');
    }
  }, 2000);
};

// Function to check DOM elements
const checkDOMElements = () => {
  console.log('\n🔍 Checking DOM Elements...');
  
  // Look for H2H table
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables on page`);
  
  tables.forEach((table, index) => {
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
      console.log(`\nTable ${index + 1}: ${rows.length} rows`);
      
      // Check first row for images
      const firstRow = rows[0];
      const images = firstRow.querySelectorAll('img');
      console.log(`  - Images in first row: ${images.length}`);
      
      images.forEach((img, imgIndex) => {
        console.log(`    Image ${imgIndex + 1}:`);
        console.log(`      - src: ${img.src}`);
        console.log(`      - alt: ${img.alt}`);
        console.log(`      - loaded: ${img.complete && img.naturalWidth > 0}`);
        console.log(`      - naturalWidth: ${img.naturalWidth}`);
        console.log(`      - naturalHeight: ${img.naturalHeight}`);
        
        if (!img.complete || img.naturalWidth === 0) {
          console.log(`      - ❌ Image failed to load`);
        } else {
          console.log(`      - ✅ Image loaded successfully`);
        }
      });
    }
  });
};

// Function to check console errors
const checkConsoleErrors = () => {
  console.log('\n🚨 Monitoring Console Errors...');
  
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    if (args.some(arg => typeof arg === 'string' && (arg.includes('H2H') || arg.includes('logo') || arg.includes('Image')))) {
      console.log('🚨 H2H-related error detected:', args);
    }
    return originalError.apply(this, args);
  };
  
  console.warn = function(...args) {
    if (args.some(arg => typeof arg === 'string' && (arg.includes('H2H') || arg.includes('logo') || arg.includes('Image')))) {
      console.log('⚠️ H2H-related warning detected:', args);
    }
    return originalWarn.apply(this, args);
  };
};

// Function to manually test H2H API
const testH2HAPI = async () => {
  console.log('\n🧪 Testing H2H API directly...');
  
  try {
    const response = await fetch('http://localhost:5000/api/matches/1569357/h2h');
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.success && data.result) {
      console.log('✅ API returned data successfully');
      console.log('First Team:', data.result.firstTeam?.name, '| Logo:', data.result.firstTeam?.logo ? '✅' : '❌');
      console.log('Second Team:', data.result.secondTeam?.name, '| Logo:', data.result.secondTeam?.logo ? '✅' : '❌');
      console.log('Matches:', data.result.matches?.length || 0);
      
      if (data.result.matches && data.result.matches.length > 0) {
        const firstMatch = data.result.matches[0];
        console.log('First match home team logo:', firstMatch.homeTeam?.logo);
        console.log('First match away team logo:', firstMatch.awayTeam?.logo);
      }
    } else {
      console.log('❌ API returned error or no data');
    }
  } catch (error) {
    console.error('❌ API request failed:', error);
  }
};

// Run all checks
checkConsoleErrors();
checkNetworkRequests();
checkDOMElements();
checkReactState();
testH2HAPI();

// Set up periodic checks
setInterval(() => {
  console.log('\n🔄 Periodic check...');
  checkDOMElements();
}, 5000);

console.log('\n✅ Debug script initialized. Switch to H2H tab if not already there.');
