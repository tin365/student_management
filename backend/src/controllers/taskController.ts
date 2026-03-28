import { Request, Response } from 'express';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import { recalcGoalProgress } from './goalController.js';

export const getTasks = async (req: any, res: Response) => {
  try {
    const goalId = req.params.goalId;
    const tasks = await Task.find({ goal: goalId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createTask = async (req: any, res: Response) => {
  try {
    const { goalId } = req.params;
    const { title, status = 'not_started', dueDate = null } = req.body;

    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const newTask = new Task({
      goal: goalId,
      title,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const savedTask = await newTask.save();

    goal.tasks = [...(goal.tasks || []), savedTask._id];
    await goal.save();

    await recalcGoalProgress(goalId);

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updates: any = { ...req.body };
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const updatedTask = await Task.findOneAndUpdate({ _id: req.params.id }, updates, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    await recalcGoalProgress(String(updatedTask.goal));
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Goal.findByIdAndUpdate(task.goal, { $pull: { tasks: task._id } });
    await recalcGoalProgress(String(task.goal));

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};