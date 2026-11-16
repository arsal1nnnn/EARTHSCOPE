
const API_BASE_URL = import.meta.env.PROD
  ? 'https://earthscope-api.onrender.com/api'
  : '/api';

export default API_BASE_URL;
