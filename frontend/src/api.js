import axios from 'axios';

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', null, {
      params: { email, password }
    });
    
    // Store tokens in localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('id_token', response.data.id_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('refresh_token');
};

// ============================================
// COMPLAINTS API
// ============================================

export const getComplaints = async () => {
  try {
    const response = await api.get('/api/v1/complaints');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch complaints: ${error.message}`);
  }
};

export const getComplaint = async (complaintId) => {
  try {
    const response = await api.get(`/api/v1/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch complaint: ${error.message}`);
  }
};

export const submitComplaint = async (complaint) => {
  try {
    const response = await api.post('/api/v1/complaints', complaint);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to submit complaint: ${error.message}`);
  }
};

export const uploadComplaintAudio = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-complaint-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
};

export const uploadComplaintReport = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-complaint-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to upload report: ${error.message}`);
  }
};

export const createComplaint = async (beneficiaryId, description, audioUrl = null, reportUrl = null) => {
  try {
    const response = await api.post('/create-complaint', null, {
      params: {
        beneficiary_id: beneficiaryId,
        description: description,
        audio_url: audioUrl,
        report_url: reportUrl,
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create complaint: ${error.message}`);
  }
};

export const downloadComplaintAudio = async (complaintId) => {
  try {
    const response = await api.get(`/api/v1/complaints/${complaintId}/audio`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to download audio: ${error.message}`);
  }
};

// ============================================
// ALERTS API
// ============================================

export const getAlerts = async (severity = null) => {
  try {
    const params = severity ? { severity } : {};
    const response = await api.get('/api/v1/alerts', { params });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }
};

export const getAlert = async (alertId) => {
  try {
    const response = await api.get(`/api/v1/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch alert: ${error.message}`);
  }
};

export const acknowledgeAlert = async (alertId) => {
  try {
    const response = await api.post(`/api/v1/alerts/${alertId}/acknowledge`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to acknowledge alert: ${error.message}`);
  }
};

// ============================================
// BENEFICIARIES API
// ============================================

export const getBeneficiaries = async () => {
  try {
    const response = await api.get('/api/v1/beneficiaries');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch beneficiaries: ${error.message}`);
  }
};

export const getBeneficiary = async (id) => {
  try {
    const response = await api.get(`/api/v1/beneficiaries/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch beneficiary: ${error.message}`);
  }
};

export const createBeneficiary = async (beneficiary) => {
  try {
    const response = await api.post('/api/v1/beneficiaries', beneficiary);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create beneficiary: ${error.message}`);
  }
};

export const getRiskAssessment = async (id) => {
  try {
    const response = await api.get(`/api/v1/beneficiaries/${id}/risk`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch risk assessment: ${error.message}`);
  }
};

export const getFraudNetwork = async (id, depth = 2) => {
  try {
    const response = await api.get(`/api/v1/beneficiaries/${id}/network`, {
      params: { depth },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch fraud network: ${error.message}`);
  }
};

// ============================================
// ANALYTICS API
// ============================================

export const getDistrictRisk = async () => {
  try {
    const response = await api.get('/api/v1/analytics/district-risk');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch district risk: ${error.message}`);
  }
};

export const getFraudNetworks = async () => {
  try {
    const response = await api.get('/api/v1/analytics/fraud-networks');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch fraud networks: ${error.message}`);
  }
};

export const getSummary = async () => {
  try {
    const response = await api.get('/api/v1/analytics/summary');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch summary: ${error.message}`);
  }
};

export const getTrends = async () => {
  try {
    const response = await api.get('/api/v1/analytics/trends');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch trends: ${error.message}`);
  }
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

// ============================================
// EXPORT DEFAULT API INSTANCE
// ============================================

export default api;
