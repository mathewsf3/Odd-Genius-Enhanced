const cache = require('./src/utils/cache');

function clearCache() {
  try {
    console.log('🔍 Clearing all cache entries...');
    
    // Get all cache keys before clearing
    const keys = cache.keys();
    console.log(`📊 Found ${keys.length} cache entries:`);
    
    keys.forEach(key => {
      console.log(`  - ${key}`);
    });
    
    // Clear all cache
    cache.clear();
    
    console.log('✅ Cache cleared successfully');
    
    // Verify cache is empty
    const remainingKeys = cache.keys();
    console.log(`📊 Remaining cache entries: ${remainingKeys.length}`);
    
  } catch (error) {
    console.error('❌ Cache clear failed:', error.message);
  }
}

// Run the cache clear
clearCache();
console.log('✅ Cache clear script finished');
