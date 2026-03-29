import type { Request, Response } from 'express';
import StudySession from '../models/StudySession.js';

export const getStudySessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessions = await StudySession.find({ userId }).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = { ...req.body };
    delete data.userId;
    const newSession = new StudySession({ ...data, userId });
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const body = { ...req.body };
    delete body.userId;
    const updatedSession = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId },
      body,
      { new: true }
    );
    if (!updatedSession) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteStudySession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const deletedSession = await StudySession.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedSession) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Study Session deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
