import Redis from 'ioredis';
import { env } from './env.js';

let redisClient = null;
let isRedisConnected = false;
const inMemoryCache = new Map();

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // stop retrying after 3 attempts
      }
      return Math.min(times * 200, 1000);
    },
    reconnectOnError(err) {
      return false;
    },
    lazyConnect: true,
  });

  redisClient.connect()
    .then(() => {
      isRedisConnected = true;
      console.log('⚡ Redis connected successfully.');
    })
    .catch((err) => {
      isRedisConnected = false;
      console.warn('⚠️  Redis connection failed. Falling back to in-memory cache.', err.message);
    });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
  });
} catch (err) {
  console.warn('⚠️ Redis initialization error, using in-memory cache fallback:', err.message);
}

export const cacheService = {
  async get(key) {
    try {
      if (isRedisConnected && redisClient) {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      }
    } catch (e) {
      // fallback to memory
    }
    const memVal = inMemoryCache.get(key);
    if (!memVal) return null;
    if (memVal.expiresAt && memVal.expiresAt < Date.now()) {
      inMemoryCache.delete(key);
      return null;
    }
    return memVal.data;
  },

  async set(key, value, ttlSeconds = 60) {
    try {
      if (isRedisConnected && redisClient) {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      }
    } catch (e) {
      // fallback to memory
    }
    inMemoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(patternOrKey) {
    try {
      if (isRedisConnected && redisClient) {
        if (patternOrKey.includes('*')) {
          const keys = await redisClient.keys(patternOrKey);
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } else {
          await redisClient.del(patternOrKey);
        }
      }
    } catch (e) {
      // ignore
    }
    
    // Clean memory cache matching key/pattern
    if (patternOrKey.includes('*')) {
      const prefix = patternOrKey.replace('*', '');
      for (const k of inMemoryCache.keys()) {
        if (k.startsWith(prefix)) inMemoryCache.delete(k);
      }
    } else {
      inMemoryCache.delete(patternOrKey);
    }
  },
  
  isAvailable() {
    return isRedisConnected;
  }
};

export default redisClient;
