import winston from 'winston';
import { getEnvironment } from './environment';

const { combine, timestamp, errors, json, simple, colorize } = winston.format;

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'pds-maker-api' },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      simple()
    )
  }));
}

// Create a stream object with a 'write' function for morgan
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Helper functions for structured logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  });
};

export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(message, data);
};

export const logWarning = (message: string, data?: Record<string, any>) => {
  logger.warn(message, data);
};

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(message, data);
};