import React, { useState, useEffect } from 'react';
import { modelAPI } from '../../services/api';
import Navbar from '../Common/Navbar';
import { FaCheckCircle, FaCog, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await modelAPI.getAll();
      setModels(data);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (modelId) => {
    if (window.confirm('Are you sure you want to set this model as active?')) {
      try {
        await modelAPI.setActive(modelId);
        loadModels();
      } catch (error) {
        console.error('Error setting active model:', error);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="page-header">
          <div>
            <h1>Model Management</h1>
            <p>Manage AI model versions and performance</p>
          </div>
        </div>

        <div className="admin-card">
          <h2>Available Models</h2>
          
          <div className="models-grid">
            {models.map((model) => (
              <div
                key={model.id}
                className={`model-card ${model.isActive ? 'active-model' : ''}`}
              >
                <div className="model-header">
                  <h3>
                    <FaCog /> {model.version}
                  </h3>
                  {model.isActive && (
                    <span className="status-badge status-active">
                      <FaCheckCircle /> Active
                    </span>
                  )}
                </div>

                <p className="model-description">{model.description}</p>

                <div className="model-metrics">
                  <div className="metric">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">{(model.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Precision</span>
                    <span className="metric-value">{(model.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Recall</span>
                    <span className="metric-value">{(model.recall * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="model-footer">
                  <span className="trained-date">
                    Trained: {new Date(model.trainedDate).toLocaleDateString()}
                  </span>
                  {!model.isActive && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSetActive(model.id)}
                    >
                      Set as Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelManagement;
