import api from './api';
import { StudySession } from '../types';

export const studySessionService = {
  getAll: async () => {
    const response = await api.get<StudySession[]>('/study-sessions');
    return response.data;
  },
  create: async (data: StudySession) => {
    const response = await api.post<StudySession>('/study-sessions', data);
    return response.data;
  },
  update: async (id: string, data: Partial<StudySession>) => {
    const response = await api.put<StudySession>(`/study-sessions/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/study-sessions/${id}`);
  },
};
