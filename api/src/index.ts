import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { validateEnvironment } from '@/utils/environment';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/database/connection';
import { connectRedis } from '@/database/redis';
import { addRateLimitHeaders, generalRateLimiter, authRateLimiter, fileOpsRateLimiter } from '@/middleware/rateLimiter';
import { uploadProgressService } from '@/services/uploadProgress';

// Import routes
import healthRoutes from '@/routes/health';
import authRoutes from '@/routes/auth';
import pdsRoutes from '@/routes/pds';
import validationRoutes from '@/routes/validation';
import importRoutes from '@/routes/import';
import exportRoutes from '@/routes/export';
import templateRoutes from '@/routes/templates';
import uploadRoutes from '@/routes/upload';

// Load environment variables
dotenv.config();

// Validate environment
validateEnvironment();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});
const PORT = process.env.API_PORT || 3001;

// Initialize upload progress service with socket.io
uploadProgressService.setSocketServer(io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Add rate limit headers to all responses
app.use(addRateLimitHeaders);

// Apply general rate limiting to all API routes
app.use('/api/', generalRateLimiter);

// General middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PDS Maker API',
      version: '1.0.0',
      description: 'API for Philippine Government PDS processing with automatic formatting correction',
      contact: {
        name: 'PDS Maker Community',
        url: 'https://github.com/your-org/pds-maker',
        email: 'support@pds-maker.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes with specific rate limiters
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/pds', pdsRoutes); // PDS routes have their own rate limiting
app.use('/api/validation', validationRoutes);
app.use('/api/import', fileOpsRateLimiter, importRoutes);
app.use('/api/export', fileOpsRateLimiter, exportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Database connections
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    logger.info('Connected to PostgreSQL database');

    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis cache');

    // Start server with socket.io
    httpServer.listen(PORT, () => {
      logger.info(`🚀 PDS Maker API server running on port ${PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`🔌 Socket.IO server listening for real-time connections`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;