import { useState, useEffect, useCallback } from 'react';
import { CreateExpenseInput, Expense } from '../types';
import { expenseService } from '../services/expenseService';

type ExpenseStoreState = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
};

const DEFAULT_CURRENCY = 'RM';
const expenseListeners = new Set<(state: ExpenseStoreState) => void>();

let expenseStore: ExpenseStoreState = {
  expenses: [],
  loading: true,
  error: null,
};
let hasLoadedExpenses = false;
let inFlightFetch: Promise<void> | null = null;
let hasNormalizedMissingCurrency = false;

const emitExpenseStore = () => {
  expenseListeners.forEach((listener) => listener(expenseStore));
};

const setExpenseStore = (next: Partial<ExpenseStoreState>) => {
  expenseStore = {
    ...expenseStore,
    ...next,
  };
  emitExpenseStore();
};

const hasMissingCurrency = (expense: Expense) => !expense.currency || !expense.currency.trim();

const normalizeMissingCurrencyRecords = async (rawExpenses: Expense[]): Promise<Expense[]> => {
  const missing = rawExpenses.filter((expense) => hasMissingCurrency(expense) && expense._id);
  if (missing.length === 0) {
    hasNormalizedMissingCurrency = true;
    return rawExpenses;
  }

  const updates = await Promise.allSettled(
    missing.map((expense) =>
      expenseService.update(expense._id!, { currency: DEFAULT_CURRENCY })
    )
  );

  const successfulUpdates = updates
    .filter((result): result is PromiseFulfilledResult<Expense> => result.status === 'fulfilled')
    .map((result) => result.value);

  const normalizedMap = new Map(successfulUpdates.map((expense) => [expense._id, expense]));
  hasNormalizedMissingCurrency = true;

  return rawExpenses.map((expense) => {
    if (!hasMissingCurrency(expense)) {
      return expense;
    }
    const updated = expense._id ? normalizedMap.get(expense._id) : undefined;
    if (updated) {
      return updated;
    }
    return { ...expense, currency: DEFAULT_CURRENCY };
  });
};

const fetchExpensesInternal = async () => {
  if (inFlightFetch) {
    return inFlightFetch;
  }

  inFlightFetch = (async () => {
    setExpenseStore({ loading: true });
    try {
      const data = await expenseService.getAll();
      const normalized = hasNormalizedMissingCurrency ? data : await normalizeMissingCurrencyRecords(data);
      setExpenseStore({ expenses: normalized, error: null });
      hasLoadedExpenses = true;
    } catch (err) {
      setExpenseStore({ error: 'Failed to fetch expenses' });
      console.error(err);
    } finally {
      setExpenseStore({ loading: false });
      inFlightFetch = null;
    }
  })();

  return inFlightFetch;
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(expenseStore.expenses);
  const [loading, setLoading] = useState<boolean>(expenseStore.loading);
  const [error, setError] = useState<string | null>(expenseStore.error);

  useEffect(() => {
    const listener = (state: ExpenseStoreState) => {
      setExpenses(state.expenses);
      setLoading(state.loading);
      setError(state.error);
    };
    expenseListeners.add(listener);
    listener(expenseStore);
    return () => {
      expenseListeners.delete(listener);
    };
  }, []);

  const fetchExpenses = useCallback(async () => {
    await fetchExpensesInternal();
  }, []);

  const addExpense = useCallback(async (expense: CreateExpenseInput) => {
    try {
      const newExpense = await expenseService.create(expense);
      setExpenseStore({ expenses: [newExpense, ...expenseStore.expenses], error: null });
      return newExpense;
    } catch (err) {
      setExpenseStore({ error: 'Failed to add expense' });
      throw err;
    }
  }, []);

  const removeExpense = useCallback(async (id: string) => {
    try {
      await expenseService.delete(id);
      setExpenseStore({ expenses: expenseStore.expenses.filter((e) => e._id !== id), error: null });
    } catch (err) {
      setExpenseStore({ error: 'Failed to delete expense' });
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedExpenses) {
      fetchExpensesInternal();
    }
  }, []);

  return { expenses, loading, error, refresh: fetchExpenses, addExpense, removeExpense };
};
