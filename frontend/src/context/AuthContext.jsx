import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAuthToken } from '../services/apiClient.js';

/**
 * Global authentication context
 * - Hydrates the JWT + user payload from localStorage.
 * - Automatically injects Authorization headers on fetches.
 * - Derives common permission flags (isManager, accessibleEmployeeIds).
 */
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

  /**
   * Authenticate the user against the backend and persist the new session.
   */
  const login = useCallback(async (email, password) => {
    const result = await apiClient.login({ email, password });
    setAuthState({ user: result.user, token: result.token });
    return result.user;
  }, []);

  /**
   * Clear the token + user from memory and storage.
   */
  const logout = useCallback(() => {
    setAuthState({ user: null, token: null });
  }, []);

  const isManager = useMemo(() => {
    if (!authState.user) return false;
    if (typeof authState.user.isManager === 'boolean') {
      return authState.user.isManager;
    }
    return authState.user.permissions?.scope === 'manager';
  }, [authState.user]);

  const accessibleEmployeeIds = useMemo(() => {
    if (!authState.user) return [];
    const base = authState.user.id ? [authState.user.id] : [];
    if (isManager && Array.isArray(authState.user.permissions?.managedEmployeeIds)) {
      return Array.from(new Set([...base, ...authState.user.permissions.managedEmployeeIds]));
    }
    return base;
  }, [authState.user, isManager]);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      isManager,
      accessibleEmployeeIds,
      login,
      logout
    }),
    [authState, isManager, accessibleEmployeeIds, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Simple hook wrapper so components can consume authentication data safely.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
