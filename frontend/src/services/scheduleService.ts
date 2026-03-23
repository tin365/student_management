import api from './api';
import { Schedule } from '../types';

export const scheduleService = {
  getAll: async () => {
    const response = await api.get<Schedule[]>('/schedules');
    return response.data;
  },
  create: async (data: Schedule) => {
    const response = await api.post<Schedule>('/schedules', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Schedule>) => {
    const response = await api.put<Schedule>(`/schedules/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/schedules/${id}`);
  },
};
