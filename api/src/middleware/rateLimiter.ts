import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '@/database/redis';

// Define rate limit configurations for different endpoint categories
const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later.',
  },
  // Moderate limits for PDS CRUD operations
  pds: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many PDS requests, please try again later.',
  },
  // Stricter limits for file operations
  fileOps: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many file operation requests, please try again later.',
  },
  // Batch operations have lower limits
  batch: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: 'Too many batch operation requests, please try again later.',
  },
  // General API limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: 'Too many requests, please try again later.',
  },
};

// Create rate limiter with Redis store and user-based key generation
const createRateLimiter = (config: typeof rateLimitConfigs[keyof typeof rateLimitConfigs]) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    }),
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: Request) => {
      // Use authenticated user ID if available, otherwise use IP
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: config.message,
        retryAfter: Math.round(config.windowMs / 1000),
      });
    },
    // Add rate limit headers to all responses
    skip: () => false,
  });
};

// Export specific rate limiters for different endpoint categories
export const authRateLimiter = createRateLimiter(rateLimitConfigs.auth);
export const pdsRateLimiter = createRateLimiter(rateLimitConfigs.pds);
export const fileOpsRateLimiter = createRateLimiter(rateLimitConfigs.fileOps);
export const batchRateLimiter = createRateLimiter(rateLimitConfigs.batch);
export const generalRateLimiter = createRateLimiter(rateLimitConfigs.general);

// Middleware to add custom rate limit headers
export const addRateLimitHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add custom headers to track rate limits across different categories
  const userId = (req as any).user?.id;
  const key = userId ? `user:${userId}` : `ip:${req.ip}`;
  
  // Set custom headers for rate limit visibility
  res.setHeader('X-RateLimit-Category', req.path.includes('/auth') ? 'auth' : 
                                       req.path.includes('/batch') ? 'batch' :
                                       req.path.includes('/export') || req.path.includes('/import') ? 'fileOps' :
                                       req.path.includes('/pds') ? 'pds' : 'general');
  res.setHeader('X-RateLimit-UserKey', key);
  
  next();
};

// Dynamic rate limiter that can be configured per route
export const createDynamicRateLimiter = (maxRequests: number, windowMinutes: number = 15) => {
  return createRateLimiter({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: `Too many requests, please try again later. Limit: ${maxRequests} per ${windowMinutes} minutes.`,
  });
};