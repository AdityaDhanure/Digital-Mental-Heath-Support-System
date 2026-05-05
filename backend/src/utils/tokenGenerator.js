// src/utils/tokenGenerator.js - JWT Token Generation and Management

import pkg from 'jsonwebtoken';
import logger  from './logger.js';

const { sign, verify, decode } = pkg;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate JWT access token
 * @param {object} payload - Data to encode in token
 * @returns {string} - JWT token
 */
const generateAccessToken = (payload) => {
  try {
    const token = sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'mental-health-system',
        audience: 'mental-health-users'
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Access token generation error:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token
 * @param {object} payload - Data to encode in token
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = sign(
      {
        id: payload.id,
        type: 'refresh'
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'mental-health-system'
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify JWT token  
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key (optional)
 * @returns {object} - Decoded payload
 */
const verifyToken = (token, secret = JWT_SECRET) => {
  try {
    const decoded = verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('INVALID_TOKEN');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} - Decoded payload
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, REFRESH_TOKEN_SECRET);
};

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 */
const decodeToken = (token) => {
  try {
    return decode(token);
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {object} user - User object
 * @returns {object} - { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {string} - Verification token
 */
const generateEmailVerificationToken = (userId) => {
  try {
    const token = sign(
      {
        id: userId,
        type: 'email-verification'
      },
      JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Email verification token generation error:', error);
    throw new Error('Failed to generate verification token');
  }
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} - Reset token
 */
const generatePasswordResetToken = (userId) => {
  try {
    const token = sign(
      {
        id: userId,
        type: 'password-reset'
      },
      JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Password reset token generation error:', error);
    throw new Error('Failed to generate reset token');
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Create session token for temporary access
 * @param {object} data - Session data
 * @param {string} expiresIn - Expiration time
 * @returns {string} - Session token
 */
const generateSessionToken = (data, expiresIn = '30m') => {
  try {
    const token = sign(
      {
        ...data,
        type: 'session'
      },
      JWT_SECRET,
      {
        expiresIn
      }
    );
    
    return token;
  } catch (error) {
    logger.error('Session token generation error:', error);
    throw new Error('Failed to generate session token');
  }
};

/**
 * Generate API key for service-to-service communication
 * @param {string} serviceId - Service identifier
 * @returns {string} - API key token
 */
const generateApiKey = (serviceId) => {
  try {
    const token = sign(
      {
        serviceId,
        type: 'api-key'
      },
      JWT_SECRET,
      {
        expiresIn: '365d' // 1 year
      }
    );
    
    return token;
  } catch (error) {
    logger.error('API key generation error:', error);
    throw new Error('Failed to generate API key');
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {string} - New access token
 */
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return generateAccessToken({
      id: decoded.id
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  generateTokenPair,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  isTokenExpired,
  getTokenExpiration,
  extractTokenFromHeader,
  generateSessionToken,
  generateApiKey,
  refreshAccessToken
};