import jwt from 'jsonwebtoken';
import type { Response, NextFunction, Request } from 'express';

interface JwtPayloadShape {
  id?: string;
  sub?: string;
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayloadShape;
    const id = decoded.id ?? decoded.sub;
    if (!id || typeof id !== 'string') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    req.user = { id };
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  next();
};
