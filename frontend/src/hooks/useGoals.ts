import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { goalService } from '../services/goalService';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalService.getAll();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addGoal = async (goal: Goal) => {
    try {
      const newGoal = await goalService.create(goal);
      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      setError('Failed to add goal');
      throw err;
    }
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    try {
      const updated = await goalService.update(id, { progress });
      setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError('Failed to update goal');
      throw err;
    }
  };

  const removeGoal = async (id: string) => {
    try {
      await goalService.delete(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError('Failed to delete goal');
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { goals, loading, error, refresh: fetchGoals, addGoal, updateGoalProgress, removeGoal };
};
