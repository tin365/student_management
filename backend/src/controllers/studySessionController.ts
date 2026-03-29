import type { Request, Response } from 'express';
import StudySession from '../models/StudySession.js';

export const getStudySessions = async (req: any, res: Response) => {
  try {
    const sessions = await StudySession.find({}).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const createStudySession = async (req: any, res: Response) => {
  try {
    const newSession = new StudySession({ ...req.body });
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const updateStudySession = async (req: any, res: Response) => {
  try {
    const updatedSession = await StudySession.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedSession) return res.status(404).json({ message: 'Not Found' });
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const deleteStudySession = async (req: any, res: Response) => {
  try {
    const deletedSession = await StudySession.findOneAndDelete({ _id: req.params.id });
    if (!deletedSession) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Study Session deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
