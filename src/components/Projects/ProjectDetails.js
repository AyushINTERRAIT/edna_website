import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, datasetAPI, analysisAPI } from '../../services/api';
import Navbar from '../Common/Navbar';
import { FaEdit, FaTrash, FaDatabase, FaPlay, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjectData();
    const interval = setInterval(loadJobs, 5000); // Poll for job updates every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectData, datasetsData, jobsData] = await Promise.all([
        projectAPI.getById(id),
        datasetAPI.getByProjectId(id),
        analysisAPI.getByProjectId(id),
      ]);
      setProject(projectData);
      setDatasets(datasetsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await analysisAPI.getByProjectId(id);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting project:', error);
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

  const isOwner = project.ownerId === user.id;
  const canManageData = user.role !== 'Technician' || project.members.includes(user.id);

  return (
    <>
      <Navbar />
      <div className="project-details-container">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="project-info-card">
          <div className="project-info-header">
            <div>
              <h1>{project.name}</h1>
              <p>{project.description}</p>
            </div>
            <div className="project-actions">
              {isOwner && (
                <>
                  <button className="btn btn-secondary">
                    <FaUserPlus /> Manage Members
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    <FaTrash /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="section-tabs">
          <button
            className="tab-btn active"
            onClick={() => navigate(`/project/${id}/data`)}
          >
            <FaDatabase /> Data & Analysis
          </button>
        </div>

        <div className="datasets-section">
          <div className="section-header">
            <h2>Datasets ({datasets.length})</h2>
            {canManageData && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/project/${id}/data`)}
              >
                <FaDatabase /> Manage Data
              </button>
            )}
          </div>

          {datasets.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Filename</th>
                  <th>Depth (m)</th>
                  <th>Temperature (°C)</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id}>
                    <td><strong>{dataset.sampleId}</strong></td>
                    <td>{dataset.filename}</td>
                    <td>{dataset.depth}</td>
                    <td>{dataset.temperature}</td>
                    <td>
                      <span className={`status-badge status-${dataset.status.toLowerCase().replace(' ', '-')}`}>
                        {dataset.status}
                      </span>
                    </td>
                    <td>{new Date(dataset.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-message">No datasets uploaded yet.</p>
          )}
        </div>

        <div className="jobs-section">
          <div className="section-header">
            <h2>Analysis Jobs ({jobs.length})</h2>
          </div>

          {jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-info">
                    <h3>Job #{job.id}</h3>
                    <p>Model: {job.modelVersion}</p>
                    <p>Submitted: {new Date(job.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="job-status">
                    <span className={`status-badge status-${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                    {job.status === 'Processing' && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    )}
                    {job.status === 'Completed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/results/${job.id}`)}
                      >
                        <FaPlay /> View Results
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No analysis jobs yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
