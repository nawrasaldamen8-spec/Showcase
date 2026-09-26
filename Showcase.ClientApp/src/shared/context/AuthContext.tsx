import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/index.ts';
import { apiClient } from '../api/index.ts';
import {
  AuthContext,
  PERSONA_STORAGE_KEY,
  type ActivePersona,
  type AuthContextValue,
} from './authContextDef.ts';

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [activePersona, setActivePersonaState] = useState<ActivePersona>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored === 'visitor' || stored === 'creator' || stored === 'admin') {
        return stored;
      }
    }
    return 'creator';
  });

  const [creatorUser, setCreatorUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize creator/admin user details when in authenticated mode
  useEffect(() => {
    if (activePersona === 'visitor') {
      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      setIsLoading(true);
      try {
        const user = await apiClient.getCurrentUser();
        if (!isCancelled) {
          setCreatorUser(user);
        }
      } catch (err) {
        console.error('Failed to load identity:', err);
        if (!isCancelled) {
          setCreatorUser(null);
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
  }, [activePersona]);

  // Synchronize across window events and cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PERSONA_STORAGE_KEY && (e.newValue === 'visitor' || e.newValue === 'creator' || e.newValue === 'admin')) {
        setActivePersonaState(e.newValue);
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<ActivePersona>;
      if (customEvent.detail === 'visitor' || customEvent.detail === 'creator' || customEvent.detail === 'admin') {
        setActivePersonaState(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('showcase:persona-change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('showcase:persona-change', handleCustomChange);
    };
  }, []);

  const switchPersona = useCallback((persona: ActivePersona) => {
    setActivePersonaState(persona);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERSONA_STORAGE_KEY, persona);
      window.dispatchEvent(new CustomEvent('showcase:persona-change', { detail: persona }));
    }
    apiClient.switchPersona(persona);
  }, []);

  const refreshUser = useCallback(async () => {
    if (activePersona !== 'visitor') {
      setIsLoading(true);
      try {
        const user = await apiClient.getCurrentUser();
        setCreatorUser(user);
      } finally {
        setIsLoading(false);
      }
    }
  }, [activePersona]);

  const login = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);
      try {
        await apiClient.login(request);
        switchPersona('creator');
        const user = await apiClient.getCurrentUser();
        setCreatorUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    [switchPersona]
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      setIsLoading(true);
      try {
        await apiClient.register(request);
        switchPersona('creator');
        const user = await apiClient.getCurrentUser();
        setCreatorUser(user);
      } finally {
        setIsLoading(false);
      }
    },
    [switchPersona]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      switchPersona('visitor');
      setCreatorUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [switchPersona]);

  const currentUser = activePersona === 'visitor' ? null : creatorUser;
  const isAuthenticated = activePersona !== 'visitor' && currentUser !== null;

  const value: AuthContextValue = {
    currentUser,
    activePersona,
    isAuthenticated,
    isLoading,
    switchPersona,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
