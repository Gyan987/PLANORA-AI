import { NextFunction, Request, Response } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries periodically without keeping process alive
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  if (timer.unref) {
    timer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // Bypass in test environment to avoid interfering with automated tests
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = store.get(ip);
    if (!record) {
      record = { timestamps: [] };
      store.set(ip, record);
    }

    // Retain only requests within the sliding window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: 'Too Many Requests',
        message
      });
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length).toString());
    next();
  };
}
