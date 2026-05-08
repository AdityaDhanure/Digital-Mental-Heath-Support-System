# Frontend Environment Variables Configuration

## All Available Environment Variables

The following environment variables are managed by the `src/lib/config/env.ts` file and should be set in the `.env.local` file (development) or in Vercel's environment variables section (production).

### Environment Variables File

All environment variables are **centralized** in a single configuration file: [src/lib/config/env.ts](src/lib/config/env.ts)

This ensures:
- ✅ **Single source of truth** for all configuration
- ✅ **No hardcoded values** in component files
- ✅ **Type-safe** access to environment variables
- ✅ **Easy to override** via environment variables
- ✅ **Consistent defaults** across the app

---

## API Configuration

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Production example:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api

# AI Service URL (Python FastAPI)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001
# Production example:
# NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.onrender.com
```

**Used in:**
- `src/lib/api/axios.ts` - Axios base URL configuration
- `src/lib/api/admin.ts` - Report download functionality
- All API calls through `apiClient`

---

## App Configuration

```env
# App name (displayed in UI)
NEXT_PUBLIC_APP_NAME=Mental Health Support

# App URL (for redirects, social sharing, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production example:
# NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Used in:**
- `src/app/layout.tsx` - Page metadata (title, description)
- Metadata generation
- Social sharing tags

---

## Feature Flags

```env
# Enable chat functionality
NEXT_PUBLIC_ENABLE_CHAT=true

# Enable booking functionality
NEXT_PUBLIC_ENABLE_BOOKING=true

# Enable community functionality
NEXT_PUBLIC_ENABLE_COMMUNITY=true
```

**Used in:**
- Feature toggle logic throughout the app
- Conditional rendering of UI components

---

## Analytics Configuration

```env
# Google Analytics ID (optional)
NEXT_PUBLIC_GA_ID=

# Example:
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Important Notes

### Next.js Environment Variables

- **`NEXT_PUBLIC_*` prefix**: These variables are exposed to the browser and safe to use in client-side code
- **No prefix**: Secret variables that only work server-side (not needed for this app currently)
- Variables must be set **before** building the app in production

### Development vs Production

**Development (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_BOOKING=true
NEXT_PUBLIC_ENABLE_COMMUNITY=true
```

---

## Files Using Configuration

### ✅ Centralized Configuration

1. **`src/lib/config/env.ts`** - Central configuration file
   - Exports: `API_CONFIG`, `APP_CONFIG`, `FEATURES`, `ANALYTICS_CONFIG`
   - All environment variables are imported and exported here

### ✅ Files Using Configuration

1. **`src/lib/api/axios.ts`**
   - Uses: `API_CONFIG.API_URL`, `API_CONFIG.TIMEOUT`

2. **`src/lib/api/admin.ts`**
   - Uses: `API_CONFIG.API_URL`

3. **`src/app/layout.tsx`**
   - Uses: `APP_CONFIG.TITLE`, `APP_CONFIG.DESCRIPTION`

---

## Deployment on Vercel

This repository is a monorepo. The deployed Next.js app is inside `frontend-next/`.

Before setting variables, verify the Vercel project is configured in one of these ways:

- **Recommended:** Project Settings → General → Root Directory = `frontend-next`
- **Alternative:** keep the repository root and use the root `vercel.json`, which points Vercel to `frontend-next/package.json`

A Vercel-generated `403 Forbidden` page on the deployment URL usually means Vercel is serving the wrong project root or Deployment Protection / Vercel Authentication is enabled. Backend CORS issues appear later as failed API calls in the browser network panel.

### Step 1: Set Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-service-domain.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_BOOKING=true
NEXT_PUBLIC_ENABLE_COMMUNITY=true
```

### Step 2: Redeploy

- Trigger a redeployment from Vercel dashboard
- Or push to `main` branch if auto-deploy is enabled

### Step 3: Verify

- Check the application works with new configuration
- Inspect network requests to verify API URL is correct
- Check browser console for any errors

---

## Testing Configuration

```bash
# Test in development
npm run dev

# Then check in browser console:
# The app should connect to http://localhost:5000/api

# Test with different API URL
NEXT_PUBLIC_API_URL=https://different-api.com npm run dev
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to fetch from API" | Check `NEXT_PUBLIC_API_URL` is correct and backend is running |
| Vercel `403 Forbidden` page | Check the Vercel Root Directory points to `frontend-next`, or use the root `vercel.json`; also disable Deployment Protection for public access |
| API request blocked by CORS | Add the Vercel domain to backend `FRONTEND_URL` / `ALLOWED_ORIGINS` |
| Environment variables not updating | Clear `.next` build cache: `rm -rf .next` |
| Variables undefined in browser | Make sure to use `NEXT_PUBLIC_` prefix |

---

## Best Practices

✅ **Do:**
- Keep `.env.local` in `.gitignore`
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Set all required variables before deployment
- Use centralized `env.ts` configuration file
- Document all environment variables

❌ **Don't:**
- Commit `.env.local` to git
- Hardcode API URLs in components
- Use different variable names in different files
- Skip environment variable validation

---

**Last Updated:** May 6, 2026
**Status:** ✅ All environment variables properly centralized
