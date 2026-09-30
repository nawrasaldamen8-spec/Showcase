import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type {
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/index.ts';
import { apiClient, tokenStorage } from '../api/index.ts';
import {
  AuthContext,
  type AuthContextValue,
} from './authContextDef.ts';

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(tokenStorage.getToken());
  });

  // Load current authenticated user on app initialization
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      setIsLoading(true);
      try {
        const user = await apiClient.getCurrentUser();
        if (!isCancelled) {
          if (user) {
            setCurrentUser(user);
          } else {
            tokenStorage.clear();
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        if (!isCancelled) {
          tokenStorage.clear();
          setCurrentUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Listen to silent refresh expiration or cross-tab token clearance
  useEffect(() => {
    const handleAuthExpired = () => {
      tokenStorage.clear();
      setCurrentUser(null);
      setIsLoading(false);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'showcase_auth_token' && !e.newValue) {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };

    window.addEventListener('showcase:auth-expired', handleAuthExpired);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('showcase:auth-expired', handleAuthExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);
      try {
        await apiClient.login(request);
        const user = await apiClient.getCurrentUser();
        setCurrentUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      setIsLoading(true);
      try {
        await apiClient.register(request);
        const user = await apiClient.getCurrentUser();
        setCurrentUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (err) {
      console.warn('Logout request failed or network issue:', err);
    } finally {
      tokenStorage.clear();
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(currentUser && tokenStorage.getToken());
  const isAdmin = Boolean(currentUser?.roles?.includes('Admin'));

  const value: AuthContextValue = useMemo(
    () => ({
      currentUser,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [currentUser, isAuthenticated, isAdmin, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

