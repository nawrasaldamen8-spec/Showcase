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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load current authenticated user on app initialization via HttpOnly cookie
  useEffect(() => {
    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      setIsLoading(true);
      try {
        const user = await apiClient.getCurrentUser();
        if (!isCancelled) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        if (!isCancelled) {
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

  // Listen to silent refresh expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      tokenStorage.clear();
      setCurrentUser(null);
      setIsLoading(false);
    };

    window.addEventListener('showcase:auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('showcase:auth-expired', handleAuthExpired);
    };
  }, []);

  const refreshUser = useCallback(async () => {
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

  const isAuthenticated = Boolean(currentUser);
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

