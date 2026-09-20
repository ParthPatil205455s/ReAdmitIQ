import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach real JWT token
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('readmitiq-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor — handle 401 and token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('readmitiq-refresh-token');
        if (refreshToken) {
          const { data } = await axios.post(
            `${client.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
          );
          localStorage.setItem('readmitiq-token', data.access_token);
          localStorage.setItem('readmitiq-refresh-token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return client(original);
        }
      } catch {
        // refresh failed — force logout
      }
      localStorage.removeItem('readmitiq-token');
      localStorage.removeItem('readmitiq-refresh-token');
      localStorage.removeItem('readmitiq-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
