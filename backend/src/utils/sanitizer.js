// Location: backend/src/utils/sanitizer.js

import { stripLow, escape, isEmail, normalizeEmail, isURL, isISO8601 } from 'validator';
import xss from 'xss';

/**
 * Sanitizer Utility for Mental Health System
 * Protects against XSS, SQL injection, NoSQL injection, and malicious input
 * Ensures data integrity for mental health conversations and user inputs
 */

class Sanitizer {
  constructor() {
    // XSS filter configuration
    this.xssOptions = {
      whiteList: {
        // Allow minimal HTML for rich text (if needed)
        b: [],
        i: [],
        u: [],
        br: [],
        p: [],
        strong: [],
        em: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    };
  }

  /**
   * Sanitize string input - removes XSS threats
   * @param {string} input - Raw input string
   * @param {boolean} allowHtml - Whether to allow safe HTML tags
   * @returns {string} Sanitized string
   */
  sanitizeString(input, allowHtml = false) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove XSS threats
    if (allowHtml) {
      sanitized = xss(sanitized, this.xssOptions);
    } else {
      // Strip all HTML
      sanitized = stripLow(sanitized);
      sanitized = escape(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize email address
   * @param {string} email - Email to sanitize
   * @returns {string|null} Sanitized email or null if invalid
   */
  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const sanitized = email.trim().toLowerCase();

    if (!isEmail(sanitized)) {
      return null;
    }

    return normalizeEmail(sanitized);
  }

  /**
   * Sanitize phone number
   * @param {string} phone - Phone number to sanitize
   * @returns {string} Sanitized phone number (digits only)
   */
  sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }

  /**
   * Sanitize URL
   * @param {string} url - URL to sanitize
   * @returns {string|null} Sanitized URL or null if invalid
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const sanitized = url.trim();

    if (!isURL(sanitized, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      return null;
    }

    return sanitized;
  }

  /**
   * Sanitize chat message (preserve meaning, remove threats)
   * @param {string} message - Chat message
   * @returns {string} Sanitized message
   */
  sanitizeChatMessage(message) {
    if (!message || typeof message !== 'string') {
      return '';
    }

    // Trim and limit length
    let sanitized = message.trim();

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Remove XSS but preserve line breaks and basic formatting
    sanitized = xss(sanitized, {
      whiteList: {
        br: []
      },
      stripIgnoreTag: true
    });

    // Limit message length (prevent abuse)
    const maxLength = 5000;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize user name
   * @param {string} name - User name
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    if (!name || typeof name !== 'string') {
      return '';
    }

    // Trim and remove special characters
    let sanitized = name.trim();
    
    // Allow letters, spaces, hyphens, apostrophes
    sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Limit length
    const maxLength = 100;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize MongoDB query to prevent NoSQL injection
   * @param {Object} query - MongoDB query object
   * @returns {Object} Sanitized query
   */
  sanitizeMongoQuery(query) {
    if (!query || typeof query !== 'object') {
      return {};
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(query)) {
      // Remove keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) {
        continue;
      }

      // Recursively sanitize nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMongoQuery(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize search query
   * @param {string} query - Search query string
   * @returns {string} Sanitized search query
   */
  sanitizeSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return '';
    }

    let sanitized = query.trim();

    // Remove special regex characters to prevent regex injection
    sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Limit length
    const maxLength = 200;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Validate and sanitize date
   * @param {string|Date} date - Date to validate
   * @returns {Date|null} Valid Date object or null
   */
  sanitizeDate(date) {
    if (!date) {
      return null;
    }

    let dateObj;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      if (!isISO8601(date)) {
        return null;
      }
      dateObj = new Date(date);
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    return dateObj;
  }

  /**
   * Sanitize file name
   * @param {string} filename - File name to sanitize
   * @returns {string} Sanitized file name
   */
  sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'unnamed_file';
    }

    // Remove path separators and special characters
    let sanitized = filename.trim();
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Remove leading dots (hidden files)
    sanitized = sanitized.replace(/^\.+/, '');

    // Limit length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const extension = sanitized.split('.').pop();
      const nameWithoutExt = sanitized.substring(0, maxLength - extension.length - 1);
      sanitized = `${nameWithoutExt}.${extension}`;
    }

