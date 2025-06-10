/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Set default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, { 
      path: req.path,
      method: req.method,
      error: err.stack 
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, { 
      path: req.path,
      method: req.method
    });
  }
  
  // Send response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;