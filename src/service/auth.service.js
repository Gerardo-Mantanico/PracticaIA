
import api from './api.service';

const authService = {
  register: async (payload) => {
    return api.post('/auth/register', payload);
  },

  login: async (payload) => {
    return api.post('/auth/login', payload);
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  recoverPassword: async (email) => {
    return api.post('/auth/recover-password', { email });
  },

  verifyCode: async (email, code) => {
    return api.post('/auth/verify-code', { email, code });
  },

  changePassword: async (code, email, newPassword) => {
    return api.post('/auth/change-password', { code, email, newPassword });
  },
};

export default authService;

 
