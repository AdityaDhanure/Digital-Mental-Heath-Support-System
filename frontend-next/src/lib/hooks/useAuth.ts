// ============================================
// FILE: src/lib/hooks/useAuth.ts (NEW - Custom Auth Hook)
// ============================================
import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api/auth';
import toast from 'react-hot-toast';


export const useAuth = (requireAuth = true) => {
  const hasValidatedRef = useRef(false);
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isValidating,
    setUser,
    setToken,
    setValidating,
    logout,
    isHydrated,
  } = useAuthStore();

  // Run validation on mount if token exists
  useEffect(() => {
    if (!isHydrated) return;

    // ✅ Already authenticated → DO NOTHING
    if (isAuthenticated) return;

    // ✅ Prevent multiple validations
    if (hasValidatedRef.current) return;
    hasValidatedRef.current = true;

    const validate = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (!storedToken) {
        if (requireAuth) router.replace('/login');
        return;
      }

      setValidating(true);

      try {
        const res = await authAPI.getProfile();

        setUser(res.data.user);
        setToken(storedToken);
      } catch {
        logout();
        toast.error('Session expired. Please login again.');
        router.replace('/login');
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [isHydrated, isAuthenticated, requireAuth, router, logout, setUser, setToken, setValidating]);

  const refreshUser = async () => {
  setValidating(true);
  try {
    const res = await authAPI.getProfile();
    setUser(res.data.user);
  } finally {
    setValidating(false);
  }
};

  return {
    user,
    isAuthenticated,
    isLoading: !isHydrated || isValidating,
    logout,
    refreshUser, // ✅ optional helper
  };
};