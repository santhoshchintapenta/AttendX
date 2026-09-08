import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.data.token);
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      return { success: false, message: response.data.message || 'Login failed.' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Unable to connect to the server. Please try again.' 
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
