# Backend Environment Variables Configuration

## All Available Environment Variables

The following environment variables are managed by the `src/config/env.js` file and should be set in the `.env` file (development) or in your deployment platform's environment variables section (production).

### Centralized Configuration File

All environment variables are **centralized** in a single configuration file: [src/config/env.js](src/config/env.js)

This ensures:
- ✅ **Single source of truth** for all configuration
- ✅ **No hardcoded values** scattered in code
- ✅ **Type-safe** access with proper parsing
- ✅ **Easy defaults** for all variables
- ✅ **Consistent** across the entire backend

---

## Server Configuration

```env
PORT=5000                    # Server port
NODE_ENV=development         # Environment (development, production, test)
```

**Used in:**
- `server.js` - Server startup
- `utils/logger.js` - Logging configuration

---

## Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/mental-health-db
# Production example:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mental-health-db
```

**Used in:**
- `config/database.js` - MongoDB connection

---

## JWT & Authentication

```env
JWT_SECRET=your-secret-key-min-32-chars        # JWT signing secret
JWT_EXPIRES_IN=24h                             # Access token expiration
REFRESH_TOKEN_SECRET=your-refresh-secret        # Refresh token secret
REFRESH_TOKEN_EXPIRES_IN=7d                    # Refresh token expiration
```

**Used in:**
- `utils/tokenGenerator.js` - Token generation and verification
- `middleware/authMiddleware.js` - Token verification

---

## Encryption & Security

```env
ENCRYPTION_KEY=your-encryption-key-hex-format  # AES-256 encryption key
HMAC_SECRET=your-hmac-secret                   # HMAC signing secret
USER_TOKEN_SECRET=your-user-token-secret        # Special user operations
```

**Used in:**
- `utils/encryption.js` - Data encryption/decryption
- `models/User.js` - Password hashing
- `services/` - Secure operations

---

## Email Configuration

```env
SMTP_HOST=smtp.gmail.com                       # Email server host
SMTP_PORT=587                                  # Email server port
SMTP_USER=your-email@gmail.com                 # Email account
SMTP_PASS=your-app-password                    # Email account password (App Password for Gmail)
```

**Used in:**
- `services/emailService.js` - Sending verification emails, notifications, etc.

---

## Cloudinary Configuration (Media Storage)

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name          # Cloudinary cloud name
CLOUDINARY_API_KEY=your-api-key                # Cloudinary API key
CLOUDINARY_API_SECRET=your-api-secret          # Cloudinary API secret
```

**Used in:**
- `config/cloudinary.js` - Image/file uploads
- `routes/` - Resource uploads
- `controllers/` - Avatar uploads

---

## Rate Limiting Configuration

```env
RATE_LIMIT_WINDOW_MS=900000                    # Rate limit window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100                    # Max requests per window
```

**Used in:**
- `middleware/rateLimitMiddleware.js` - API rate limiting

---

## CORS & Frontend Configuration

```env
FRONTEND_URL=http://localhost:3000              # Frontend domain
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com  # Additional allowed origins
```

**Used in:**
- `app.js` - CORS middleware configuration
- `services/emailService.js` - Email action links

---

## External Services

```env
AI_SERVICE_URL=http://localhost:8001            # Python AI Service URL
ANALYTICS_SERVICE_URL=http://localhost:8002     # Python Analytics Service URL
REDIS_URL=redis://localhost:6379                # Redis URL (optional, for distributed rate limiting)
```

**Used in:**
- `controllers/adminController.js` - Service health checks
- `middleware/rateLimitMiddleware.js` - Redis-based rate limiting

---

## Logging Configuration

```env
LOG_LEVEL=info                                  # Log level (error, warn, info, debug)
```

**Used in:**
- `utils/logger.js` - Winston logger configuration

---

## Files Using Configuration

### ✅ Centralized Configuration

