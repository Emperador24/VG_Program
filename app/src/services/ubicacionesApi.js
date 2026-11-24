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

export const ubicacionesApi = {
  getAll: () => axiosInstance.get('/ubicaciones'),
  getById: (id) => axiosInstance.get(`/ubicaciones/${id}`),
  create: (data) => axiosInstance.post('/ubicaciones', data),
  update: (id, data) => axiosInstance.put(`/ubicaciones/${id}`, data),
  delete: (id) => axiosInstance.delete(`/ubicaciones/${id}`),
};
