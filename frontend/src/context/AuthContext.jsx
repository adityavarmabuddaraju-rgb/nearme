import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nearbyai_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (token.startsWith('guest_token_')) {
        const cached = localStorage.getItem('nearbyai_guest_user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
            setLoading(false);
            return;
          } catch (e) {
            // ignore
          }
        }
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        console.warn('Authentication token expired or invalid:', err.message);
        localStorage.removeItem('nearbyai_token');
        localStorage.removeItem('nearbyai_guest_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = response.data.data;
    localStorage.setItem('nearbyai_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest_user',
      _id: 'guest_user',
      name: 'Guest Explorer',
      email: 'guest@nearbyai.com',
      isGuest: true,
    };
    const guestToken = 'guest_token_' + Date.now();
    localStorage.setItem('nearbyai_token', guestToken);
    localStorage.setItem('nearbyai_guest_user', JSON.stringify(guestUser));
    setToken(guestToken);
    setUser(guestUser);
    return guestUser;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, ...userData } = response.data.data;
    localStorage.setItem('nearbyai_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nearbyai_token');
    localStorage.removeItem('nearbyai_guest_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsGuest, register, logout }}>
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
