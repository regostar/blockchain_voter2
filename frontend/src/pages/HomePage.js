import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, isVerified, user } = useAuth();

  return (
    <div className="container mt-4">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">Blockchain Voting System</h1>
        <p className="lead">
          A secure and transparent voting platform built on blockchain technology.
        </p>
        <hr className="my-4" />
        
        {isAuthenticated ? (
          <>
            <p>
              Welcome back, <strong>{user.username}!</strong>
            </p>
            {isVerified ? (
              <p>
                You are verified and eligible to vote in active ballots.
              </p>
            ) : (
              <div className="alert alert-warning">
                Your account has not been verified yet. Please contact an administrator
                to verify your account and receive your voter token.
              </div>
            )}
            <div className="mt-4">
              <Link to="/ballots" className="btn btn-primary me-3">
                View Active Ballots
              </Link>
              <Link to="/my-votes" className="btn btn-outline-primary">
                View My Votes
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>
              This platform allows for secure, anonymous voting using blockchain technology.
              Your votes are encrypted and stored on the blockchain, ensuring transparency
              and preventing tampering.
            </p>
            <div className="mt-4">
              <Link to="/register" className="btn btn-primary me-3">
                Register
              </Link>
              <Link to="/login" className="btn btn-outline-primary">
                Login
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Features section */}
      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Secure Voting</h5>
              <p className="card-text">
                Your vote is securely encrypted and stored on the blockchain,
                ensuring it cannot be tampered with or changed.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Transparent Process</h5>
              <p className="card-text">
                All votes are recorded on a public blockchain, allowing for
                complete transparency while maintaining voter privacy.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Voter Verification</h5>
              <p className="card-text">
                Each voter is verified and issued a unique token, ensuring
                that only eligible voters can participate and each person
                can only vote once.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 