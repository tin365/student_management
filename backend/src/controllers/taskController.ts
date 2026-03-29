import type { Request, Response } from 'express';
import Task from '../models/Task.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, status = 'not_started', dueDate = null } = req.body;

    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const newTask = new Task({
      userId,
      title,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updates: Record<string, unknown> = { ...req.body };
    delete updates.userId;
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate as string);

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
