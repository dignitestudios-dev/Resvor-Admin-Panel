import axios from 'axios';
import { store } from '@/lib/store';
import { logout } from '@/lib/slices/authSlice';

export const BASE_URL = 'https://api-dev.resvor.com';

// Create an Axios instance
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor — attach Bearer token
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('resvor_admin_token');
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('resvor_admin_token');
        store.dispatch(logout());
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
