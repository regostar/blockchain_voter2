import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import HomePage from './components/HomePage.jsx';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import ViewBallots from './pages/ViewBallots';
import BallotDetail from './pages/BallotDetail';
import CreateBallot from './pages/CreateBallot';
import { ConfigProvider } from 'antd';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = ({ theme }) => {
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated, isAdmin, loading } = useAuth();

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

            {/* Root path showing home page */}
            <Route path="/" element={<HomePage />} />

            {/* Profile page - protected route */}
            <Route
              path="/profile"
              element={
                loading ? (
                  <div className="text-center p-5">Loading...</div>
                ) : !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <ProfilePage />
                )
              }
            />

            {/* Ballot routes */}
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
            <Route
              path="/ballots/:id"
              element={
                loading ? (
                  <div className="text-center p-5">Loading...</div>
                ) : !isAuthenticated ? (
                  <Navigate to="/login" />
                ) : (
                  <BallotDetail />
                )
              }
            />
            <Route
              path="/create-ballot"
              element={
                loading ? (
                  <div className="text-center p-5">Loading...</div>
                ) : !isAuthenticated || !isAdmin ? (
                  <Navigate to="/" />
                ) : (
                  <CreateBallot />
                )
              }
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<div style={{ textAlign: 'center', padding: '20px' }}>Page not found</div>} />
          </Routes>
        </main>
      </Router>
    </ConfigProvider>
  );
};

const App = () => {
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