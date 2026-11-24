import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ingresosApi = {
  getAll: (filtros) => axiosInstance.get('/ingresos', { params: filtros }),
  getById: (id) => axiosInstance.get(`/ingresos/${id}`),
  create: (data) => axiosInstance.post('/ingresos', data),
  update: (id, data) => axiosInstance.put(`/ingresos/${id}`, data),
  delete: (id) => axiosInstance.delete(`/ingresos/${id}`),
  getClientes: () => axiosInstance.get('/ingresos/clientes/list'),
};
