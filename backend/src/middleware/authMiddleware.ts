import { Response, NextFunction } from 'express';
import User from '../models/User.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
  next();
};

export const admin = (req: any, res: Response, next: NextFunction) => {
  next();
};
