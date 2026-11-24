import { create } from 'zustand';
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

export const useAuthStore = create((set) => ({
  usuario: null,
  token: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (token && usuario) {
      set({ token, usuario: JSON.parse(usuario), isAuthenticated: true });
    }
  },

  register: async (nombre, correo, contraseña, rol = 'administracion') => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/register', {
        nombre, correo, contraseña, rol,
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error en registro';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  login: async (correo, contraseña) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/login', {
        correo, contraseña,
      });

      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      set({
        token, usuario, isAuthenticated: true, loading: false, error: null,
      });

      return { token, usuario };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error en login';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({
      usuario: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  changePassword: async (contraseñaActual, contraseñaNueva) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/auth/change-password', {
        contraseñaActual, contraseñaNueva,
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al cambiar contraseña';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      set({ token, usuario });
      return { token, usuario };
    } catch (error) {
      set({ isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      throw error;
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  return {
    usuario: store.usuario,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    register: store.register,
    login: store.login,
    logout: store.logout,
    changePassword: store.changePassword,
    refreshToken: store.refreshToken,
    initialize: store.initialize,
  };
};
