'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { type AuthResponse, getProfile } from './api';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  setAuth: (user: AuthResponse['user'], token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isLoading: true };
  }
  const token = localStorage.getItem('nexusflow_token');
  return { user: null, token, isLoading: !!token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const setAuth = useCallback((user: AuthResponse['user'], token: string) => {
    localStorage.setItem('nexusflow_token', token);
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('nexusflow_token');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  useEffect(() => {
    if (!state.token) return;
    let cancelled = false;

    getProfile(state.token)
      .then((user) => {
        if (!cancelled) setState((prev) => ({ ...prev, user, isLoading: false }));
      })
      .catch(() => {
        localStorage.removeItem('nexusflow_token');
        if (!cancelled) setState({ user: null, token: null, isLoading: false });
      });

    return () => { cancelled = true; };
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
