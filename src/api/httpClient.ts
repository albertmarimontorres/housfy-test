import axios from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';

const http = axios.create({
  baseURL: import.meta.env.VITE_HOUSFY_BASE_URL,
  timeout: 8000,
  withCredentials: false, // No usamos cookies
});

http.interceptors.request.use(
  config => {
    const token = tokenStorage.get();

    // Asegurar que headers existe
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Identificador para la prueba
    config.headers['x-housfy-authorization'] = import.meta.env.VITE_HOUSFY_ID;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

http.interceptors.response.use(
  response => response,
  async error => {
    // Token expirado → logout automático
    if (error?.response?.status === 401) {
      tokenStorage.clear();
      const current = window.location.pathname;
      if (current !== '/login' && current !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;
