import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  getUsers: async () => {
    return apiClient.get('/auth/users');
  },

  createUser: async (userData) => {
    return apiClient.post('/auth/users', userData);
  },

  updateUserRole: async (id, data) => {
    return apiClient.put(`/auth/users/${id}/role`, data);
  },

  deleteUser: async (id) => {
    return apiClient.delete(`/auth/users/${id}`);
  },
};

export default authService;
