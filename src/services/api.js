import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await api.get('/users', {
      params: { email, password },
    });
    if (response.data.length > 0) {
      return response.data[0];
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (userData) => {
    const response = await api.post('/users', {
      ...userData,
      createdAt: new Date().toISOString(),
    });
    return response.data;
  },
};

// Project APIs
export const projectAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData) => {
    const response = await api.post('/projects', {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },
  
  update: async (id, projectData) => {
    const response = await api.patch(`/projects/${id}`, {
      ...projectData,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/projects/${id}`);
  },
};

// Dataset APIs
export const datasetAPI = {
  getByProjectId: async (projectId) => {
    const response = await api.get('/datasets', {
      params: { projectId },
    });
    return response.data;
  },
  
  create: async (datasetData) => {
    const response = await api.post('/datasets', {
      ...datasetData,
      uploadedAt: new Date().toISOString(),
    });
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/datasets/${id}`);
  },
};

// Analysis Job APIs
export const analysisAPI = {
  getByProjectId: async (projectId) => {
    const response = await api.get('/analysisJobs', {
      params: { projectId },
    });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/analysisJobs/${id}`);
    return response.data;
  },
  
  create: async (jobData) => {
    const response = await api.post('/analysisJobs', {
      ...jobData,
      submittedAt: new Date().toISOString(),
      progress: 0,
    });
    return response.data;
  },
  
  updateStatus: async (id, status, progress) => {
    const response = await api.patch(`/analysisJobs/${id}`, {
      status,
      progress,
      ...(status === 'Completed' && { completedAt: new Date().toISOString() }),
      ...(status === 'Processing' && !progress && { startedAt: new Date().toISOString() }),
    });
    return response.data;
  },
};

// Results APIs
export const resultsAPI = {
  getByJobId: async (jobId) => {
    const response = await api.get('/results', {
      params: { jobId },
    });
    return response.data[0];
  },
};

// Model APIs
export const modelAPI = {
  getAll: async () => {
    const response = await api.get('/models');
    return response.data;
  },
  
  getActive: async () => {
    const response = await api.get('/models', {
      params: { isActive: true },
    });
    return response.data[0];
  },
  
  setActive: async (id) => {
    // First, deactivate all models
    const models = await api.get('/models');
    await Promise.all(
      models.data.map((model) =>
        api.patch(`/models/${model.id}`, { isActive: false })
      )
    );
    
    // Then activate the selected model
    const response = await api.patch(`/models/${id}`, { isActive: true });
    return response.data;
  },
};

// Unclassified Pool APIs
export const unclassifiedAPI = {
  getAll: async () => {
    const response = await api.get('/unclassifiedPool');
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/unclassifiedPool/${id}`, data);
    return response.data;
  },
};

// User Management APIs
export const userAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/users', {
      ...userData,
      createdAt: new Date().toISOString(),
    });
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
