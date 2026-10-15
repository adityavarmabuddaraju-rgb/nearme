import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Attach JWT token from localStorage to every request if present
// Skip guest tokens — they aren't real JWTs and cause 401 errors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nearbyai_token');
    if (token && !token.startsWith('guest_token_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
