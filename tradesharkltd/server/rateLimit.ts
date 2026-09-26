import type { Request, Response, NextFunction } from 'express';

const buckets = new Map<string, { count: number; reset: number }>();

/** Minimal in-memory rate limiter (per IP + key). */
export const rateLimit = (key: string, max: number, windowSec: number) =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const b = buckets.get(id);
    if (!b || b.reset < now) {
      buckets.set(id, { count: 1, reset: now + windowSec * 1000 });
      return next();
    }
    b.count++;
    if (b.count > max) {
      res.setHeader('Retry-After', Math.ceil((b.reset - now) / 1000));
      return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    next();
  };

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}, 60000).unref();
