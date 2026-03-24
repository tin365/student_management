import { Request, Response } from 'express';
import Schedule from '../models/Schedule.js';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find().sort({ startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const newSchedule = new Schedule(req.body);
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSchedule) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
