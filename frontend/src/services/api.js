import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration - prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip if already retried or no 401 error
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Skip refresh for auth endpoints to prevent loops
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }
    
    if (isRefreshing) {
      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api.request(originalRequest);
      }).catch(err => Promise.reject(err));
    }
    
    originalRequest._retry = true;
    isRefreshing = true;
    
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      isRefreshing = false;
      localStorage.removeItem('access_token');
      return Promise.reject(error);
    }
    
    try {
      // Use Supabase to refresh token
      const { data, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      
      if (data?.session) {
        const newAccessToken = data.session.access_token;
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(originalRequest);
      } else {
        throw refreshError || new Error('Failed to refresh');
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
    
    return Promise.reject(error);
  }
);

export const documentAPI = {
  // Upload documents (single or multiple)
  uploadDocuments: async (files, autoAnalyze = true) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add auto_analyze parameter
    formData.append('auto_analyze', autoAnalyze.toString());
    
    const response = await api.post('/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents
  getAllDocuments: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },

  // Get single document by ID
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  },

  // Analyze a document
  analyzeDocument: async (id) => {
    const response = await api.post(`/documents/${id}/analyze/`);
    return response.data;
  },

  // Batch analyze multiple documents
  batchAnalyze: async (documentIds) => {
    const response = await api.post('/documents/batch_analyze/', {
      document_ids: documentIds,
    });
    return response.data;
  },

  // Batch delete multiple documents
  batchDelete: async (documentIds) => {
    const response = await api.post('/documents/batch_delete/', {
      document_ids: documentIds,
    });
    return response.data;
  },

  // Get all batches
  getBatches: async () => {
    const response = await api.get('/documents/batches/');
    return response.data;
  },

  // Get documents in a batch
  getBatchDocuments: async (batchId) => {
    const response = await api.get('/documents/batch_documents/', {
      params: { batch_id: batchId },
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}/`);
    return response.data;
  },

  // Get verification results with statistics
  getVerificationResults: async () => {
    const response = await api.get('/documents/verification_results/');
    return response.data;
  },

  // Export verification results to Excel
  exportExcel: async () => {
    const response = await api.get('/documents/export_excel/', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export extracted data in various formats
  exportExtractedData: async (format = 'csv', documentIds = null) => {
    const params = { format };
    if (documentIds) {
      params.document_ids = documentIds.join(',');
    }
    
    const response = await api.get('/documents/export_extracted_data/', {
      params,
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  },

  // Get fraud analysis for a document
  getFraudAnalysis: async (documentId, reanalyze = false) => {
    const response = await api.get('/documents/fraud_analysis/', {
      params: { 
        document_id: documentId,
        reanalyze: reanalyze.toString()
      }
    });
    return response.data;
  },
};

export default api;
