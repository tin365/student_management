import { useState, useEffect, useCallback } from 'react';
import { StudySession } from '../types';
import { studySessionService } from '../services/studySessionService';

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studySessionService.getAll();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch study sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSession = async (session: StudySession) => {
    try {
      const newSession = await studySessionService.create(session);
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      setError('Failed to add study session');
      throw err;
    }
  };

  const removeSession = async (id: string) => {
    try {
      await studySessionService.delete(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError('Failed to delete study session');
      throw err;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refresh: fetchSessions, addSession, removeSession };
};