1. **`src/config/env.js`** - Central configuration file
   - Exports: `SERVER_CONFIG`, `DATABASE_CONFIG`, `AUTH_CONFIG`, `SECURITY_CONFIG`, `EMAIL_CONFIG`, `CLOUDINARY_CONFIG`, `RATE_LIMIT_CONFIG`, `CORS_CONFIG`, `SERVICES_CONFIG`, `LOGGING_CONFIG`

### ✅ Files Using Configuration

1. **`server.js`**
   - Uses: `SERVER_CONFIG.PORT`, `SERVER_CONFIG.NODE_ENV`

2. **`src/app.js`**
   - Uses: `CORS_CONFIG.getOriginsList()`

3. **`src/config/cloudinary.js`**
   - Uses: `CLOUDINARY_CONFIG.CLOUD_NAME`, `CLOUDINARY_CONFIG.API_KEY`, `CLOUDINARY_CONFIG.API_SECRET`

4. **`src/middleware/rateLimitMiddleware.js`**
   - Uses: `RATE_LIMIT_CONFIG.WINDOW_MS`, `RATE_LIMIT_CONFIG.MAX_REQUESTS`, `SERVICES_CONFIG.REDIS_URL`

5. **`src/utils/tokenGenerator.js`**
   - Uses: `AUTH_CONFIG.JWT_SECRET`, `AUTH_CONFIG.JWT_EXPIRES_IN`, `AUTH_CONFIG.REFRESH_TOKEN_SECRET`, `AUTH_CONFIG.REFRESH_TOKEN_EXPIRES_IN`

6. **`src/utils/encryption.js`**
   - Uses: `SECURITY_CONFIG.ENCRYPTION_KEY`, `SECURITY_CONFIG.HMAC_SECRET`, `SECURITY_CONFIG.USER_TOKEN_SECRET`

7. **`src/services/emailService.js`**
   - Uses: `EMAIL_CONFIG.*`, `CORS_CONFIG.FRONTEND_URL`

8. **`src/controllers/adminController.js`**
   - Uses: `SERVICES_CONFIG.ANALYTICS_SERVICE_URL`, `SERVICES_CONFIG.AI_SERVICE_URL`

---

## Development Setup

Create `.env` file in the backend root directory:

```bash
# Create .env file
cat > .env << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mental-health-db

# JWT
JWT_SECRET=your-secure-secret-key-min-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-encryption-key-hex-format
HMAC_SECRET=your-hmac-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000

# Services
AI_SERVICE_URL=http://localhost:8001
ANALYTICS_SERVICE_URL=http://localhost:8002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

Then run:
```bash
npm run dev
```

---

## Production Deployment

### Environment Variables Required

Set these in your deployment platform (Railway, Render, Azure, Heroku, etc.):

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mental-health-db

# JWT - MUST change from defaults
JWT_SECRET=your-production-secret-key-min-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-production-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption - MUST change from defaults
ENCRYPTION_KEY=your-production-encryption-key
HMAC_SECRET=your-production-hmac-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# Services
AI_SERVICE_URL=https://your-ai-service.onrender.com
ANALYTICS_SERVICE_URL=https://your-analytics-service.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional
REDIS_URL=redis://your-redis-url
LOG_LEVEL=warn
```

### Platform-Specific Instructions

#### Railway
1. Go to **Settings** → **Environment**
2. Add all variables above
3. Redeploy from dashboard

#### Render
1. Go to **Environment**
2. Add all variables above
3. Manual deploy or push to git

#### Azure App Service
1. Go to **Configuration** → **Application settings**
2. Add all variables above
3. Save and restart

---

## Important Security Notes

⚠️ **CRITICAL:**
- Change `JWT_SECRET` and `REFRESH_TOKEN_SECRET` in production
- Change `ENCRYPTION_KEY` in production
- Never commit `.env` file to git
- Use strong, random values for secrets
- Store secrets in deployment platform, not in code

✅ **Best Practices:**
- Use environment variables for all configuration
- Never log sensitive values
- Rotate secrets periodically
- Use app-specific passwords for email (not main password)
- Use separate database credentials for production

---

**Last Updated:** May 6, 2026
**Status:** ✅ All environment variables properly centralized
