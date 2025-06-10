"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./utils/logger"));
const redis_1 = __importDefault(require("./services/cache/redis"));
const startServer = async () => {
    try {
        logger_1.default.info('Initializing cache service...');
        try {
            await redis_1.default.set('startup_test', 'ok', 10);
            const testValue = await redis_1.default.get('startup_test');
            if (testValue === 'ok') {
                logger_1.default.info('Cache service initialized successfully');
                await redis_1.default.del('startup_test');
            }
            else {
                logger_1.default.warn('Cache service test failed, but continuing...');
            }
        }
        catch (cacheError) {
            logger_1.default.warn('Cache service initialization failed, using fallback:', cacheError);
        }
        const server = app_1.default.listen(config_1.default.server.port, config_1.default.server.host, () => {
            logger_1.default.info(`🚀 Match Analysis Backend Server started successfully!`);
            logger_1.default.info(`📍 Server running at: http://${config_1.default.server.host}:${config_1.default.server.port}`);
            logger_1.default.info(`🌍 Environment: ${config_1.default.server.env}`);
            logger_1.default.info(`📊 FootyStats API: Ready`);
            logger_1.default.info(`💾 Cache: ${process.env.REDIS_URL ? 'Redis' : 'Memory'}`);
            logger_1.default.info(`📝 Logging: Level ${config_1.default.logging.level}`);
            logger_1.default.info('📚 Available endpoints:');
            logger_1.default.info('   GET  /health - Health check');
            logger_1.default.info('   GET  /api - API documentation');
            logger_1.default.info('   POST /api/matches/analyze - Comprehensive match analysis');
            logger_1.default.info('   GET  /api/matches/team/:id/form - Team form analysis');
            logger_1.default.info('   GET  /api/matches/head-to-head - Head-to-head analysis');
            logger_1.default.info('   POST /api/matches/predictions - Match predictions');
            logger_1.default.info('   GET  /api/matches/overview - Quick match overview');
        });
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = typeof config_1.default.server.port === 'string'
                ? 'Pipe ' + config_1.default.server.port
                : 'Port ' + config_1.default.server.port;
            switch (error.code) {
                case 'EACCES':
                    logger_1.default.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.default.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        const gracefulShutdown = (signal) => {
            logger_1.default.info(`Received ${signal}, starting graceful shutdown...`);
            server.close(async (err) => {
                if (err) {
                    logger_1.default.error('Error during server shutdown:', err);
                    process.exit(1);
                }
                logger_1.default.info('HTTP server closed');
                try {
                    await redis_1.default.clear();
                    logger_1.default.info('Cache connections closed');
                }
                catch (cacheError) {
                    logger_1.default.warn('Error closing cache connections:', cacheError);
                }
                logger_1.default.info('Graceful shutdown completed');
                process.exit(0);
            });
            setTimeout(() => {
                logger_1.default.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Promise Rejection:', { reason, promise: promise.toString() });
    process.exit(1);
});
if (require.main === module) {
    startServer().catch((error) => {
        logger_1.default.error('Failed to start application:', error);
        process.exit(1);
    });
}
exports.default = app_1.default;
//# sourceMappingURL=server.js.map