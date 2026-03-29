import type { Request, Response } from 'express';
import Task from '../models/Task.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, status = 'not_started', dueDate = null } = req.body;

    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const newTask = new Task({
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
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updates: any = { ...req.body };
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const updatedTask = await Task.findOneAndUpdate({ _id: req.params.id }, updates, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
