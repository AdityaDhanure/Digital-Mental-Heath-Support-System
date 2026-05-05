// src/middleware/rateLimitMiddleware.js - API Rate Limiting

import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import logger from '../utils/logger.js';
import { createClient } from 'redis';

// Create Redis client (optional, for distributed systems)
let redisClient = null;

const initializeRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      // Create a temporary client instance
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false
        }
      });

      client.on('error', () => {
        // Suppress connection errors silently
      });

      // Attempt connection with timeout
      const connectionPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);

      logger.info('✅ Redis Rate Limiting Enabled');
      redisClient = client;
      return;

    } catch (error) {
      // Silently fall back to memory store - this is expected in development
      redisClient = null;
    }
  }
};

// Initialize immediately (Top-level await is supported in Node 14+ ESM)
await initializeRedis();

// Helper to get store configuration
const getStore = (prefix) => {
  if (redisClient) {
    return new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: prefix
    });
  }
  return undefined; // Falls back to MemoryStore
};

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for dashboard usage)
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:general:'),
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.'
    });
  }
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.',
    code: 'TOO_MANY_AUTH_ATTEMPTS'
  },
  store: getStore('rl:auth:'),
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts. Please try again after 15 minutes.',
      code: 'TOO_MANY_AUTH_ATTEMPTS'
    });
  }
});

// Rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  skipSuccessfulRequests: false,
  message: {
    status: 'error',
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  store: getStore('rl:reset:')
});

// Rate limiter for chat/AI interactions
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    status: 'error',
    message: 'You are sending messages too quickly. Please slow down.',
    code: 'CHAT_RATE_LIMIT'
  },
  store: getStore('rl:chat:'),
  keyGenerator: (req) => {
    // Rate limit per user, not per IP
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Rate limiter for booking operations
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 booking operations per hour (increased for dashboard GET requests)
  message: {
    status: 'error',
    message: 'Too many booking requests. Please try again later.'
  },
  store: getStore('rl:booking:'),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  // Skip GET requests from rate limiting (viewing bookings)
  skip: (req) => req.method === 'GET'
});

// Rate limiter for resource uploads (admin/counselor)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    status: 'error',
    message: 'Upload limit reached. Please try again later.'
  },
  store: getStore('rl:upload:')
});

// Rate limiter for community posts
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 posts per hour
  message: {
    status: 'error',
    message: 'You have reached the post limit. Please try again later.'
  },
  store: getStore('rl:post:'),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Dynamic rate limiter based on user role
const dynamicRoleBasedLimiter = (limits) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
      if (!req.user) return limits.anonymous || 20;

      switch (req.user.role) {
        case 'student':
          return limits.student || 100;
        case 'counselor':
          return limits.counselor || 200;
        case 'admin':
          return limits.admin || 500;
        default:
          return limits.default || 50;
      }
    },
    keyGenerator: (req) => {
      return req.user ? req.user._id.toString() : req.ip;
    },
    store: getStore('rl:dynamic:')
  });
};

// Custom rate limiter with burst allowance
const burstLimiter = (normalMax, burstMax, windowMs = 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, {
        count: 1,
        firstRequest: now,
        resetTime: now + windowMs
      });
      return next();
    }

    const record = requests.get(key);

    // Reset if window expired
    if (now > record.resetTime) {
      requests.set(key, {
        count: 1,
        firstRequest: now,
        resetTime: now + windowMs
      });
      return next();
    }

    // Check burst limit (first 10 seconds)
    const timeSinceFirst = now - record.firstRequest;
    if (timeSinceFirst < 10000 && record.count >= burstMax) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests in a short time. Please slow down.'
      });
    }

    // Check normal limit
    if (record.count >= normalMax) {
      return res.status(429).json({
        status: 'error',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
};

// Cleanup interval (for custom limiters only, express-rate-limit handles its own cleanup)
setInterval(() => {
  logger.info('Rate limit cleanup check completed');
}, 5 * 60 * 1000); // Every 5 minutes

export {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  chatLimiter,
  bookingLimiter,
  uploadLimiter,
  postLimiter,
  dynamicRoleBasedLimiter,
  burstLimiter
};

// FIX: Default export must be the general middleware used in app.js
export default generalLimiter;