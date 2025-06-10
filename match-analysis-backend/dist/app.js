"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const response_time_1 = __importDefault(require("response-time"));
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
}));
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1000,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
}));
app.use(express_1.default.json({
    limit: '10mb',
    strict: true,
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb',
}));
app.use((0, response_time_1.default)((req, res, time) => {
    res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
    logger_1.default.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${time.toFixed(2)}ms`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: time,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
}));
if (config_1.default.server.env !== 'test') {
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => {
                logger_1.default.http(message.trim());
            },
        },
    }));
}
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.headers['x-request-id']);
    next();
});
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Match Analysis Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config_1.default.server.env,
        uptime: process.uptime(),
    });
});
app.get('/api', (req, res) => {
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
app.use('/api/matches', matchRoutes_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Promise Rejection:', { reason, promise });
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map