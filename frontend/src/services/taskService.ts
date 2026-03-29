import api from './api';
import { Task } from '../types';

export const taskService = {
  getAll: async () => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },
  create: async (data: Partial<Task>) => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};
