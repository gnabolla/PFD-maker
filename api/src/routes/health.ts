import { Router, Request, Response } from 'express';
import { db } from '@/database/connection';
import { getRedisClient } from '@/database/redis';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: healthy
 *                     redis:
 *                       type: string
 *                       example: healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown'
      }
    };

    // Check database connection
    try {
      await db.raw('SELECT 1');
      healthCheck.services.database = 'healthy';
    } catch (error) {
      healthCheck.services.database = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis connection
    try {
      const redisClient = getRedisClient();
      await redisClient.ping();
      healthCheck.services.redis = 'healthy';
    } catch (error) {
      healthCheck.services.redis = 'unhealthy';
      logger.error('Redis health check failed:', error);
    }

    // Determine overall health
    const isHealthy = healthCheck.services.database === 'healthy' && 
                     healthCheck.services.redis === 'healthy';

    if (!isHealthy) {
      healthCheck.status = 'unhealthy';
      return res.status(503).json(healthCheck);
    }

    res.json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are available
    await db.raw('SELECT 1');
    const redisClient = getRedisClient();
    await redisClient.ping();
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies not available'
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;