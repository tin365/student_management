import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import { expenseService } from '../services/expenseService';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = async (expense: Expense) => {
    try {
      const newExpense = await expenseService.create(expense);
      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError('Failed to add expense');
      throw err;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await expenseService.delete(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refresh: fetchExpenses, addExpense, removeExpense };
};
