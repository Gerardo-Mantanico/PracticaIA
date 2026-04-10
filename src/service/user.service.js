import { createCrudService } from './crud.factory';
import api from './api.service';

const ENDPOINT_BASE = '/users'; 

export const userApi = {
  ...createCrudService(ENDPOINT_BASE),
  
  // Obtener el perfil del usuario actual
  getCurrentUser: async () => {
    const response = await api.get(`${ENDPOINT_BASE}/me`);
    return response;
  }
};

export default userApi;