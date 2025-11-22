import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and log out user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Reload page to show login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password) => {
    console.log('Registering:', { username, email });
    return api.post('/auth/register', { username, email, password });
  },
  login: (email, password) => {
    console.log('Logging in:', { email });
    return api.post('/auth/login', { email, password });
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (username, email) =>
    api.put('/auth/profile', { username, email }),
  deleteAccount: () => api.delete('/auth/account'),
};

export const taskAPI = {
  createTask: (title, description, folderId, priority, dueDate) =>
    api.post('/tasks', {
      title,
      description,
      folderId,
      priority,
      dueDate,
    }),
  getTasks: (folderId) => api.get('/tasks', { params: { folderId } }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const folderAPI = {
  createFolder: (name, color) =>
    api.post('/folders', { name, color }),
  getFolders: () => api.get('/folders'),
  getFolder: (id) => api.get(`/folders/${id}`),
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
  shareFolder: (id, email, accessLevel = 'view') =>
    api.post(`/folders/${id}/share`, { email, accessLevel }),
  getSharedFolders: () => api.get('/folders/shared/all'),
  getSharedFolderDetail: (id) => api.get(`/folders/shared/${id}`),
  removeSharedUser: (folderId, userId) =>
    api.delete(`/folders/${folderId}/share/${userId}`),
};

export default api;
