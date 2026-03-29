import type { Request, Response } from 'express';
import Schedule from '../models/Schedule.js';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const schedules = await Schedule.find({ userId }).sort({ startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = { ...req.body };
    delete data.userId;
    const newSchedule = new Schedule({ ...data, userId });
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const body = { ...req.body };
    delete body.userId;
    const updatedSchedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId },
      body,
      { new: true }
    );
    if (!updatedSchedule) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const deletedSchedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedSchedule) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
