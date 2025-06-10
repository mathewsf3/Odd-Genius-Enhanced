/**
 * Express application setup
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('./config/constants');
const apiRoutes = require('./routes/api');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Enable pre-flight requests for all routes
app.options('*', cors({
  origin: '*', // Allow any origin for development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: '*', // Allow all headers for debugging
  credentials: true,
  optionsSuccessStatus: 204
}));

// CORS setup - Apply before Helmet
app.use(cors({
  origin: '*', // Allow any origin for development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: '*', // Allow all headers for debugging
  credentials: true,
  optionsSuccessStatus: 204
}));

// Security headers
app.use(helmet());

// HTTP request logging with Morgan and custom logger
app.use(morgan('dev'));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Compress responses
app.use(compression());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS || 15 * 60 * 1000, // 15 minutes default
  max: RATE_LIMIT.MAX_REQUESTS || 100, // 100 requests default
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later',
  },
});

// Apply rate limiter to all routes
app.use(limiter);

// API Routes - all routes are handled through the main API router
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use(errorMiddleware);

// 404 handler - must be after all other routes
app.use((req, res) => {
  logger.warn(`404 - Resource not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 404,
    message: 'Resource not found'
  });
});

module.exports = app;
