import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAlerts = async (severity = null) => {
  const params = severity ? { severity } : {};
  const response = await api.get('/alerts', { params });
  return response.data;
};

export const getBeneficiaries = async () => {
  const response = await api.get('/beneficiaries');
  return response.data;
};

export const getBeneficiary = async (id) => {
  const response = await api.get(`/beneficiaries/${id}`);
  return response.data;
};

export const getRiskAssessment = async (id) => {
  const response = await api.get(`/beneficiaries/${id}/risk`);
  return response.data;
};

export const getFraudNetwork = async (id, depth = 2) => {
  const response = await api.get(`/beneficiaries/${id}/network`, { params: { depth } });
  return response.data;
};

export const submitComplaint = async (complaint) => {
  const response = await api.post('/complaints', complaint);
  return response.data;
};

export const getComplaints = async () => {
  const response = await api.get('/complaints');
  return response.data;
};

export const getDistrictRisk = async () => {
  const response = await api.get('/analytics/district-risk');
  return response.data;
};

export const getFraudNetworks = async () => {
  const response = await api.get('/analytics/fraud-networks');
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

export const getTrends = async () => {
  const response = await api.get('/analytics/trends');
  return response.data;
};

export const createBeneficiary = async (beneficiary) => {
  const response = await api.post('/beneficiaries', beneficiary);
  return response.data;
};

export default api;
