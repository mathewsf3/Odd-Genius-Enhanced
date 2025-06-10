/**
 * Simple logging utility
 */

/**
 * Log levels with corresponding console methods
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Simple logger with different log levels
 */
const logger = {
  /**
   * Log an error message
   * @param {string} message The message to log
   * @param {Object} meta Additional metadata
   */
  error(message, meta = {}) {
    this._log(LOG_LEVELS.ERROR, message, meta);
  },
  
  /**
   * Log a warning message
   * @param {string} message The message to log
   * @param {Object} meta Additional metadata
   */
  warn(message, meta = {}) {
    this._log(LOG_LEVELS.WARN, message, meta);
  },
  
  /**
   * Log an info message
   * @param {string} message The message to log
   * @param {Object} meta Additional metadata
   */
  info(message, meta = {}) {
    this._log(LOG_LEVELS.INFO, message, meta);
  },
  
  /**
   * Log a debug message (only in non-production environments)
   * @param {string} message The message to log
   * @param {Object} meta Additional metadata
   */
  debug(message, meta = {}) {
    // Only log debug in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      this._log(LOG_LEVELS.DEBUG, message, meta);
    }
  },
  
  /**
   * Internal method to handle logging
   * @private
   */
  _log(level, message, meta) {
    const timestamp = new Date().toISOString();
    
    let output = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Add metadata if it exists
    if (meta && Object.keys(meta).length > 0) {
      try {
        output += ` ${JSON.stringify(meta)}`;
      } catch (e) {
        output += ' [Meta serialization failed]';
      }
    }
    
    // Use appropriate console method based on level
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(output);
        break;
      case LOG_LEVELS.WARN:
        console.warn(output);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(output);
        break;
      case LOG_LEVELS.INFO:
      default:
        console.log(output);
        break;
    }
  }
};

module.exports = logger;