import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import HomePage from './components/HomePage.jsx';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import SessionTimeout from './components/SessionTimeout';
import { ConfigProvider, Spin } from 'antd';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WalletConnector from './components/WalletConnector';

interface RouteProps {
  children: ReactNode;
}

// Protected Route component
const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Public Route component (redirects if already authenticated)
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC<{ theme: any }> = ({ theme }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Navbar />
        {user && <SessionTimeout />}
        <main>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wallet-verification"
              element={
                <ProtectedRoute>
                  <WalletConnector />
                </ProtectedRoute>
              }
            />

            {/* Home Route (accessible to all) */}
            <Route path="/" element={<HomePage />} />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  Page not found
                </div>
              } 
            />
          </Routes>
        </main>
      </Router>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  // Define theme colors for Ant Design
  const theme = {
    token: {
      colorPrimary: '#76B900', // Green
      colorBgContainer: '#FFFFFF', // White
      colorText: '#1E1E1E', // Dark Gray
      colorBgLayout: '#FFFFFF', // White
    },
    components: {
      Button: {
        colorPrimary: '#76B900',
        colorPrimaryHover: '#68a500',
      },
      Menu: {
        colorItemBg: '#1E1E1E',
        colorItemText: '#FFFFFF',
        colorItemTextSelected: '#76B900',
      },
      Card: {
        colorBorderSecondary: '#1E1E1E',
      },
    },
  };

  return (
    <AuthProvider>
      <AppContent theme={theme} />
    </AuthProvider>
  );
};

export default App; 