    return sanitized || 'unnamed_file';
  }

  /**
   * Validate and sanitize integer
   * @param {any} value - Value to sanitize
   * @param {Object} options - { min, max, default }
   * @returns {number} Sanitized integer
   */
  sanitizeInteger(value, options = {}) {
    const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, default: defaultValue = 0 } = options;

    if (value === null || value === undefined) {
      return defaultValue;
    }

    const num = parseInt(value, 10);

    if (isNaN(num)) {
      return defaultValue;
    }

    if (num < min) return min;
    if (num > max) return max;

    return num;
  }

  /**
   * Sanitize boolean value
   * @param {any} value - Value to convert to boolean
   * @returns {boolean} Boolean value
   */
  sanitizeBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    return false;
  }

  /**
   * Sanitize enum value (ensure it's in allowed list)
   * @param {any} value - Value to check
   * @param {Array} allowedValues - List of allowed values
   * @param {any} defaultValue - Default value if not in list
   * @returns {any} Sanitized enum value
   */
  sanitizeEnum(value, allowedValues, defaultValue = null) {
    if (!Array.isArray(allowedValues)) {
      return defaultValue;
    }

    if (allowedValues.includes(value)) {
      return value;
    }

    return defaultValue;
  }

  /**
   * Sanitize object (recursive)
   * @param {Object} obj - Object to sanitize
   * @param {Object} schema - Schema defining field types
   * @returns {Object} Sanitized object
   */
  sanitizeObject(obj, schema = {}) {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      const fieldType = schema[key] || 'string';

      switch (fieldType) {
        case 'string':
          sanitized[key] = this.sanitizeString(value);
          break;
        case 'email':
          sanitized[key] = this.sanitizeEmail(value);
          break;
        case 'url':
          sanitized[key] = this.sanitizeUrl(value);
          break;
        case 'integer':
          sanitized[key] = this.sanitizeInteger(value);
          break;
        case 'boolean':
          sanitized[key] = this.sanitizeBoolean(value);
          break;
        case 'date':
          sanitized[key] = this.sanitizeDate(value);
          break;
        default:
          sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Remove null/undefined values from object
   * @param {Object} obj - Object to clean
   * @returns {Object} Cleaned object
   */
  removeEmpty(obj) {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const cleaned = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

// Export singleton instance
const sanitizer = new Sanitizer();

export function sanitizeString(input, allowHtml) { return sanitizer.sanitizeString(input, allowHtml); }
export function sanitizeEmail(email) { return sanitizer.sanitizeEmail(email); }
export function sanitizePhone(phone) { return sanitizer.sanitizePhone(phone); }
export function sanitizeUrl(url) { return sanitizer.sanitizeUrl(url); }
export function sanitizeChatMessage(msg) { return sanitizer.sanitizeChatMessage(msg); }
export function sanitizeName(name) { return sanitizer.sanitizeName(name); }
export function sanitizeMongoQuery(query) { return sanitizer.sanitizeMongoQuery(query); }
export function sanitizeSearchQuery(query) { return sanitizer.sanitizeSearchQuery(query); }
export function sanitizeDate(date) { return sanitizer.sanitizeDate(date); }
export function sanitizeFilename(filename) { return sanitizer.sanitizeFilename(filename); }
export function sanitizeInteger(value, opts) { return sanitizer.sanitizeInteger(value, opts); }
export function sanitizeBoolean(value) { return sanitizer.sanitizeBoolean(value); }
export function sanitizeEnum(value, allowed, def) { return sanitizer.sanitizeEnum(value, allowed, def); }
export function sanitizeObject(obj, schema) { return sanitizer.sanitizeObject(obj, schema); }
export function removeEmpty(obj) { return sanitizer.removeEmpty(obj); }