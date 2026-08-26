import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

const hits = new Map<string, { count: number; resetAt: number }>();

// Simple in-memory fixed-window rate limiter. Good enough for a single-instance
// backend to blunt abuse of a public, unauthenticated endpoint; not distributed.
export function rateLimit({ windowMs, max, keyPrefix }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    entry.count += 1;
    next();
  };
}
