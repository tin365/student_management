import { Request, Response } from 'express';
import Goal from '../models/Goal.js';

export const getGoals = async (req: any, res: Response) => {
  try {
    const goals = await Goal.find({}).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createGoal = async (req: any, res: Response) => {
  try {
    const newGoal = new Goal({ ...req.body });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateGoal = async (req: any, res: Response) => {
  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedGoal) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteGoal = async (req: any, res: Response) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id });
    if (!deletedGoal) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
