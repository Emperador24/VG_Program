import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const operariosApi = {
  getAll: () => axiosInstance.get('/operarios'),
  getById: (id) => axiosInstance.get(`/operarios/${id}`),
  create: (data) => axiosInstance.post('/operarios', data),
  update: (id, data) => axiosInstance.put(`/operarios/${id}`, data),
  delete: (id) => axiosInstance.delete(`/operarios/${id}`),
};
