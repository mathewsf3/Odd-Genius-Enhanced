/**
 * Cache service using memory-cache
 */
const cache = require('memory-cache');
const { CACHE_DURATION } = require('../config/constants');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      const value = cache.get(key);
      return value || null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in cache with expiration
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = CACHE_DURATION.SHORT) {
    try {
      cache.put(key, value, ttl * 1000); // Convert seconds to milliseconds
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      cache.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete all items from cache
   * @returns {Promise<boolean>} Success status
   */
  async flush() {
    try {
      cache.clear();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();