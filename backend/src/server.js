// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const responseTime = require('response-time');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');
const { optimizedValidationMiddleware, monitorDataQuality, getValidationStatus } = require('./middleware/dataValidationMiddleware');
// const { router: aiTeamRoutes, setAITeamHandler } = require('./routes/ai-team');

// Create Express app
const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Compression middleware
app.use(compression());

// Response time middleware
app.use(responseTime((req, res, time) => {
  // Only log slow responses
  if (time > 1000) {
    logger.warn(`Slow response: ${time.toFixed(2)}ms for ${req.method} ${req.url}`, {
      responseTime: time,
      statusCode: res.statusCode
    });
  }
}));

// CORS Configuration - Dynamic based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://odd-genius.vercel.app',
        'https://odd-genius-frontend.vercel.app',
        'https://odd-genius.netlify.app',
        'https://odd-genius-frontend.netlify.app'
      ]
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'cache-control', 'X-Requested-With'], // Added cache-control and X-Requested-With
  exposedHeaders: ['X-Response-Time'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Ensure this is before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application-level cache control
app.use((req, res, next) => {
  // Set Cache-Control headers for static content
  if (req.path.startsWith('/assets/')) {
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
  }

  // Add timestamp to response headers
  res.set('X-Server-Time', new Date().toISOString());
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // Only log API requests
  if (req.path.startsWith('/api')) {
    logger.info(`${req.method} ${req.url}`, {
      service: 'odd-genius-api',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  next();
});

// Data validation middleware - Apply to all API routes
app.use('/api', optimizedValidationMiddleware);
app.use('/api', monitorDataQuality);

// Validation status endpoint
app.get('/api/validation/status', getValidationStatus);

// API Routes
app.use('/api', apiRoutes);

// Enhanced Leagues Routes (created by AI team)
const leaguesRoutes = require('./routes/leagues');
app.use('/api', leaguesRoutes);

// AI team routes removed

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Odd Genius API',
    version: '1.0.0',
    documentation: 'Access API endpoints at /api/*',
    endpoints: [
      { path: '/api/matches/live', description: 'Get live matches' },
      { path: '/api/matches/upcoming', description: 'Get upcoming matches' },
      { path: '/api/stats', description: 'Get betting performance stats' },
      { path: '/api/health', description: 'Health check endpoint' }
    ],
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`, { service: 'odd-genius-api' });
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(`Error: ${err.message}`, {
    service: 'odd-genius-api',
    error: err.stack,
    path: req.path,
    statusCode
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with WebSocket support
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const { Server: SocketServer } = require('socket.io');

// Set up Socket.IO with CORS
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  }
});

// Set up WebSocket
const setupWebSocket = require('./config/websocket');
setupWebSocket(server);

// AI Team WebSocket removed

// Initialize universal sync system
async function initializeApp() {  try {
    logger.info('Initializing FootyStats API system...', { service: 'odd-genius-api' });

    // Initialize mapping system
    const MappingNew = require('./services/MappingNew');
    await MappingNew.initialize();
    logger.info('FootyStats API system initialized', { service: 'odd-genius-api' });

    // Note: Legacy sync jobs removed - FootyStats API provides real-time data
    logger.info('FootyStats provides real-time data - no sync jobs needed', { service: 'odd-genius-api' });

  } catch (error) {
    logger.error('Failed to initialize FootyStats API system:', {
      service: 'odd-genius-api',
      error: error.message,
      stack: error.stack
    });
    // Don't exit - allow server to start without unified system
    logger.warn('Server starting without FootyStats initialization', { service: 'odd-genius-api' });
  }
}

// Start server
server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`, { service: 'odd-genius-api' });
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`, {
    service: 'odd-genius-api',
    apiKeyConfigured: process.env.ALL_SPORTS_API_KEY ? 'Yes' : 'No'
  });
  logger.info('WebSocket server is ready for connections');
  logger.info('AI Team system initialized with 5 agents');

  // Initialize the universal mapping system after server starts
  await initializeApp();
});

// Configure server timeouts
server.timeout = 60000; // 60 seconds
server.keepAliveTimeout = 30000; // 30 seconds

// Handle uncaught exceptions and rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, { service: 'odd-genius-api' });
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, {
    service: 'odd-genius-api',
    error: error.stack
  });

  // Exit process in case of critical errors
  if (error.name === 'NetworkError' || error.code === 'ECONNREFUSED') {
    process.exit(1);
  }
});

module.exports = app;