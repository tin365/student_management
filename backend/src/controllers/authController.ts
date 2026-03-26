import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import Schedule from '../models/Schedule.js';
import StudySession from '../models/StudySession.js';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user
    const isFirstUser = (await User.countDocuments({})) === 0;

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : 'user',
    });

    if (user) {
      // If admin, claim all data that doesn't have a user assigned yet
      if (isFirstUser) {
        const userId = user._id;
        await Promise.all([
          Expense.updateMany({ user: { $exists: false } }, { user: userId }),
          Goal.updateMany({ user: { $exists: false } }, { user: userId }),
          Schedule.updateMany({ user: { $exists: false } }, { user: userId }),
          StudySession.updateMany({ user: { $exists: false } }, { user: userId }),
        ]);
        console.log(`First user ${email} registered as admin and claimed all orphaned data.`);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as string),
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as string),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
