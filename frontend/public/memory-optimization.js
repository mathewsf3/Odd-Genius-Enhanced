// Memory Optimization Script for React Development Server
// This script runs in the browser console to optimize memory usage

/**
 * Clear browser memory at regular intervals
 */
function startMemoryOptimization() {
  console.log('🧹 Starting memory optimization for Odd Genius...');
  
  // Clear React DevTools cache
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('Disabling React DevTools to save memory');
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
  }

  // Clean up memory at regular intervals
  setInterval(() => {
    console.log('🗑️ Cleaning up memory...');
    
    // Force garbage collection when possible
    if (window.gc) {
      window.gc();
    }
    
    // Clear console
    console.clear();
    
    // Report memory usage if available
    if (window.performance && window.performance.memory) {
      const memoryInfo = window.performance.memory;
      console.log(`📊 Memory usage: ${(memoryInfo.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(memoryInfo.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
    }
  }, 60000); // Run every minute
}

// Start memory optimization when this script is executed
startMemoryOptimization();

// Export a function that can be called to manually trigger cleanup
window.cleanMemory = function() {
  console.log('🧹 Manual memory cleanup triggered');
  
  // Clear caches
  if (window.caches) {
    caches.keys().then(names => {
      names.forEach(name => {
        console.log(`Clearing cache: ${name}`);
        caches.delete(name);
      });
    });
  }
  
  // Force garbage collection when possible
  if (window.gc) {
    window.gc();
  }
  
  // Clear local data that might be cached
  localStorage.removeItem('react-query-cache');
  
  console.log('✅ Memory cleanup complete');
};

console.log('✅ Memory optimization script loaded. Call window.cleanMemory() to manually clean up memory.');
