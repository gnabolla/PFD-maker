import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};
