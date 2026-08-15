import { request } from './apiClient.js';

export const paymentService = {
  getAll: () => request('/payments'),
  getById: (id) => request(`/payments/${id}`),
  create: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
};
