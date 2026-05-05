// src/utils/encryption.js - COMPLETELY FIXED

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

// FIXED: Consistent user token generation
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET || 'default-user-token-secret-change-in-production';

/**
 * Create anonymized user token (for chat privacy)
 * CRITICAL: This MUST create the SAME token for the SAME user every time
 * @param {string} userId - User ID (can be string or ObjectId)
 * @returns {string} - Consistent anonymized token for this user
 */
const createAnonymizedToken = (userId) => {
  if (!userId) {
    throw new Error('userId is required for token generation');
  }
  
  // Convert to string if it's an ObjectId
  const userIdString = userId.toString();
  
  // Create HMAC with consistent secret - same user = same token
  const token = crypto
    .createHmac('sha256', USER_TOKEN_SECRET)
    .update(userIdString)
    .digest('hex');
  
  return token;
};

/**
 * Encrypt sensitive text data
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in hex format
 */
const encrypt = (text) => {
  try {
    if (!text) return null;
    
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return result.toString('hex');
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted text data
 * @param {string} encryptedHex - Encrypted text in hex format
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedHex) => {
  try {
    if (!encryptedHex) return null;
    
    const data = Buffer.from(encryptedHex, 'hex');
    
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, TAG_POSITION);
    const tag = data.slice(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.slice(ENCRYPTED_POSITION);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
const hash = (data) => {
  try {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} - HMAC signature
 */
const createHMAC = (data, secret) => {
  try {
    return crypto
      .createHmac('sha256', secret || process.env.HMAC_SECRET)
      .update(data)
      .digest('hex');
  } catch (error) {
    console.error('HMAC creation error:', error);
    throw new Error('Failed to create HMAC');
  }
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} - True if signature is valid
 */
const verifyHMAC = (data, signature, secret) => {
  try {
    const expectedSignature = createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
};

/**
 * Generate cryptographically secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Random token in hex
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate random password
 * @param {number} length - Password length
 * @returns {string} - Random password
 */
const generatePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
};

/**
 * Encrypt object (converts to JSON first)
 * @param {object} obj - Object to encrypt
 * @returns {string} - Encrypted object
 */
const encryptObject = (obj) => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Object encryption error:', error);
    throw new Error('Failed to encrypt object');
  }
};

/**
 * Decrypt object (parses JSON after decryption)
 * @param {string} encryptedHex - Encrypted object
 * @returns {object} - Decrypted object
 */
const decryptObject = (encryptedHex) => {
  try {
    const jsonString = decrypt(encryptedHex);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Object decryption error:', error);
    throw new Error('Failed to decrypt object');
  }
};

/**
 * Mask sensitive data for logging
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} - Masked data
 */
const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars * 2) {
    return '****';
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - (visibleChars * 2));
  
  return `${start}${masked}${end}`;
};

export {
  encrypt,
  decrypt,
  hash,
  createHMAC,
  verifyHMAC,
  generateToken,
  generatePassword,
  encryptObject,
  decryptObject,
  createAnonymizedToken,
  maskSensitiveData
};