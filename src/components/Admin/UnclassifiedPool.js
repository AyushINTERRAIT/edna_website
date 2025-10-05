import React, { useState, useEffect } from 'react';
import { unclassifiedAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Common/Navbar';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const UnclassifiedPool = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [annotation, setAnnotation] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSequences();
  }, []);

  const loadSequences = async () => {
    try {
      const data = await unclassifiedAPI.getAll();
      setSequences(data);
    } catch (error) {
      console.error('Error loading sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sequenceId) => {
    try {
      await unclassifiedAPI.update(sequenceId, {
        status: 'Approved',
        reviewedBy: user.id,
        reviewDate: new Date().toISOString(),
        annotations: [annotation],
      });
      setSelectedSequence(null);
      setAnnotation('');
      loadSequences();
    } catch (error) {
      console.error('Error approving sequence:', error);
    }
  };

  const handleReject = async (sequenceId) => {
    if (window.confirm('Are you sure you want to reject this sequence?')) {
      try {
        await unclassifiedAPI.update(sequenceId, {
          status: 'Rejected',
          reviewedBy: user.id,
          reviewDate: new Date().toISOString(),
        });
        setSelectedSequence(null);
        loadSequences();
      } catch (error) {
        console.error('Error rejecting sequence:', error);
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
            <h1>Unclassified Data Pool</h1>
            <p>Review and annotate sequences for model retraining</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total Sequences:</span>
              <span className="stat-value">{sequences.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Review:</span>
              <span className="stat-value">
                {sequences.filter((s) => s.status === 'Pending Review').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Approved:</span>
              <span className="stat-value">
                {sequences.filter((s) => s.status === 'Approved').length}
              </span>
            </div>
          </div>

          {sequences.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sequence ID</th>
                  <th>Read Count</th>
                  <th>Confidence</th>
                  <th>Closest Match</th>
                  <th>Similarity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sequences.map((seq) => (
                  <tr key={seq.id}>
                    <td><strong>{seq.sequenceId}</strong></td>
                    <td>{seq.readCount}</td>
                    <td>
                      <span className="confidence-badge low">
                        {(seq.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td>{seq.closestMatch}</td>
                    <td>{(seq.similarity * 100).toFixed(1)}%</td>
                    <td>
                      <span className={`status-badge status-${seq.status.toLowerCase().replace(' ', '-')}`}>
                        {seq.status}
                      </span>
                    </td>
                    <td>
                      {seq.status === 'Pending Review' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedSequence(seq)}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-message">No unclassified sequences available.</p>
          )}
        </div>

        {/* Review Modal */}
        {selectedSequence && (
          <div className="modal-overlay" onClick={() => setSelectedSequence(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review Sequence: {selectedSequence.sequenceId}</h2>
                <button className="close-btn" onClick={() => setSelectedSequence(null)}>
                  ×
                </button>
              </div>

              <div className="sequence-details">
                <div className="detail-row">
                  <span className="detail-label">Read Count:</span>
                  <span>{selectedSequence.readCount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Confidence:</span>
                  <span>{(selectedSequence.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Closest Match:</span>
                  <span>{selectedSequence.closestMatch}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Similarity:</span>
                  <span>{(selectedSequence.similarity * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="sequence-viewer">
                <h4>Sequence Data:</h4>
                <pre>{selectedSequence.sequence}</pre>
              </div>

              <div className="form-group">
                <label>Annotation / Classification</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  placeholder="Enter taxonomic classification or notes about this sequence..."
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedSequence.id)}
                >
                  <FaTimes /> Reject
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedSequence.id)}
                  disabled={!annotation}
                >
                  <FaCheck /> Approve for Retraining
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UnclassifiedPool;
