import { request } from './apiClient.js';

export const parkingSessionService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/parking-sessions${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/parking-sessions/${id}`),
  registerEntry: (data) => request('/parking-sessions/entry', { method: 'POST', body: JSON.stringify(data) }),
  registerExit: (id, data) => request(`/parking-sessions/${id}/exit`, { method: 'PUT', body: JSON.stringify(data) }),
};
