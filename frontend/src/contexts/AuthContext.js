import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to handle session timeout
  const handleSessionTimeout = () => {
    logout();
    window.location.href = '/login?timeout=true';
  };

  // Function to reset session timer
  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    const newTimer = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    setSessionTimer(newTimer);
    sessionStorage.setItem('lastActivity', Date.now().toString());
  };

  // Effect to check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('accessToken');
        const lastActivity = sessionStorage.getItem('lastActivity');

        if (storedUser && token && lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

          if (timeSinceLastActivity <= SESSION_TIMEOUT) {
            try {
              const response = await authAPI.verifyToken();
              if (response.data.valid) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                resetSessionTimer();
              } else {
                await logout();
              }
            } catch (error) {
              console.error('Failed to verify token:', error);
              await logout();
            }
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // Effect to handle user activity
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      resetSessionTimer();
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ username, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('lastActivity', Date.now().toString());

      setUser(userData);
      resetSessionTimer();
      return userData;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
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
  const logout = async () => {
    try {
      // Attempt to logout from the server
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local session data regardless of server response
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('lastActivity');
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      setUser(null);
    }
  };

  // Update user data without affecting the authentication state
  const updateUserData = (newData) => {
    setUser(currentUser => {
      const updatedUser = { ...currentUser, ...newData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      resetSessionTimer();
      return updatedUser;
    });
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
    resetSessionTimer,
    isInitialized
  };

  // Don't render children until authentication is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 