/**
 * Utility for rate limiting API requests to external services
 */

// Map to track last request times by endpoint
const requestTimestamps = new Map();

/**
 * Throttles requests to respect API rate limits
 * @param {Function} requestFunction The function that makes the actual API request
 * @param {number} minDelay Minimum delay between requests in milliseconds (default: 1000)
 * @returns {Promise<any>} The result of the request function
 */
const throttleRequests = async (requestFunction, minDelay = 1000) => {
  // Use function as key (or use a string key if provided)
  const key = requestFunction.name || requestFunction.toString().slice(0, 50);
  const now = Date.now();
  
  // Check if we need to delay this request
  if (requestTimestamps.has(key)) {
    const lastRequestTime = requestTimestamps.get(key);
    const elapsed = now - lastRequestTime;
    
    // If we haven't waited long enough, delay the request
    if (elapsed < minDelay) {
      const waitTime = minDelay - elapsed;
      console.log(`Rate limiting: Waiting ${waitTime}ms before next request to ${key}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  try {
    // Update timestamp before making the request
    requestTimestamps.set(key, Date.now());
    
    // Execute the request function
    return await requestFunction();
  } catch (error) {
    // If there's an error, make sure we don't block future requests
    // by adding a bit of delay to the timestamp
    requestTimestamps.set(key, Date.now() - (minDelay / 2));
    throw error;
  }
};

module.exports = {
  throttleRequests
};