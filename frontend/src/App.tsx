import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import HomePage from './components/HomePage.jsx';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import { ConfigProvider } from 'antd';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC<{ theme: any }> = ({ theme }) => {
  const { user } = useAuth();

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

            {/* Root path showing home page */}
            <Route path="/" element={<HomePage />} />

            {/* Profile page - protected route */}
            <Route
              path="/profile"
              element={
                user ? (
                  <ProfilePage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Add your protected routes here */}
            {/* Example:
            <Route 
              path="/ballots" 
              element={
                loading ? (
                  <div className="text-center p-5">Loading...</div>
                ) : !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <ViewBallots />
                )
              } 
            />
            */}

            {/* Catch-all route for 404 */}
            <Route path="*" element={<div style={{ textAlign: 'center', padding: '20px' }}>Page not found</div>} />
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