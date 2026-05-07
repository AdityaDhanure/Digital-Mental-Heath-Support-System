/**
 * Environment Configuration
 * All environment variables are centralized here
 * Uses NEXT_PUBLIC_* variables which are safe to expose in the browser
 */

// API Configuration
export const API_CONFIG = {
  // Backend API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // AI Service (Python FastAPI)
  AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  // App name
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'MindSage AI',
  
  // App URL (for redirects, etc.)
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // App title (for metadata)
  TITLE: 'MindSage AI - Smart Psychological Support System for Students',
  
  // App description (for metadata)
  DESCRIPTION: 'A comprehensive digital mental health platform for students',
};

// Feature Flags
export const FEATURES = {
  // Enable chat functionality
  ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true' || true,
  
  // Enable booking functionality
  ENABLE_BOOKING: process.env.NEXT_PUBLIC_ENABLE_BOOKING === 'true' || true,
  
  // Enable community functionality
  ENABLE_COMMUNITY: process.env.NEXT_PUBLIC_ENABLE_COMMUNITY === 'true' || true,
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics ID (optional)
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
};

// Development/Debug
export const DEBUG = process.env.NODE_ENV === 'development';

// Export all configurations
export const config = {
  api: API_CONFIG,
  app: APP_CONFIG,
  features: FEATURES,
  analytics: ANALYTICS_CONFIG,
  debug: DEBUG,
};

export default config;
