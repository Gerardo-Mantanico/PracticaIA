import api from './api.service';

export const createCrudService = (endpoint) => ({
  getAll: async (params = {}) => {
    return await api.get(endpoint, { params });
  },

  get: async (id) => {
    return await api.get(`${endpoint}/${id}`);
  },

  create: async (data) => {
    return await api.post(endpoint, data);
  },

  update: async (id, data) => {
    return await api.patch(`${endpoint}/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`${endpoint}/${id}`);
  },
});
