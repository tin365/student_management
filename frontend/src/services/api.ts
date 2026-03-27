import axios from 'axios';

// Ensure the URL always ends with /api even if configured without it
const getBaseUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
