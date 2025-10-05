import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authAPI.login(email, password);
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>De Novo Discovery Engine</h1>
          <p>AI-Powered Taxonomy from Deep-Sea eDNA</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="form-group">
            <label>
              <FaEnvelope /> Email
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
          
          <div className="form-group">
            <label>
              <FaLock /> Password
            </label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <FaSignInAlt /> {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </form>
        
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin@cmlre.gov.in / admin123</p>
          <p><strong>Researcher:</strong> researcher@cmlre.gov.in / researcher123</p>
          <p><strong>Technician:</strong> tech@cmlre.gov.in / tech123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
