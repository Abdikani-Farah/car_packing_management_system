import { request } from './apiClient.js';

export const parkingSpaceService = {
  getAll: () => request('/parking-spaces'),
  getById: (id) => request(`/parking-spaces/${id}`),
  create: (data) => request('/parking-spaces', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/parking-spaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/parking-spaces/${id}`, { method: 'DELETE' }),
};
