import Redis from 'ioredis';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export class RedisCache {
  private client: Redis.Redis;
  
  constructor() {
    this.client = new Redis(config.REDIS_URL);
    
    this.client.on('error', (err) => {
      logger.error('Redis error', err);
    });
  }
  
  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting data from cache for key ${key}`, error);
      return null;
    }
  }
  
  async set(key: string, value: any, expiryInSeconds: number = 3600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', expiryInSeconds);
    } catch (error) {
      logger.error(`Error setting data in cache for key ${key}`, error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Error deleting data from cache for key ${key}`, error);
    }
  }
  
  async flush(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      logger.error('Error flushing cache', error);
    }
  }
}

export const redisCache = new RedisCache();