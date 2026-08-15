import { request } from './apiClient.js';

export const pricingService = {
  getAll: () => request('/pricing'),
  update: (id, data) => request(`/pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
