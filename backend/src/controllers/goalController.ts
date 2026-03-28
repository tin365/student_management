import { Request, Response } from 'express';
import Goal from '../models/Goal.js';

const normalizeGoalPayload = (goalData: any, existingGoal?: any) => {
  const payload: any = { ...goalData };

  if (payload.progress !== undefined && payload.progress !== null) {
    payload.progress = Math.min(100, Math.max(0, Number(payload.progress)));
    if (payload.progress >= 100) {
      payload.progress = 100;
      payload.status = 'completed';
      payload.completedAt = existingGoal?.completedAt || new Date();
    } else {
      payload.status = 'active';
      payload.completedAt = null;
    }
  }

  if (payload.status === 'completed' && !payload.completedAt) {
    payload.completedAt = existingGoal?.completedAt || new Date();
    payload.progress = Math.max(payload.progress || 0, 100);
  }

  if (payload.status === 'active') {
    payload.completedAt = null;
  }

  return payload;
};

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
    const payload = normalizeGoalPayload(req.body);
    const newGoal = new Goal({ ...payload });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateGoal = async (req: any, res: Response) => {
  try {
    const existingGoal = await Goal.findById(req.params.id);
    if (!existingGoal) return res.status(404).json({ message: 'Not Found' });

    const payload = normalizeGoalPayload(req.body, existingGoal);

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id },
      payload,
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
