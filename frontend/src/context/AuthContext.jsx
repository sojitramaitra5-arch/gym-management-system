import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { hasPermission } from '../utils/permissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('gymflow_token');
    const saved = localStorage.getItem('gymflow_user');
    if (!token || !saved) {
      localStorage.removeItem('gymflow_token');
      localStorage.removeItem('gymflow_user');
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('gymflow_token');
      localStorage.removeItem('gymflow_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gymflow_token');
    if (token) {
      axiosClient.get('/api/auth/me.php')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('gymflow_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      logout();
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role = null) => {
    const payload = { email, password };
    if (role) payload.role = role;
    const res = await axiosClient.post('/api/auth/login.php', payload);
    if (res.status === 'success' && res.data?.token) {
      localStorage.setItem('gymflow_token', res.data.token);
      localStorage.setItem('gymflow_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, phone = '', gender = 'Male') => {
    const res = await axiosClient.post('/api/auth/register.php', {
      name,
      email,
      password,
      phone,
      gender
    });
    if (res.status === 'success' && res.data?.token) {
      localStorage.setItem('gymflow_token', res.data.token);
      localStorage.setItem('gymflow_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginWithGoogle = async (name, email) => {
    const res = await axiosClient.post('/api/auth/google_auth.php', { name, email });
    if (res.status === 'success' && res.data?.token) {
      localStorage.setItem('gymflow_token', res.data.token);
      localStorage.setItem('gymflow_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Google Sign-In failed');
  };

  const logout = () => {
    localStorage.removeItem('gymflow_token');
    localStorage.removeItem('gymflow_user');
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const can = (permission) => {
    return hasPermission(user, permission);
  };

  const isAuthenticated = Boolean(user && localStorage.getItem('gymflow_token'));

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, isAuthenticated, hasRole, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
