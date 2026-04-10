import api from './api.service';

const ENDPOINT_BASE = '/configuracion-sistema';

export const configuracionSistemaApi = {
  getConfiguracion: async () => {
    return api.get(ENDPOINT_BASE);
  },

  updateConfiguracion: async (id, data) => {
    return api.put(`${ENDPOINT_BASE}/${id}`, data);
  },
};

export default configuracionSistemaApi;