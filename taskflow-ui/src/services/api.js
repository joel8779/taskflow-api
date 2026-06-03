import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ── Tasks ─────────────────────────────────────────────
export const tasksApi = {
  getAll:       (params) => api.get('/tasks', { params }),
  getById:      (id)     => api.get(`/tasks/${id}`),
  create:       (data)   => api.post('/tasks', data),
  update:       (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  delete:       (id)     => api.delete(`/tasks/${id}`),
  getDashboard: ()       => api.get('/tasks/dashboard/stats'),
};

// ── Comments ──────────────────────────────────────────
export const commentsApi = {
  getAll: (taskId, params) => api.get(`/tasks/${taskId}/comments`, { params }),
  add:    (taskId, data)   => api.post(`/tasks/${taskId}/comments`, data),
  delete: (commentId)      => api.delete(`/tasks/comments/${commentId}`),
};

// ── History ───────────────────────────────────────────
export const historyApi = {
  get: (taskId) => api.get(`/tasks/${taskId}/history`),
};

// ── Users ─────────────────────────────────────────────
export const usersApi = {
  getAll:     ()             => api.get('/users'),
  getMe:      ()             => api.get('/users/me'),
  getById:    (id)           => api.get(`/users/${id}`),
  updateRole: (id, role)     => api.patch(`/users/${id}/role?role=${role}`),
  deactivate: (id)           => api.patch(`/users/${id}/deactivate`),
};

export default api;
