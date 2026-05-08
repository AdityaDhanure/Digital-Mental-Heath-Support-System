import { createClient } from 'redis';
import logger from './logger.js';
import { SERVICES_CONFIG } from '../config/env.js';

const CACHE_PREFIX = 'cache:v1';
const DEFAULT_TTL_SECONDS = parseInt(process.env.DATA_CACHE_TTL_SECONDS || '120', 10);
const memoryCache = new Map();

let redisClient = null;
let redisReady = false;

const initializeRedisCache = async () => {
  if (!SERVICES_CONFIG.REDIS_URL) return;

  try {
    const client = createClient({
      url: SERVICES_CONFIG.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
      }
    });

    client.on('error', (error) => {
      redisReady = false;
      logger.warn(`Redis cache unavailable: ${error.message}`);
    });

    client.on('ready', () => {
      redisReady = true;
      logger.info('✅ Redis Data Cache Enabled');
    });

    await client.connect();
    redisClient = client;
  } catch (error) {
    redisClient = null;
    redisReady = false;
    logger.warn(`Redis data cache disabled: ${error.message}`);
  }
};

await initializeRedisCache();

const buildCacheKey = (namespace, req) => {
  const userPart = req.user
    ? `user:${req.user._id}:role:${req.user.role}`
    : `anon:${req.ip}`;

  return `${CACHE_PREFIX}:${namespace}:${userPart}:${req.method}:${req.originalUrl}`;
};

const getMemoryValue = (key) => {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
};

const setMemoryValue = (key, value, ttlSeconds) => {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
};

const deleteMemoryNamespace = (namespace) => {
  const prefix = `${CACHE_PREFIX}:${namespace}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
};

export const getCacheValue = async (key) => {
  if (redisClient && redisReady) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  return getMemoryValue(key);
};

export const setCacheValue = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  if (redisClient && redisReady) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return;
  }

  setMemoryValue(key, value, ttlSeconds);
};

export const invalidateCacheNamespaces = async (namespaces) => {
  await Promise.all(namespaces.map(async (namespace) => {
    const prefix = `${CACHE_PREFIX}:${namespace}:`;

    if (redisClient && redisReady) {
      const keys = [];
      for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
        keys.push(key);
      }
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return;
    }

    deleteMemoryNamespace(namespace);
  }));
};

export const cacheResponse = (namespace, ttlSeconds = DEFAULT_TTL_SECONDS) => async (req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.headers['cache-control']?.includes('no-cache')) return next();

  const cacheKey = buildCacheKey(namespace, req);

  try {
    const cached = await getCacheValue(cacheKey);
    if (cached) {
      res.set('X-Data-Cache', 'HIT');
      res.set('Cache-Control', `private, max-age=${Math.min(ttlSeconds, 60)}`);
      return res.status(cached.statusCode).json(cached.body);
    }
  } catch (error) {
    logger.warn(`Cache read failed: ${error.message}`);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setCacheValue(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds)
        .catch((error) => logger.warn(`Cache write failed: ${error.message}`));
    }

    res.set('X-Data-Cache', 'MISS');
    res.set('Cache-Control', `private, max-age=${Math.min(ttlSeconds, 60)}`);
    return originalJson(body);
  };

  return next();
};

export const invalidateCache = (namespaces) => (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCacheNamespaces(namespaces)
        .catch((error) => logger.warn(`Cache invalidation failed: ${error.message}`));
    }
  });

  next();
};
