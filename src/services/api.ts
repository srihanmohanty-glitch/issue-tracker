import axios from 'axios';

// Use the IP address of your computer
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://issue-tracker-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};

export const issues = {
  getAll: async () => {
    try {
      const response = await api.get('/issues');
      return response.data;
    } catch (error) {
      console.error('Get issues error:', error);
      throw error;
    }
  },

  create: async (formData: FormData) => {
    try {
      const response = await api.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create issue error:', error);
      throw error;
    }
  },

  addResponse: async (issueId: string, formData: FormData) => {
    try {
      const response = await api.post(`/issues/${issueId}/response`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Add response error:', error);
      throw error;
    }
  },

  updateStatus: async (issueId: string, status: string) => {
    try {
      const response = await api.patch(`/issues/${issueId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  deleteIssue: async (issueId: string) => {
    try {
      const response = await api.delete(`/issues/${issueId}`);
      return response.data;
    } catch (error) {
      console.error('Delete issue error:', error);
      throw error;
    }
  },
};

export default api;