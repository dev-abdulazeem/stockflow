import axios from 'axios';

// Detect environment — use localhost in dev, deployed URL in production
const baseURL =
  import.meta.env.DEV || window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : 'https://stockflo-ochre.vercel.app/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;