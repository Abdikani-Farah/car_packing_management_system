import { request } from './apiClient.js';

export const vehicleService = {
  getAll: () => request('/vehicles'),
  getById: (id) => request(`/vehicles/${id}`),
  create: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
};
