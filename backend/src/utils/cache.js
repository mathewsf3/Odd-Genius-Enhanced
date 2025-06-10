/**
 * Simple in-memory cache implementation
 */

// Main cache store
const cacheStore = new Map();

// TTL information
const cacheTTL = new Map();
const cacheTimestamps = new Map();

/**
 * Simple in-memory cache
 */
const cache = {
  /**
   * Get a value from cache
   * @param {string} key Cache key
   * @returns {any} Cached value or null if not found or expired
   */
  get(key) {
    // If key doesn't exist, return null
    if (!cacheStore.has(key)) {
      return null;
    }
    
    // Check if TTL is set and if it has expired
    if (cacheTTL.has(key)) {
      const timestamp = cacheTimestamps.get(key);
      const ttl = cacheTTL.get(key);
      const now = Date.now();
      
      if (now - timestamp > ttl) {
        // TTL expired, clear this item
        this.del(key);
        return null;
      }
    }
    
    return cacheStore.get(key);
  },
  
  /**
   * Set a value in cache
   * @param {string} key Cache key
   * @param {any} value Value to store
   * @param {number} ttl Time-to-live in milliseconds (optional)
   */
  set(key, value, ttl = null) {
    cacheStore.set(key, value);
    
    // If TTL provided, store expiration info
    if (ttl !== null && ttl > 0) {
      cacheTTL.set(key, ttl);
      cacheTimestamps.set(key, Date.now());
    }
  },
  
  /**
   * Delete a value from cache
   * @param {string} key Cache key
   */
  del(key) {
    cacheStore.delete(key);
    cacheTTL.delete(key);
    cacheTimestamps.delete(key);
  },
  
  /**
   * Clear all cache entries
   */
  clear() {
    cacheStore.clear();
    cacheTTL.clear();
    cacheTimestamps.clear();
  },
    /**
   * Get all cache keys
   * @returns {Array<string>} Array of cache keys
   */
  keys() {
    return Array.from(cacheStore.keys());
  },
  
  /**
   * Get all cache entries as an object
   * @returns {Object} Object with all cache keys and values
   */
  getAll() {
    const result = {};
    cacheStore.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
};

module.exports = cache;