import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAuthToken } from '../services/apiClient.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ems-auth';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return { user: null, token: null };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { user: null, token: null };
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user ?? null,
        token: parsed.token ?? null
      };
    } catch {
      return { user: null, token: null };
    }
  });

  useEffect(() => {
    setAuthToken(authState.token);
  }, [authState.token]);

  useEffect(() => {
    if (authState.token) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: authState.user, token: authState.token })
      );
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const login = useCallback(async (email, password) => {
    const result = await apiClient.login({ email, password });
    setAuthState({ user: result.user, token: result.token });
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, token: null });
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      login,
      logout
    }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
