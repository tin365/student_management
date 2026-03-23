import { useState, useEffect, useCallback } from 'react';
import { Schedule } from '../types';
import { scheduleService } from '../services/scheduleService';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAll();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSchedule = async (schedule: Schedule) => {
    try {
      const newSchedule = await scheduleService.create(schedule);
      setSchedules((prev) => [...prev, newSchedule].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));
      return newSchedule;
    } catch (err) {
      setError('Failed to add schedule');
      throw err;
    }
  };

  const removeSchedule = async (id: string) => {
    try {
      await scheduleService.delete(id);
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError('Failed to delete schedule');
      throw err;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { schedules, loading, error, refresh: fetchSchedules, addSchedule, removeSchedule };
};
