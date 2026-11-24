import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const gastosApi = {
  getAll: (filtros) => axiosInstance.get('/gastos', { params: filtros }),
  getById: (id) => axiosInstance.get(`/gastos/${id}`),
  create: (data) => axiosInstance.post('/gastos', data),
  update: (id, data) => axiosInstance.put(`/gastos/${id}`, data),
  delete: (id) => axiosInstance.delete(`/gastos/${id}`),
  aprobar: (id) => axiosInstance.post(`/gastos/${id}/aprobar`),
  rechazar: (id) => axiosInstance.post(`/gastos/${id}/rechazar`),
  getCategorias: () => axiosInstance.get('/gastos/categorias/list'),
};
