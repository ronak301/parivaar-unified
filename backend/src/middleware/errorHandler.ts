import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof Error && err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation error', details: err.message });
    return;
  }

  if (err instanceof Error && err.name === 'CastError') {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
