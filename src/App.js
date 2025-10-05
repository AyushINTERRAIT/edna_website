import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectDetails from './components/Projects/ProjectDetails';
import DataManagement from './components/Data/DataManagement';
import ResultsDashboard from './components/Results/ResultsDashboard';
import ModelManagement from './components/Admin/ModelManagement';
import UnclassifiedPool from './components/Admin/UnclassifiedPool';
import UserManagement from './components/Admin/UserManagement';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/project/:id/data"
              element={
                <ProtectedRoute>
                  <DataManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/results/:jobId"
              element={
                <ProtectedRoute>
                  <ResultsDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/models"
              element={
                <ProtectedRoute requiredRole="Administrator">
                  <ModelManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/unclassified"
              element={
                <ProtectedRoute requiredRole={["Administrator", "Researcher"]}>
                  <UnclassifiedPool />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="Administrator">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
