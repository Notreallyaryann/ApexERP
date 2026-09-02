import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mini_erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mini_erp_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync session on mount
  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('mini_erp_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  // Standard Email / Password Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Try Supabase Auth first if configured
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.session) {
            // Sync with backend
            const syncRes = await authApi.syncSupabase(data.session.access_token);
            const authData = syncRes.data.data;
            setToken(authData.token);
            setUser(authData.user);
            localStorage.setItem('mini_erp_token', authData.token);
            localStorage.setItem('mini_erp_user', JSON.stringify(authData.user));
            return { success: true, user: authData.user };
          }
        } catch (sbErr) {
          console.warn('Supabase sign-in fallback to backend auth:', sbErr);
        }
      }

      // 2. Direct Backend Login
      const res = await authApi.login({ email, password });
      const authData = res.data.data;
      setToken(authData.token);
      setUser(authData.user);
      localStorage.setItem('mini_erp_token', authData.token);
      localStorage.setItem('mini_erp_user', JSON.stringify(authData.user));
      return { success: true, user: authData.user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant role testing
  const quickDemoLogin = async (roleEmail) => {
    return login(roleEmail, 'Password123!');
  };

  // Register
  const register = async (name, email, password, role = 'SALES') => {
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });
      const authData = res.data.data;
      setToken(authData.token);
      setUser(authData.user);
      localStorage.setItem('mini_erp_token', authData.token);
      localStorage.setItem('mini_erp_user', JSON.stringify(authData.user));
      return { success: true, user: authData.user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('mini_erp_token');
    localStorage.removeItem('mini_erp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        quickDemoLogin,
        register,
        logout,
      }}
    >
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
