// ============================================
// SOLUTION 2: Fix Auth Store Hydration
// FILE: src/store/authStore.ts (UPDATED)
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  isValidating: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  // ▼ ADD THIS LINE ▼
  setValidating: (validating: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isValidating: false,
      isHydrated: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        });
      },

      setToken: (token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ token, isAuthenticated: !!token });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      setValidating: (isValidating) => set({ isValidating }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          
          // FIX: If we have a token, we should probably start in a "loading/validating" 
          // state rather than assuming we are authenticated immediately, 
          // OR assume authenticated but allow background validation.
          
          if (state.token && state.user) {
             // Checking if we have a token means we MIGHT be valid.
             // Usually, you want to set isValidating = true here so the UI 
             // knows to run the backend check.
             state.isValidating = true; 
             state.isAuthenticated = true; // Optimistic update
          } else {
             state.isAuthenticated = false;
             state.isValidating = false;
          }
          
          state.isLoading = false;
        }
      },
    }
  )
);