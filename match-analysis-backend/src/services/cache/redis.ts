import Redis from 'redis';
import NodeCache from 'node-cache';
import config from '../../config/config';
import logger from '../../utils/logger';

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
}

class RedisCacheService implements CacheService {
  private client: Redis.RedisClientType;
  private connected: boolean = false;

  constructor() {
    const redisConfig = config.cache.redis;
    
    if (redisConfig.url) {
      this.client = Redis.createClient({ url: redisConfig.url });
    } else {
      this.client = Redis.createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
        },
        password: redisConfig.password,
        database: redisConfig.db,
      });
    }

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.connected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis Client Disconnected');
      this.connected = false;
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Redis CLEAR error:', error);
      return false;
    }
  }
}

class MemoryCacheService implements CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.memory.ttl,
      checkperiod: 120,
      maxKeys: 1000,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.cache.get<T>(key);
      return value || null;
    } catch (error) {
      logger.error(`Memory cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      return this.cache.set(key, value, ttl || config.cache.memory.ttl);
    } catch (error) {
      logger.error(`Memory cache SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      return this.cache.del(key) > 0;
    } catch (error) {
      logger.error(`Memory cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error(`Memory cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      this.cache.flushAll();
      return true;
    } catch (error) {
      logger.error('Memory cache CLEAR error:', error);
      return false;
    }
  }
}

// Create singleton instance
let cacheInstance: CacheService;

export const createCacheService = (): CacheService => {
  if (!cacheInstance) {
    // Try Redis first, fallback to memory cache
    try {
      cacheInstance = new RedisCacheService();
      logger.info('Using Redis cache service');
    } catch (error) {
      logger.warn('Redis not available, using memory cache service');
      cacheInstance = new MemoryCacheService();
    }
  }
  return cacheInstance;
};

export default createCacheService();
