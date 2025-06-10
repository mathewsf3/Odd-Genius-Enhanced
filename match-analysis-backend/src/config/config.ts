import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    port: number;
    host: string;
    env: string;
  };
  api: {
    footystats: {
      key: string;
      baseUrl: string;
      rateLimit: {
        requestsPerMinute: number;
        requestsPerDay: number;
      };
    };
  };
  cache: {
    redis: {
      url?: string;
      host: string;
      port: number;
      password?: string;
      db: number;
    };
    memory: {
      maxSize: number;
      ttl: number;
    };
  };
  logging: {
    level: string;
    file: boolean;
    console: boolean;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
  },
  api: {
    footystats: {
      key: process.env.FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756',
      baseUrl: process.env.FOOTYSTATS_BASE_URL || 'https://api.footystats.org/api/v1',
      rateLimit: {
        requestsPerMinute: parseInt(process.env.FOOTYSTATS_RPM || '60', 10),
        requestsPerDay: parseInt(process.env.FOOTYSTATS_RPD || '1000', 10),
      },
    },
  },
  cache: {
    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '100', 10), // MB
      ttl: parseInt(process.env.MEMORY_CACHE_TTL || '3600', 10), // seconds
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_TO_FILE === 'true',
    console: process.env.LOG_TO_CONSOLE !== 'false',
  },
};

export default config;
