import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    const userData = response.data;
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/users/register', { name, email, password });
    const userData = response.data;
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const forgotPassword = async (email: string) => {
    await api.post('/users/forgot-password', { email });
  };

  const resetPassword = async (token: string, password: string) => {
    await api.post('/users/reset-password', { token, password });
  };

  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
