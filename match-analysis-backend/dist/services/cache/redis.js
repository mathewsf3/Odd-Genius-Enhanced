"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCacheService = void 0;
const redis_1 = __importDefault(require("redis"));
const node_cache_1 = __importDefault(require("node-cache"));
const config_1 = __importDefault(require("../../config/config"));
const logger_1 = __importDefault(require("../../utils/logger"));
class RedisCacheService {
    constructor() {
        this.connected = false;
        const redisConfig = config_1.default.cache.redis;
        if (redisConfig.url) {
            this.client = redis_1.default.createClient({ url: redisConfig.url });
        }
        else {
            this.client = redis_1.default.createClient({
                socket: {
                    host: redisConfig.host,
                    port: redisConfig.port,
                },
                password: redisConfig.password,
                database: redisConfig.db,
            });
        }
        this.client.on('error', (err) => {
            logger_1.default.error('Redis Client Error:', err);
            this.connected = false;
        });
        this.client.on('connect', () => {
            logger_1.default.info('Redis Client Connected');
            this.connected = true;
        });
        this.client.on('disconnect', () => {
            logger_1.default.warn('Redis Client Disconnected');
            this.connected = false;
        });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            logger_1.default.error('Failed to connect to Redis:', error);
            this.connected = false;
        }
    }
    async get(key) {
        if (!this.connected)
            return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            logger_1.default.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.connected)
            return false;
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await this.client.setEx(key, ttl, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            return true;
        }
        catch (error) {
            logger_1.default.error(`Redis SET error for key ${key}:`, error);
            return false;
        }
    }
    async del(key) {
        if (!this.connected)
            return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            logger_1.default.error(`Redis DEL error for key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        if (!this.connected)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.default.error(`Redis EXISTS error for key ${key}:`, error);
            return false;
        }
    }
    async clear() {
        if (!this.connected)
            return false;
        try {
            await this.client.flushDb();
            return true;
        }
        catch (error) {
            logger_1.default.error('Redis CLEAR error:', error);
            return false;
        }
    }
}
class MemoryCacheService {
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: config_1.default.cache.memory.ttl,
            checkperiod: 120,
            maxKeys: 1000,
        });
    }
    async get(key) {
        try {
            const value = this.cache.get(key);
            return value || null;
        }
        catch (error) {
            logger_1.default.error(`Memory cache GET error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            return this.cache.set(key, value, ttl || config_1.default.cache.memory.ttl);
        }
        catch (error) {
            logger_1.default.error(`Memory cache SET error for key ${key}:`, error);
            return false;
        }
    }
    async del(key) {
        try {
            return this.cache.del(key) > 0;
        }
        catch (error) {
            logger_1.default.error(`Memory cache DEL error for key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        try {
            return this.cache.has(key);
        }
        catch (error) {
            logger_1.default.error(`Memory cache EXISTS error for key ${key}:`, error);
            return false;
        }
    }
    async clear() {
        try {
            this.cache.flushAll();
            return true;
        }
        catch (error) {
            logger_1.default.error('Memory cache CLEAR error:', error);
            return false;
        }
    }
}
let cacheInstance;
const createCacheService = () => {
    if (!cacheInstance) {
        try {
            cacheInstance = new RedisCacheService();
            logger_1.default.info('Using Redis cache service');
        }
        catch (error) {
            logger_1.default.warn('Redis not available, using memory cache service');
            cacheInstance = new MemoryCacheService();
        }
    }
    return cacheInstance;
};
exports.createCacheService = createCacheService;
exports.default = (0, exports.createCacheService)();
//# sourceMappingURL=redis.js.map