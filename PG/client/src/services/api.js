import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────
let isRefreshing  = false;
let failedQueue   = [];   // requests queued while refresh is in-flight

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Only try refresh once per request, and only for 401s that are NOT
    // from the auth endpoints themselves (avoids infinite loops).
    const isAuthRoute = original.url?.includes('/auth/');
    if (err.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh settles
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((e) => Promise.reject(e));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token — force logout
        _clearSession();
        return Promise.reject(err);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = data.data;

        localStorage.setItem('accessToken',  newAccess);
        localStorage.setItem('refreshToken', newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        original.headers.Authorization            = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        _clearSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

function _clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export default api;
