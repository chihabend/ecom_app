import axios from 'axios';

// Normalize baseURL to avoid Mixed Content and missing /api in prod
const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
let normalizedBase = rawBase;

// On Vercel domains, force proxy via /api to avoid Mixed Content regardless of env
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (window.location.protocol === 'https:' && /vercel\.app$/.test(host)) {
    normalizedBase = '/api';
  }
}
if (normalizedBase.startsWith('http://')) {
  normalizedBase = 'https://' + normalizedBase.slice(7);
}
if (normalizedBase.startsWith('https://') && !/\/api(\/|$)/.test(normalizedBase)) {
  normalizedBase = normalizedBase.replace(/\/$/, '') + '/api';
}

const API = axios.create({
  baseURL: normalizedBase,
  withCredentials: true
});

// add token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global error handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await API.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data?.token;
        const user = res.data?.user;
        if (newToken) {
          localStorage.setItem('token', newToken);
          if (user) localStorage.setItem('user', JSON.stringify(user));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (e) {
        // fallthrough to logout
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
