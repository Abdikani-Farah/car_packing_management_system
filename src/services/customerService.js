import { request } from './apiClient.js';

export const customerService = {
  getAll: () => request('/customers'),
  getById: (id) => request(`/customers/${id}`),
  create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
};
