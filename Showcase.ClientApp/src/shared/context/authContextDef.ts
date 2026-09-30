import { createContext } from 'react';
import type {
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/index.ts';

export interface AuthContextValue {
  currentUser: CurrentUserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

