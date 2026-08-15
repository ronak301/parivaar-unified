import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, type IUser } from '../models';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Dev mode: bypass auth and create a dev super_admin user
  if (env.NODE_ENV === 'development') {
    const devUser = {
      _id: 'dev-admin-id',
      phone: '0000000000',
      role: 'super_admin',
    } as unknown as IUser;
    req.user = devUser;
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(payload.userId).select('-__v');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
