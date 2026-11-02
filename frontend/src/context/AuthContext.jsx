import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tourist_guide_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile from token on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('tourist_guide_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('tourist_guide_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.data) {
      const { token: newToken, ...userProfile } = res.data;
      localStorage.setItem('tourist_guide_token', newToken);
      setToken(newToken);
      setUser(userProfile);
      return userProfile;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('tourist_guide_token');
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const res = await api.auth.updateProfile(profileData);
    if (res.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      return res.data;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  // Toggle favorite destination
  const toggleFavorite = async (destinationId) => {
    if (!user) return false;
    const res = await api.auth.toggleFavorite(destinationId);
    if (res.success) {
      setUser((prev) => ({
        ...prev,
        favorites: res.favorites,
      }));
      return res.isFavorite;
    }
    return false;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isManager: user?.role === 'manager',
    isTourist: user?.role === 'tourist',
    login,
    register,
    logout,
    updateProfile,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
