
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Check backend connection
export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Fetch all available regions
export const getRegions = async () => {
  const response = await api.get('/regions');
  return response.data;
};

// Fetch individual region details
export const getRegion = async (regionId) => {
  const response = await api.get(`/regions/${regionId}`);
  return response.data;
};

// Fetch water-risk data for a region
export const getWaterRisk = async (regionId) => {
  const response = await api.get(`/water-risk/${regionId}`);
  return response.data;
};

export default api;
