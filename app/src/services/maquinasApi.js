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

export const maquinasApi = {
  getAll: () => axiosInstance.get('/maquinas'),
  getById: (id) => axiosInstance.get(`/maquinas/${id}`),
  create: (data) => axiosInstance.post('/maquinas', data),
  update: (id, data) => axiosInstance.put(`/maquinas/${id}`, data),
  delete: (id) => axiosInstance.delete(`/maquinas/${id}`),
};
