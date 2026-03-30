import axios from 'axios';

// Ensure the URL always ends with /api even if configured without it
const getBaseUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  let url = explicit || 'http://localhost:5001/api';

  // Helpful in production debugging: Expo web in particular bakes env vars at build time,
  // so this makes it obvious when the build still points at localhost/private network.
  if (!explicit) {
    // eslint-disable-next-line no-console
    console.warn('[api] EXPO_PUBLIC_API_URL is not set; defaulting to localhost:', url);
  }
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
