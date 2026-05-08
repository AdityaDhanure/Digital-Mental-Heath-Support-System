// ============================================
// FILE: src/lib/api/axios.ts
// ============================================
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from '@/lib/config/env';

interface CachedRequestConfig extends InternalAxiosRequestConfig {
  _cacheKey?: string;
}

interface CachedResponse {
  timestamp: number;
  status: number;
  statusText: string;
  headers: AxiosResponse['headers'];
  data: unknown;
}

const API_CACHE_PREFIX = 'mindsage:api-cache:';
const API_CACHE_TTL_MS = 60 * 1000;
const memoryCache = new Map<string, CachedResponse>();

const apiClient = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,  // 30 seconds
});

const stableStringify = (value: unknown): string => {
  if (!value || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return JSON.stringify(value.map((item) => JSON.parse(stableStringify(item))));

  return JSON.stringify(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = (value as Record<string, unknown>)[key];
        return acc;
      }, {})
  );
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const buildCacheKey = (config: InternalAxiosRequestConfig) => {
  const token = getToken();
  const authScope = token ? token.slice(-16) : 'anonymous';
  const url = `${config.baseURL || ''}${config.url || ''}`;
  return `${API_CACHE_PREFIX}${authScope}:${url}:${stableStringify(config.params)}`;
};

const isFresh = (entry: CachedResponse) => Date.now() - entry.timestamp < API_CACHE_TTL_MS;

const readCache = (key: string) => {
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && isFresh(memoryEntry)) return memoryEntry;
  if (memoryEntry) memoryCache.delete(key);

  return null;
};

const writeCache = (key: string, response: AxiosResponse) => {
  const entry: CachedResponse = {
    timestamp: Date.now(),
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data,
  };

  memoryCache.set(key, entry);
};

const clearApiCache = () => {
  memoryCache.clear();
};

const formatValidationError = (value: unknown) => {
  if (typeof value === 'object' && value !== null) {
    const errorValue = value as { message?: unknown; msg?: unknown };
    return String(errorValue.message ?? errorValue.msg ?? value);
  }

  return String(value);
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if ((config.method || 'get').toLowerCase() === 'get') {
      const cachedConfig = config as CachedRequestConfig;
      const cacheKey = buildCacheKey(config);
      cachedConfig._cacheKey = cacheKey;

      const cached = readCache(cacheKey);
      if (cached) {
        config.adapter = async () => ({
          data: cached.data,
          status: cached.status,
          statusText: cached.statusText,
          headers: cached.headers,
          config,
          request: { fromCache: true },
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as CachedRequestConfig;
    const method = (config.method || 'get').toLowerCase();

    if (method === 'get' && config._cacheKey && response.status >= 200 && response.status < 300) {
      writeCache(config._cacheKey, response);
    } else if (!['get', 'head', 'options'].includes(method)) {
      clearApiCache();
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token is invalid or expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        useAuthStore.getState().logout();
        
        // Only redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle validation errors (400 status)
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      
      // If backend returns multiple validation errors as object
      if (errorData.errors && typeof errorData.errors === 'object') {
        const messages = Object.values(errorData.errors).map(formatValidationError).join(', ');
        error.response.data.message = messages;
      }
      
      // If backend returns errors as array
      if (Array.isArray(errorData.errors)) {
        error.response.data.message = errorData.errors.map(formatValidationError).join(', ');
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
