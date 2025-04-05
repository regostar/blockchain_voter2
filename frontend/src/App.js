import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateBallot from './pages/CreateBallot';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
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
          
          {/* Protected Routes */}
          <Route 
            path="/ballots" 
            element={
              loading ? (
                <div className="text-center p-5">Loading...</div>
              ) : !isAuthenticated ? (
                <Navigate to="/login" />
              ) : (
                <div className="text-center p-5">Ballots Page (Coming Soon)</div>
              )
            } 
          />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<div className="text-center p-5">Page not found</div>} />
        </Routes>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
