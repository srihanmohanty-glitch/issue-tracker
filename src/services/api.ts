import axios from 'axios';

// Use the IP address of your computer
// Updated API URL for Render backend deployment
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://issue-tracker-backend-j6ai.onrender.com/api');

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
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
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

export const accounts = {
  getMe: async () => {
    try {
      const response = await api.get('/accounts/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  getAll: async (params: any = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/accounts?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Get accounts error:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get account error:', error);
      throw error;
    }
  },

  create: async (userData: any) => {
    try {
      const response = await api.post('/accounts', userData);
      return response.data;
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  },

  update: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/accounts/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update account error:', error);
      throw error;
    }
  },

  changePassword: async (id: string, passwordData: any) => {
    try {
      const response = await api.put(`/accounts/${id}/password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  resetLoginAttempts: async (id: string) => {
    try {
      const response = await api.post(`/accounts/${id}/reset-login-attempts`);
      return response.data;
    } catch (error) {
      console.error('Reset login attempts error:', error);
      throw error;
    }
  },

  bulkAction: async (action: string, userIds: string[], data?: any) => {
    try {
      const response = await api.post('/accounts/bulk', {
        action,
        userIds,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Bulk action error:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/accounts/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },
};

export default api;