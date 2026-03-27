import { Request, Response } from 'express';
import Expense from '../models/Expense.js';

export const getExpenses = async (req: any, res: Response) => {
  try {
    const expenses = await Expense.find({}).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createExpense = async (req: any, res: Response) => {
  try {
    const { amount, category, note, date, monthlyBudget } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than 0' });
    }

    const expenseDate = date ? new Date(date) : new Date();
    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const parsedMonthlyBudget = Number(monthlyBudget);
    if (Number.isFinite(parsedMonthlyBudget) && parsedMonthlyBudget > 0) {
      const monthStart = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
      const monthEnd = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1);

      const currentMonthTotal = await Expense.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lt: monthEnd },
            currency: 'RM',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const existingTotal = currentMonthTotal[0]?.total ?? 0;
      if (existingTotal + parsedAmount > parsedMonthlyBudget) {
        return res.status(409).json({
          message: 'Monthly budget exceeded',
          details: {
            monthlyBudget: parsedMonthlyBudget,
            currentMonthTotal: existingTotal,
            attemptedTotal: existingTotal + parsedAmount,
          },
        });
      }
    }

    const newExpense = new Expense({
      amount: parsedAmount,
      currency: 'RM',
      category,
      note,
      date: expenseDate,
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateExpense = async (req: any, res: Response) => {
  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedExpense) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteExpense = async (req: any, res: Response) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({ _id: req.params.id });
    if (!deletedExpense) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
