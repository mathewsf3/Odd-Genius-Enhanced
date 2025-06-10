// Browser console test script
// Copy and paste this into the browser console on http://localhost:3000/match/1569357
// Make sure you're on the H2H tab

console.log('🔍 Testing H2H Logo Display in Browser...');

// Function to wait for elements to load
const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

// Function to check H2H data in React DevTools
const checkReactData = () => {
  console.log('\n📊 Checking React Component Data...');
  
  // Try to find the H2H component
  const h2hElements = document.querySelectorAll('[data-testid*="h2h"], .chakra-tabs__tabpanel');
  
  h2hElements.forEach((element, index) => {
    console.log(`Checking element ${index + 1}:`, element);
    
    // Look for React fiber
    const keys = Object.keys(element);
    const reactKey = keys.find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'));
    
    if (reactKey) {
      console.log('Found React fiber key:', reactKey);
      const fiber = element[reactKey];
      
      // Try to find props or state
      let current = fiber;
      let depth = 0;
      while (current && depth < 10) {
        if (current.memoizedProps) {
          console.log('Found memoized props:', current.memoizedProps);
          if (current.memoizedProps.h2hData) {
            console.log('H2H Data in props:', current.memoizedProps.h2hData);
          }
        }
        if (current.memoizedState) {
          console.log('Found memoized state:', current.memoizedState);
        }
        current = current.return;
        depth++;
      }
    }
  });
};

// Function to check network requests
const checkNetworkRequests = () => {
  console.log('\n🌐 Monitoring Network Requests...');
  
  // Override fetch to monitor H2H requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/h2h')) {
      console.log('🔍 H2H API Request:', url);
      
      return originalFetch.apply(this, args).then(response => {
        console.log('📥 H2H API Response Status:', response.status);
        
        // Clone response to read data without consuming it
        return response.clone().json().then(data => {
          console.log('📊 H2H API Response Data:', data);
          
          if (data.success && data.result) {
            const h2hData = data.result;
            console.log('✅ H2H Data Structure:');
            console.log('- First Team:', h2hData.firstTeam?.name, '| Logo:', h2hData.firstTeam?.logo ? '✅' : '❌');
            console.log('- Second Team:', h2hData.secondTeam?.name, '| Logo:', h2hData.secondTeam?.logo ? '✅' : '❌');
            console.log('- Total Matches:', h2hData.matches?.length || 0);
            
            if (h2hData.matches && h2hData.matches.length > 0) {
              const firstMatch = h2hData.matches[0];
              console.log('- First Match Home Logo:', firstMatch.homeTeam?.logo ? '✅' : '❌');
              console.log('- First Match Away Logo:', firstMatch.awayTeam?.logo ? '✅' : '❌');
            }
          }
          
          return response;
        }).catch(() => response); // Return original response if JSON parsing fails
      });
    }
    
    return originalFetch.apply(this, args);
  };
};

// Function to check DOM images
const checkDOMImages = () => {
  console.log('\n🖼️ Checking DOM Images...');
  
  // Look for H2H tables
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables`);
  
  tables.forEach((table, tableIndex) => {
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length > 0) {
      console.log(`\nTable ${tableIndex + 1}: ${rows.length} rows`);
      
      rows.forEach((row, rowIndex) => {
        const images = row.querySelectorAll('img');
        console.log(`  Row ${rowIndex + 1}: ${images.length} images`);
        
        images.forEach((img, imgIndex) => {
          console.log(`    Image ${imgIndex + 1}:`);
          console.log(`      - src: ${img.src}`);
          console.log(`      - alt: ${img.alt}`);
          console.log(`      - width: ${img.width}px`);
          console.log(`      - height: ${img.height}px`);
          console.log(`      - complete: ${img.complete}`);
          console.log(`      - naturalWidth: ${img.naturalWidth}`);
          console.log(`      - naturalHeight: ${img.naturalHeight}`);
          
          if (img.complete && img.naturalWidth > 0) {
            console.log(`      - ✅ Image loaded successfully`);
          } else {
            console.log(`      - ❌ Image failed to load or still loading`);
            
            // Add load event listener for debugging
            img.addEventListener('load', () => {
              console.log(`      - 🔄 Image loaded after check: ${img.src}`);
            });
            
            img.addEventListener('error', (e) => {
              console.log(`      - 🚨 Image load error: ${img.src}`, e);
            });
          }
        });
        
        // Only check first few rows to avoid spam
        if (rowIndex >= 2) {
          console.log(`    ... (showing first 3 rows)`);
          return false;
        }
      });
    }
  });
};

// Function to check for console errors
const checkConsoleErrors = () => {
  console.log('\n🚨 Setting up error monitoring...');
  
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.toLowerCase().includes('h2h') || 
        message.toLowerCase().includes('logo') || 
        message.toLowerCase().includes('image')) {
      console.log('🚨 H2H-related error:', args);
    }
    return originalError.apply(this, args);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.toLowerCase().includes('h2h') || 
        message.toLowerCase().includes('logo') || 
        message.toLowerCase().includes('image')) {
      console.log('⚠️ H2H-related warning:', args);
    }
    return originalWarn.apply(this, args);
  };
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting H2H Logo Tests...');
    
    // Set up monitoring
    checkConsoleErrors();
    checkNetworkRequests();
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check current state
    checkDOMImages();
    checkReactData();
    
    // Set up periodic checks
    setInterval(() => {
      console.log('\n🔄 Periodic check...');
      checkDOMImages();
    }, 10000);
    
    console.log('\n✅ Test setup complete. Switch to H2H tab if not already there.');
    console.log('Monitor the console for network requests and image loading status.');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
};

// Run the tests
runTests();
