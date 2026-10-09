import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'patient' | 'doctor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('healthcare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('healthcare_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('healthcare_token');
      if (savedToken) {
        try {
          const me = await api.getMe();
          setUser(me);
          localStorage.setItem('healthcare_user', JSON.stringify(me));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('healthcare_token', res.access_token);
    localStorage.setItem('healthcare_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('healthcare_token', res.access_token);
    localStorage.setItem('healthcare_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('healthcare_token');
    localStorage.removeItem('healthcare_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (role: 'patient' | 'doctor') => {
    if (role === 'patient') {
      await login('patient@healthcare.ai', 'Patient@123');
    } else {
      await login('doctor@healthcare.ai', 'Doctor@123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
