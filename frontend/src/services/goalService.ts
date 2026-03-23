import api from './api';
import { Goal } from '../types';

export const goalService = {
  getAll: async () => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },
  create: async (data: Goal) => {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Goal>) => {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/goals/${id}`);
  },
};
