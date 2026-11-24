import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const axiosInstance = axios.create({ baseURL: API_URL });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const asignacionesApi = {
  getAll: (filtros) => axiosInstance.get('/asignaciones', { params: filtros }),
  getById: (id) => axiosInstance.get(`/asignaciones/${id}`),
  create: (data) => axiosInstance.post('/asignaciones', data),
  update: (id, data) => axiosInstance.put(`/asignaciones/${id}`, data),
  finalizar: (id, fecha_fin) => axiosInstance.post(`/asignaciones/${id}/finalizar`, { fecha_fin }),
  getActiva: (maquina_id) => axiosInstance.get(`/asignaciones/maquina/${maquina_id}/activa`),
  getHistorico: (maquina_id) => axiosInstance.get(`/asignaciones/maquina/${maquina_id}/historico`),
};
