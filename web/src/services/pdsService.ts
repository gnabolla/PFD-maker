import api from './api';

export const pdsService = {
  async getAll() {
    const response = await api.get('/pds');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/pds/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/pds', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/pds/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/pds/${id}`);
    return response.data;
  },

  async validate(id: string) {
    const response = await api.post(`/pds/${id}/validate`);
    return response.data;
  },

  async exportExcel(id: string) {
    const response = await api.get(`/export/pds/${id}/excel`, {
      responseType: 'blob',
    });
    return response;
  },

  async exportWord(id: string) {
    const response = await api.get(`/export/pds/${id}/word`, {
      responseType: 'blob',
    });
    return response;
  },

  async exportPdf(id: string) {
    const response = await api.get(`/export/pds/${id}/pdf`, {
      responseType: 'blob',
    });
    return response;
  },
};
