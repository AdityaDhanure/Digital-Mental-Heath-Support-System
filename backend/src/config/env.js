/**
 * Backend Environment Configuration
 * Centralized configuration for all environment variables
 * All settings are read from process.env with proper defaults
 */

// ============================================================
// SERVER CONFIGURATION
// ============================================================
export const SERVER_CONFIG = {
  // Server port
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Environment (development, production, test)
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Is production
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// ============================================================
// DATABASE CONFIGURATION
// ============================================================
export const DATABASE_CONFIG = {
  // MongoDB connection string
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-db',
};

// ============================================================
// JWT & AUTHENTICATION
// ============================================================
export const AUTH_CONFIG = {
  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  
  // JWT Expiration
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Refresh token secret
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  
  // Refresh token expiration
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};

// ============================================================
// ENCRYPTION & SECURITY
// ============================================================
export const SECURITY_CONFIG = {
  // Encryption key
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  
  // HMAC secret
  HMAC_SECRET: process.env.HMAC_SECRET || 'your-hmac-secret-key',
  
  // User token secret (for special operations)
  USER_TOKEN_SECRET: process.env.USER_TOKEN_SECRET || 'default-user-token-secret-change-in-production',
};

// ============================================================
// EMAIL CONFIGURATION
// ============================================================
export const EMAIL_CONFIG = {
  // SMTP Host
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  
  // SMTP Port
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  
  // SMTP Username
  SMTP_USER: process.env.SMTP_USER,
  
  // SMTP Password (App password for Gmail)
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Is email configured
  IS_EMAIL_CONFIGURED: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
};

// ============================================================
// CLOUDINARY CONFIGURATION (Media Storage)
// ============================================================
export const CLOUDINARY_CONFIG = {
  // Cloudinary cloud name
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  
  // Cloudinary API key
  API_KEY: process.env.CLOUDINARY_API_KEY,
  
  // Cloudinary API secret
  API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Is configured
  IS_CONFIGURED: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
};

// ============================================================
// RATE LIMITING CONFIGURATION
// ============================================================
export const RATE_LIMIT_CONFIG = {
  // Rate limit window in milliseconds (default: 15 minutes)
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  
  // Max requests per window (default: 100)
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// ============================================================
// CORS & FRONTEND CONFIGURATION
// ============================================================
export const CORS_CONFIG = {
  // Frontend URL(s) for CORS (can be comma-separated)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Additional allowed origins (can be comma-separated)
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  
  // Get parsed origins list
  getOriginsList: () => {
    const origins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
    ];
    
    if (process.env.FRONTEND_URL) {
      origins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
    }
    
    if (process.env.ALLOWED_ORIGINS) {
      origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim()));
    }
    
    return [...new Set(origins)]; // Remove duplicates
  },
};

// ============================================================
// EXTERNAL SERVICES CONFIGURATION
// ============================================================
export const SERVICES_CONFIG = {
  // AI Service URL (Python FastAPI)
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  
  // Analytics Service URL
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8002',
  
  // Redis URL (Optional, for distributed rate limiting)
  REDIS_URL: process.env.REDIS_URL,
};

// ============================================================
// LOGGING CONFIGURATION
// ============================================================
export const LOGGING_CONFIG = {
  // Log level (error, warn, info, debug)
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Is development (for verbose logging)
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
};

// ============================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================
export const config = {
  server: SERVER_CONFIG,
  database: DATABASE_CONFIG,
  auth: AUTH_CONFIG,
  security: SECURITY_CONFIG,
  email: EMAIL_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  cors: CORS_CONFIG,
  services: SERVICES_CONFIG,
  logging: LOGGING_CONFIG,
};

export default config;
