import axios from 'axios';

// For local development, we use the host's IP for Android/iOS testing
// For production (Vercel/EAS), we'll use an environment variable
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
