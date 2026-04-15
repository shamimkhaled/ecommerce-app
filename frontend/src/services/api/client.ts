import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const publicApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

function getAccess() {
  return localStorage.getItem('access_token');
}

function getRefresh() {
  return localStorage.getItem('refresh_token');
}

api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const cartToken = localStorage.getItem('cart_token');
  if (cartToken && !token) {
    config.headers['X-Cart-Token'] = cartToken;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const ct = res.headers['x-cart-token'];
    if (ct) {
      localStorage.setItem('cart_token', ct);
    }
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register') &&
      getRefresh()
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post<{ access: string }>(`${baseURL}/auth/token/refresh/`, {
          refresh: getRefresh(),
        });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);
