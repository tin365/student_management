import { Request, Response } from 'express';
import Expense from '../models/Expense.js';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExpense) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
