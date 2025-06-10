// Frontend debugging script to test actual browser behavior
// This script simulates what happens when a user visits the match page

const puppeteer = require('puppeteer');

async function debugFrontendBehavior() {
  let browser;
  try {
    console.log('🔍 FRONTEND DEBUGGING ANALYSIS');
    console.log('==============================');
    console.log('🎯 Target: http://localhost:3001/match/1570056');
    console.log('');

    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      devtools: true,  // Open dev tools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        console.log(`❌ [BROWSER ERROR] ${text}`);
      } else if (type === 'warn') {
        console.log(`⚠️ [BROWSER WARN] ${text}`);
      } else if (text.includes('[') && (text.includes('Service]') || text.includes('Match]'))) {
        console.log(`📊 [BROWSER LOG] ${text}`);
      }
    });

    // Enable request/response monitoring
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('localhost:5000')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
        console.log(`🔄 [REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('localhost:5000')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
        console.log(`📥 [RESPONSE] ${response.status()} ${response.url()}`);
      }
    });

    // Navigate to the match page
    console.log('🌐 Navigating to match page...');
    await page.goto('http://localhost:3001/match/1570056', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for React to load
    await page.waitForTimeout(3000);

    // Check if the page loaded correctly
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Check for React errors
    const reactErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for React error boundaries
      const errorElements = document.querySelectorAll('[data-testid="error-boundary"], .error-boundary, .react-error');
      errorElements.forEach(el => {
        errors.push(`React Error: ${el.textContent}`);
      });

      // Check for console errors in the page
      return errors;
    });

    if (reactErrors.length > 0) {
      console.log('❌ React errors found:');
      reactErrors.forEach(error => console.log(`   ${error}`));
    }

    // Check if tabs are present
    const tabsInfo = await page.evaluate(() => {
      const tabs = document.querySelectorAll('[role="tab"], .chakra-tabs__tab');
      const tabsData = [];
      
      tabs.forEach((tab, index) => {
        tabsData.push({
          index,
          text: tab.textContent?.trim(),
          disabled: tab.hasAttribute('disabled') || tab.classList.contains('disabled'),
          active: tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true'
        });
      });
      
      return {
        totalTabs: tabs.length,
        tabs: tabsData
      };
    });

    console.log('');
    console.log('📋 TABS ANALYSIS:');
    console.log(`   Total tabs found: ${tabsInfo.totalTabs}`);
    tabsInfo.tabs.forEach(tab => {
      const status = tab.disabled ? '❌ DISABLED' : tab.active ? '✅ ACTIVE' : '⚪ INACTIVE';
      console.log(`   ${status} Tab ${tab.index}: "${tab.text}"`);
    });

    // Check for loading states
    const loadingInfo = await page.evaluate(() => {
      const loaders = document.querySelectorAll('.chakra-spinner, .loading, [data-testid="loader"]');
      const loadingTexts = document.querySelectorAll('*');
      const loadingMessages = [];
      
      loadingTexts.forEach(el => {
        const text = el.textContent?.toLowerCase();
        if (text && (text.includes('loading') || text.includes('fetching'))) {
          loadingMessages.push(el.textContent.trim());
        }
      });
      
      return {
        spinners: loaders.length,
        loadingMessages: [...new Set(loadingMessages)].slice(0, 5) // Unique messages, max 5
      };
    });

    console.log('');
    console.log('⏳ LOADING STATES:');
    console.log(`   Spinners found: ${loadingInfo.spinners}`);
    if (loadingInfo.loadingMessages.length > 0) {
      console.log('   Loading messages:');
      loadingInfo.loadingMessages.forEach(msg => console.log(`     "${msg}"`));
    }

    // Check for data in tabs
    console.log('');
    console.log('📊 TAB CONTENT ANALYSIS:');
    
    // Try to click each tab and check content
    for (let i = 0; i < Math.min(tabsInfo.totalTabs, 6); i++) {
      try {
        const tabSelector = `[role="tab"]:nth-child(${i + 1}), .chakra-tabs__tab:nth-child(${i + 1})`;
        await page.click(tabSelector);
        await page.waitForTimeout(2000); // Wait for content to load
        
        const tabContent = await page.evaluate((index) => {
          const tabPanels = document.querySelectorAll('[role="tabpanel"], .chakra-tabs__tab-panel');
          const activePanel = Array.from(tabPanels).find(panel => 
            !panel.hidden && panel.style.display !== 'none'
          );
          
          if (activePanel) {
            const hasData = activePanel.textContent.length > 100;
            const hasError = activePanel.textContent.toLowerCase().includes('error') || 
                           activePanel.textContent.toLowerCase().includes('failed');
            const hasNoData = activePanel.textContent.toLowerCase().includes('no data') ||
                            activePanel.textContent.toLowerCase().includes('not available');
            
            return {
              hasContent: hasData,
              hasError,
              hasNoData,
              contentLength: activePanel.textContent.length,
              preview: activePanel.textContent.substring(0, 100) + '...'
            };
          }
          
          return { hasContent: false, hasError: false, hasNoData: false, contentLength: 0, preview: 'No content found' };
        }, i);
        
        const tabName = tabsInfo.tabs[i]?.text || `Tab ${i + 1}`;
        const status = tabContent.hasError ? '❌ ERROR' : 
                      tabContent.hasNoData ? '⚠️ NO DATA' :
                      tabContent.hasContent ? '✅ HAS DATA' : '❓ UNKNOWN';
        
        console.log(`   ${status} ${tabName} (${tabContent.contentLength} chars)`);
        if (tabContent.hasError || tabContent.hasNoData) {
          console.log(`     Preview: ${tabContent.preview}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking tab ${i + 1}: ${error.message}`);
      }
    }

    // Summary of network requests
    console.log('');
    console.log('🌐 NETWORK SUMMARY:');
    console.log(`   Total requests to backend: ${requests.length}`);
    console.log(`   Total responses from backend: ${responses.length}`);
    
    const failedRequests = responses.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      console.log(`   ❌ Failed requests: ${failedRequests.length}`);
      failedRequests.forEach(req => {
        console.log(`     ${req.status} ${req.url}`);
      });
    }

    const successfulRequests = responses.filter(r => r.status >= 200 && r.status < 300);
    console.log(`   ✅ Successful requests: ${successfulRequests.length}`);

    // Wait a bit more to see if any delayed requests come in
    console.log('');
    console.log('⏱️ Waiting for delayed requests...');
    await page.waitForTimeout(5000);

    console.log('');
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('====================');
    
    if (requests.length === 0) {
      console.log('❌ CRITICAL: No requests made to backend - frontend not connecting');
    } else if (failedRequests.length > 0) {
      console.log('❌ ISSUE: Some backend requests failing');
    } else if (successfulRequests.length > 0) {
      console.log('✅ Backend connection working - issue likely in frontend rendering');
    }

  } catch (error) {
    console.error('❌ Frontend debugging failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  debugFrontendBehavior();
} catch (error) {
  console.log('❌ Puppeteer not available. Manual debugging required.');
  console.log('');
  console.log('🔧 MANUAL DEBUGGING STEPS:');
  console.log('1. Open http://localhost:3001/match/1570056 in browser');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Check Console tab for JavaScript errors');
  console.log('4. Check Network tab for failed requests');
  console.log('5. Look for requests to http://localhost:5000/api/*');
  console.log('6. Check if tabs are clickable and loading data');
  console.log('');
  console.log('Expected requests:');
  console.log('- GET /api/matches/1570056 (or /api/admin/matches/1570056/unified)');
  console.log('- GET /api/matches/1570056/h2h');
  console.log('- GET /api/matches/1570056/corners?matches=10');
  console.log('- GET /api/matches/1570056/cards?matches=10');
  console.log('- GET /api/matches/1570056/btts?matches=10');
  console.log('- GET /api/matches/1570056/players?matches=10');
}
