import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state and redirect to login
      store.dispatch(logout());
      window.location.href = '/login';
    }

    // Extract error message
    const message =
      error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default api;
