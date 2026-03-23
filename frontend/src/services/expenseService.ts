import api from './api';
import { Expense } from '../types';

export const expenseService = {
  getAll: async () => {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },
  create: async (data: Expense) => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Expense>) => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/expenses/${id}`);
  },
};
