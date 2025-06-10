import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import responseTime from 'response-time';
import config from './config/config';
import logger from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import matchRoutes from './routes/matchRoutes';

// Create Express application
const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1000,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  strict: true,
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Response time middleware
app.use(responseTime((req: Request, res: Response, time: number) => {
  res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
  logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${time.toFixed(2)}ms`, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: time,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
}));

// Logging middleware
if (config.server.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }));
}

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Match Analysis Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.env,
    uptime: process.uptime(),
  });
});

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Match Analysis API',
    version: '1.0.0',
    documentation: {
      endpoints: {
        'POST /api/matches/analyze': 'Get comprehensive match analysis',
        'GET /api/matches/team/:teamId/form': 'Get team form analysis',
        'GET /api/matches/head-to-head': 'Get head-to-head analysis',
        'POST /api/matches/predictions': 'Get match predictions',
        'GET /api/matches/overview': 'Get quick match overview',
        'GET /api/matches/health': 'Health check',
      },
      rateLimit: {
        general: '200 requests per 15 minutes',
        analysis: '100 requests per 15 minutes',
      },
      footystatsIntegration: {
        apiKey: 'Configured and ready',
        caching: 'Redis/Memory cache enabled',
        rateLimiting: 'Built-in protection',
      },
    },
  });
});

// API Routes
app.use('/api/matches', matchRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
