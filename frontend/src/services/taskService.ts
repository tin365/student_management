import api from './api';
import { Task } from '../types';

export const taskService = {
  getAllForGoal: async (goalId: string) => {
    const response = await api.get<Task[]>(`/tasks/${goalId}`);
    return response.data;
  },
  create: async (goalId: string, data: Partial<Task>) => {
    const response = await api.post<Task>(`/tasks/${goalId}`, data);
    return response.data;
  },
  update: async (id: string, data: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/task/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/tasks/task/${id}`);
  },
};