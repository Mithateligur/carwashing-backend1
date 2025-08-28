import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
};

// Jobs API
export const jobsAPI = {
  getAll: () => api.get('/api/jobs'),
  create: (data: any) => api.post('/api/jobs', data),
  getById: (id: string) => api.get(`/api/jobs/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/api/jobs/${id}/status`, { status }),
  sendWhatsApp: (id: string, message?: string) => api.post(`/api/jobs/${id}/whatsapp`, { message }),
  getStats: () => api.get('/api/jobs/stats/overview'),
};

// Services API (for customer booking)
export const servicesAPI = {
  getAll: () => api.get('/api/services'),
};

// Legacy API functions for backward compatibility
export const getServices = () => api.get('/api/services');
export const login = (credentials: any) => api.post('/api/auth/login', credentials);
export const register = (userData: any) => api.post('/api/auth/register', userData);
export const createBooking = (bookingData: any) => api.post('/api/bookings', bookingData);

export default api;
