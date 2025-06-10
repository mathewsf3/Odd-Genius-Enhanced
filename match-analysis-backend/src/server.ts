import app from './app';
import config from './config/config';
import logger from './utils/logger';
import cacheService from './services/cache/redis';

// Start the server
const startServer = async (): Promise<void> => {
  try {
    // Initialize cache service
    logger.info('Initializing cache service...');
    
    // Test cache connection
    try {
      await cacheService.set('startup_test', 'ok', 10);
      const testValue = await cacheService.get('startup_test');
      if (testValue === 'ok') {
        logger.info('Cache service initialized successfully');
        await cacheService.del('startup_test');
      } else {
        logger.warn('Cache service test failed, but continuing...');
      }
    } catch (cacheError) {
      logger.warn('Cache service initialization failed, using fallback:', cacheError);
    }

    // Start HTTP server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Match Analysis Backend Server started successfully!`);
      logger.info(`📍 Server running at: http://${config.server.host}:${config.server.port}`);
      logger.info(`🌍 Environment: ${config.server.env}`);
      logger.info(`📊 FootyStats API: Ready`);
      logger.info(`💾 Cache: ${process.env.REDIS_URL ? 'Redis' : 'Memory'}`);
      logger.info(`📝 Logging: Level ${config.logging.level}`);
      
      // Log available endpoints
      logger.info('📚 Available endpoints:');
      logger.info('   GET  /health - Health check');
      logger.info('   GET  /api - API documentation');
      logger.info('   POST /api/matches/analyze - Comprehensive match analysis');
      logger.info('   GET  /api/matches/team/:id/form - Team form analysis');
      logger.info('   GET  /api/matches/head-to-head - Head-to-head analysis');
      logger.info('   POST /api/matches/predictions - Match predictions');
      logger.info('   GET  /api/matches/overview - Quick match overview');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.server.port === 'string'
        ? 'Pipe ' + config.server.port
        : 'Port ' + config.server.port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }

        logger.info('HTTP server closed');
        
        // Clean up cache connections
        try {
          await cacheService.clear();
          logger.info('Cache connections closed');
        } catch (cacheError) {
          logger.warn('Error closing cache connections:', cacheError);
        }

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise: promise.toString() });
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}

export default app;
