import { createContext } from 'react';
import type {
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/index.ts';

export type ActivePersona = 'visitor' | 'creator' | 'admin';

export interface AuthContextValue {
  currentUser: CurrentUserResponse | null;
  activePersona: ActivePersona;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchPersona: (persona: ActivePersona) => void;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export const PERSONA_STORAGE_KEY = 'showcase_active_persona';
