import type { Response, NextFunction } from 'express';

export const protect = async (req: any, res: Response, next: NextFunction) => {
  next();
};

export const admin = (req: any, res: Response, next: NextFunction) => {
  next();
};
