import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { datasetAPI, analysisAPI, modelAPI } from '../../services/api';
import Navbar from '../Common/Navbar';
import { FaUpload, FaPlay, FaArrowLeft, FaTrash } from 'react-icons/fa';
import './DataManagement.css';

const DataManagement = () => {
  const { id } = useParams();
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeModel, setActiveModel] = useState(null);
  const [uploadData, setUploadData] = useState({
    sampleId: '',
    filename: '',
    latitude: '',
    longitude: '',
    depth: '',
    collectionDate: '',
    temperature: '',
    salinity: '',
  });
  const [analysisParams, setAnalysisParams] = useState({
    modelVersion: '',
    minConfidence: 0.75,
    taxonomicLevel: 'species',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [datasetsData, model] = await Promise.all([
        datasetAPI.getByProjectId(id),
        modelAPI.getActive(),
      ]);
      setDatasets(datasetsData);
      setActiveModel(model);
      setAnalysisParams((prev) => ({ ...prev, modelVersion: model?.version || '' }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await datasetAPI.create({
        ...uploadData,
        projectId: id,
        uploadedBy: user.id,
        status: 'Uploaded',
        size: '25 MB', // Mock size
      });
      setShowUploadModal(false);
      setUploadData({
        sampleId: '',
        filename: '',
        latitude: '',
        longitude: '',
        depth: '',
        collectionDate: '',
        temperature: '',
        salinity: '',
      });
      loadData();
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    try {
      const jobPromises = selectedDatasets.map((datasetId) =>
        analysisAPI.create({
          datasetId,
          projectId: id,
          submittedBy: user.id,
          status: 'Queued',
          ...analysisParams,
        })
      );
      await Promise.all(jobPromises);
      setShowAnalysisModal(false);
      setSelectedDatasets([]);
      navigate(`/project/${id}`);
    } catch (error) {
      console.error('Error running analysis:', error);
    }
  };

  const handleDelete = async (datasetId) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      try {
        await datasetAPI.delete(datasetId);
        loadData();
      } catch (error) {
        console.error('Error deleting dataset:', error);
      }
    }
  };

  const toggleDatasetSelection = (datasetId) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  return (
    <>
      <Navbar />
      <div className="data-management-container">
        <button className="btn btn-secondary" onClick={() => navigate(`/project/${id}`)}>
          <FaArrowLeft /> Back to Project
        </button>

        <div className="page-header">
          <h1>Data Management</h1>
          <div className="header-actions">
            {selectedDatasets.length > 0 && (
              <button className="btn btn-success" onClick={() => setShowAnalysisModal(true)}>
                <FaPlay /> Run Analysis ({selectedDatasets.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              <FaUpload /> Upload Data
            </button>
          </div>
        </div>

        <div className="data-card">
          {datasets.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedDatasets.length === datasets.length}
                      onChange={(e) =>
                        setSelectedDatasets(
                          e.target.checked ? datasets.map((d) => d.id) : []
                        )
                      }
                    />
                  </th>
                  <th>Sample ID</th>
                  <th>Filename</th>
                  <th>Location</th>
                  <th>Depth (m)</th>
                  <th>Temp (°C)</th>
                  <th>Salinity (PSU)</th>
                  <th>Collection Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDatasets.includes(dataset.id)}
                        onChange={() => toggleDatasetSelection(dataset.id)}
                      />
                    </td>
                    <td><strong>{dataset.sampleId}</strong></td>
                    <td>{dataset.filename}</td>
                    <td>
                      {dataset.latitude.toFixed(4)}, {dataset.longitude.toFixed(4)}
                    </td>
                    <td>{dataset.depth}</td>
                    <td>{dataset.temperature}</td>
                    <td>{dataset.salinity}</td>
                    <td>{new Date(dataset.collectionDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${dataset.status.toLowerCase().replace(' ', '-')}`}>
                        {dataset.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(dataset.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FaUpload size={48} color="#ccc" />
              <h3>No datasets uploaded</h3>
              <p>Upload your eDNA sequencing data to get started.</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Upload eDNA Dataset</h2>
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sample ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={uploadData.sampleId}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, sampleId: e.target.value })
                      }
                      required
                      placeholder="e.g., AB001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Filename *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={uploadData.filename}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, filename: e.target.value })
                      }
                      required
                      placeholder="sample.fasta"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude *</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={uploadData.latitude}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, latitude: e.target.value })
                      }
                      required
                      placeholder="15.4875"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude *</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={uploadData.longitude}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, longitude: e.target.value })
                      }
                      required
                      placeholder="68.9874"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Depth (meters) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={uploadData.depth}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, depth: e.target.value })
                      }
                      required
                      placeholder="2500"
                    />
                  </div>
                  <div className="form-group">
                    <label>Collection Date *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={uploadData.collectionDate}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, collectionDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Temperature (°C) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={uploadData.temperature}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, temperature: e.target.value })
                      }
                      required
                      placeholder="4.2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Salinity (PSU) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={uploadData.salinity}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, salinity: e.target.value })
                      }
                      required
                      placeholder="35.1"
                    />
                  </div>
                </div>

                <div className="upload-zone">
                  <FaUpload size={32} color="#667eea" />
                  <p>Drag and drop FASTA files here or click to browse</p>
                  <input type="file" accept=".fasta,.fa" style={{ display: 'none' }} />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaUpload /> Upload Dataset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Analysis Modal */}
        {showAnalysisModal && (
          <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Configure Analysis</h2>
                <button className="close-btn" onClick={() => setShowAnalysisModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleRunAnalysis}>
                <div className="form-group">
                  <label>AI Model Version</label>
                  <input
                    type="text"
                    className="form-control"
                    value={analysisParams.modelVersion}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Confidence Threshold</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={analysisParams.minConfidence}
                    onChange={(e) =>
                      setAnalysisParams({
                        ...analysisParams,
                        minConfidence: parseFloat(e.target.value),
                      })
                    }
                  />
                  <span>{analysisParams.minConfidence}</span>
                </div>

                <div className="form-group">
                  <label>Taxonomic Level</label>
                  <select
                    className="form-control"
                    value={analysisParams.taxonomicLevel}
                    onChange={(e) =>
                      setAnalysisParams({
                        ...analysisParams,
                        taxonomicLevel: e.target.value,
                      })
                    }
                  >
                    <option value="species">Species</option>
                    <option value="genus">Genus</option>
                    <option value="family">Family</option>
                    <option value="order">Order</option>
                  </select>
                </div>

                <div className="alert alert-info">
                  {selectedDatasets.length} dataset(s) will be analyzed
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAnalysisModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <FaPlay /> Run Analysis
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DataManagement;
