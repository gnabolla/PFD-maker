import { logger } from './logger';

export interface Environment {
  NODE_ENV: string;
  API_PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  MAX_FILE_SIZE: string;
  UPLOAD_PATH: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
}

export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate specific environment variables
  if (process.env.NODE_ENV && !['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
    logger.error('NODE_ENV must be one of: development, test, production');
    process.exit(1);
  }

  if (process.env.API_PORT && isNaN(parseInt(process.env.API_PORT))) {
    logger.error('API_PORT must be a valid number');
    process.exit(1);
  }

  if (process.env.RATE_LIMIT_WINDOW && isNaN(parseInt(process.env.RATE_LIMIT_WINDOW))) {
    logger.error('RATE_LIMIT_WINDOW must be a valid number');
    process.exit(1);
  }

  if (process.env.RATE_LIMIT_MAX && isNaN(parseInt(process.env.RATE_LIMIT_MAX))) {
    logger.error('RATE_LIMIT_MAX must be a valid number');
    process.exit(1);
  }

  logger.info('Environment validation passed');
};

export const getEnvironment = (): Environment => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PORT: parseInt(process.env.API_PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10MB',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
});