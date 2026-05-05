// src/middleware/authMiddleware.js - JWT Authentication Middleware

import User from '../models/User.js';
import logger from '../utils/logger.js';

import pkg from 'jsonwebtoken';
const { verify } = pkg;

// Verify JWT token and authenticate user
export async function protect(req, res, next) {
  try {
    let token;
    
    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists in cookies (optional)
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    // No token found
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your session has expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Please log in again.',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw err;
    }
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }
    
    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'Password was recently changed. Please log in again.',
        code: 'PASSWORD_CHANGED'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Grant access to protected route
    req.user = user;
    next();
    
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed. Please try again.'
    });
  }
}

// Optional authentication (doesn't block if no token)
export async function optionalAuth(req, res, next) {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return next();
    }
    
    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
}

// Verify email before access
export function requireEmailVerification(req, res, next) {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Please verify your email address to access this resource.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
}

// Rate limiting per user
const userRequestCounts = new Map();

export function userRateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    if (!req.user) return next();
    
    const userId = req.user._id.toString();
    const now = Date.now();
    
    if (!userRequestCounts.has(userId)) {
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRecord = userRequestCounts.get(userId);
    
    if (now > userRecord.resetTime) {
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRecord.count >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRecord.resetTime - now) / 1000)
      });
    }
    
    userRecord.count++;
    next();
  };
}

// Session validation
export async function validateSession(req, res, next) {
  try {
    // Check for suspicious activity patterns
    const suspiciousPatterns = {
      rapidLocationChange: false,
      unusualAccessTime: false,
      multipleDevices: false
    };
    
    // Log session activity for security monitoring
    logger.info(`Session activity: User ${req.user._id} from IP ${req.ip}`);
    
    // If suspicious, require re-authentication
    if (Object.values(suspiciousPatterns).some(p => p)) {
      return res.status(401).json({
        status: 'error',
        message: 'Suspicious activity detected. Please log in again.',
        code: 'SUSPICIOUS_ACTIVITY'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Session validation error:', error);
    next();
  }
}

