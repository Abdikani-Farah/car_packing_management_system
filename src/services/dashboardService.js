import { request } from './apiClient.js';

export const dashboardService = {
  getStats: () => request('/dashboard'),
};
