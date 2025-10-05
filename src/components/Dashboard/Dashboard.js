import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI } from '../../services/api';
import Navbar from '../Common/Navbar';
import { FaPlus, FaFolder, FaClock, FaUsers } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'Active',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectAPI.getAll();
      // Filter projects based on user role
      const filteredProjects = data.filter((project) => {
        if (user.role === 'Administrator') return true;
        return project.members.includes(user.id);
      });
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create({
        ...newProject,
        ownerId: user.id,
        members: [user.id],
      });
      setShowModal(false);
      setNewProject({ name: '', description: '', status: 'Active' });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>My Projects</h1>
            <p>Manage your eDNA analysis projects</p>
          </div>
          {(user.role === 'Administrator' || user.role === 'Researcher') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <FaFolder size={64} color="#ccc" />
            <h3>No projects yet</h3>
            <p>
              {user.role === 'Technician'
                ? 'You will see projects here when assigned to them.'
                : 'Create your first project to get started with eDNA analysis.'}
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className={`status-badge status-${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span>
                    <FaClock /> Updated {formatDate(project.updatedAt)}
                  </span>
                  <span>
                    <FaUsers /> {project.members.length} member
                    {project.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Project</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Arabian Sea Survey 2025"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    required
                    placeholder="Describe the purpose and scope of this project"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaPlus /> Create Project
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

export default Dashboard;
