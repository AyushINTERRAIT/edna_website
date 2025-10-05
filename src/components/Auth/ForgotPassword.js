import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send a password reset email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>eDNA Analysis Platform</h1>
          </div>
          
          <div className="auth-form">
            <div className="alert alert-success">
              <h3>Email Sent!</h3>
              <p>If an account exists with {email}, you will receive password reset instructions.</p>
            </div>
            
            <div className="auth-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>eDNA Analysis Platform</h1>
          <p>Centre for Marine Living Resources and Ecology</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Forgot Password</h2>
          <p className="form-description">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          
          <div className="form-group">
            <label>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            <FaPaperPlane /> Send Reset Instructions
          </button>
          
          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
