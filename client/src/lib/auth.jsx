import React, { createContext, useContext, useState } from 'react';
import { offlineApi } from './offlineDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Always provide a local profile immediately with zero login wall
  const [user, setUser] = useState(() => {
    try {
      const data = offlineApi.me();
      return (
        data?.user || {
          id: 1,
          name: 'Dra. Ana Beatriz',
          email: 'demo@revalida.app',
          created_at: new Date().toISOString(),
        }
      );
    } catch {
      return {
        id: 1,
        name: 'Dra. Ana Beatriz',
        email: 'demo@revalida.app',
        created_at: new Date().toISOString(),
      };
    }
  });

  const updateProfile = async (payload) => {
    const data = offlineApi.updateProfile(payload);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        isAuthenticated: true,
        login: async () => user,
        register: async () => user,
        updateProfile,
        logout: () => {},
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
