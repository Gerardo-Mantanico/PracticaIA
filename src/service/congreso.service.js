import { createCrudService } from './crud.factory.js';

const ENDPOINT_BASE = '/congresos';
const crud = createCrudService(ENDPOINT_BASE);

export const congresoApi = {
  create: async (data) => {
    return crud.create(data);
  },
  update: async (id, data) => {
    return crud.update(id, data);
  },
  get: async (id) => {
    return crud.get(id);
  },
  getAll: async () => {
    return crud.getAll();
  },
  delete: async (id) => {
    return crud.delete(id);
  }
};
