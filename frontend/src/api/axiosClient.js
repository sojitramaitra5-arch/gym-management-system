import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/gym-management-system/backend';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token to outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic JSON unpack & 401 handling
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('gymflow_token');
      localStorage.removeItem('gymflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
