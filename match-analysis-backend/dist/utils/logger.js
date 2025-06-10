"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const config_1 = __importDefault(require("../config/config"));
class Logger {
    constructor() {
        const transports = [];
        if (config_1.default.logging.console) {
            transports.push(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
                    let metaStr = '';
                    if (Object.keys(meta).length > 0) {
                        metaStr = ' ' + JSON.stringify(meta);
                    }
                    return `${timestamp} [${level}]: ${message}${metaStr}`;
                })),
            }));
        }
        if (config_1.default.logging.file) {
            transports.push(new winston_daily_rotate_file_1.default({
                filename: 'logs/match-analysis-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }));
            transports.push(new winston_daily_rotate_file_1.default({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxSize: '20m',
                maxFiles: '30d',
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            }));
        }
        this.logger = winston_1.default.createLogger({
            level: config_1.default.logging.level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'match-analysis-backend' },
            transports,
        });
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    error(message, error) {
        if (error instanceof Error) {
            this.logger.error(message, { error: error.message, stack: error.stack });
        }
        else {
            this.logger.error(message, { error });
        }
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    http(message, meta) {
        this.logger.http(message, meta);
    }
}
exports.default = new Logger();
//# sourceMappingURL=logger.js.map