import { Request, Response } from 'express';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';

const calculateProgressFromTasks = async (goalId: string) => {
  const tasks = await Task.find({ goal: goalId });
  if (!tasks.length) return { progress: 0, status: 'active', completedAt: null };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  if (progress >= 100) {
    return { progress: 100, status: 'completed', completedAt: new Date() };
  }
  return { progress, status: 'active', completedAt: null };
};

export const recalcGoalProgress = async (goalId: string) => {
  const goal = await Goal.findById(goalId);
  if (!goal) return null;

  const { progress, status, completedAt } = await calculateProgressFromTasks(goalId);
  goal.progress = progress;
  goal.status = status as 'active' | 'completed';
  goal.completedAt = completedAt;
  await goal.save();
  return goal;
};

export const getGoals = async (req: any, res: Response) => {
  try {
    const goals = await Goal.find({}).populate('tasks').sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createGoal = async (req: any, res: Response) => {
  try {
    const { title, category = 'other', deadline = null, priority = 'medium', description = '' } = req.body;
    if (!title) return res.status(400).json({ message: 'Goal title is required' });

    const newGoal = new Goal({
      title,
      category,
      deadline: deadline ? new Date(deadline) : null,
      priority,
      description,
      progress: 0,
      status: 'active',
      completedAt: null,
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(await savedGoal.populate('tasks'));
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateGoal = async (req: any, res: Response) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Not Found' });

    const updates: any = { ...req.body };

    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    if (updates.progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, Number(updates.progress)));
      if (updates.progress >= 100) {
        updates.status = 'completed';
        updates.completedAt = new Date();
      } else {
        updates.status = 'active';
        updates.completedAt = null;
      }
    }

    const updatedGoal = await Goal.findOneAndUpdate({ _id: req.params.id }, updates, { new: true }).populate('tasks');
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteGoal = async (req: any, res: Response) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id });
    if (!deletedGoal) return res.status(404).json({ message: 'Not Found' });
    await Task.deleteMany({ goal: deletedGoal._id });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
