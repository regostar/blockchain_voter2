import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        try {
          // Verify the token is still valid
          const response = await authAPI.verifyToken();
          if (response.data.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            // If token is invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          // Don't automatically logout on verification failure
          // as the interceptor will try to refresh the token
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ username, password });
      const { accessToken, refreshToken, user } = response.data;

      // Save tokens and user data to local storage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setLoading(false);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update the user data
  const updateUserData = (newUserData) => {
    if (user) {
      const updatedUser = { ...user, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // The value to be provided to consumers
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isVerified: user?.isVerified || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 