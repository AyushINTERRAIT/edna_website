import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaFlask, FaUsers, FaSignOutAlt, FaCog } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FaFlask /> eDNA Platform
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            <FaHome /> Dashboard
          </Link>
          
          {user && (user.role === 'Administrator' || user.role === 'Researcher') && (
            <>
              <Link to="/admin/unclassified" className="nav-link">
                <FaFlask /> Unclassified Pool
              </Link>
            </>
          )}
          
          {user && user.role === 'Administrator' && (
            <>
              <Link to="/admin/models" className="nav-link">
                <FaCog /> Models
              </Link>
              <Link to="/admin/users" className="nav-link">
                <FaUsers /> Users
              </Link>
            </>
          )}
        </div>
        
        <div className="navbar-user">
          <span className="user-info">
            <strong>{user?.name}</strong>
            <span className="user-role">{user?.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
