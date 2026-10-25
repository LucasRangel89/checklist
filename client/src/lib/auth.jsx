import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from './api';

const AuthContext = createContext(null);
const LOGGED_OUT_FLAG = 'revalida_explicit_logout';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    const explicitLogout = localStorage.getItem(LOGGED_OUT_FLAG) === 'true';

    if (!token) {
      // On first launch (when user hasn't explicitly logged out), auto-login demo account
      // so the PWA opens directly into the navigable panels on mobile/desktop
      if (!explicitLogout) {
        try {
          const demoData = await api.login({
            email: 'demo@revalida.app',
            password: 'demo1234',
          });
          setStoredToken(demoData.token);
          setUser(demoData.user);
          setLoading(false);
          return;
        } catch {
          // fallback to unauthenticated
        }
      }
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.me();
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    localStorage.removeItem(LOGGED_OUT_FLAG);
    const data = await api.login({ email, password });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    localStorage.removeItem(LOGGED_OUT_FLAG);
    const data = await api.register({ name, email, password });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const data = await api.updateProfile(payload);
    if (data.token) {
      setStoredToken(data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.setItem(LOGGED_OUT_FLAG, 'true');
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return ctx;
}
