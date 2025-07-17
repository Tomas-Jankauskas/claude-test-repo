/**
 * Structured logging utility for the Express API
 * Provides consistent logging format across the application
 */

/**
 * Log levels enum
 */
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Create a structured log entry
 * @param {string} level - Log level (error, warn, info, debug)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {Object} Structured log object
 */
export const createLogEntry = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    service: 'claude-test-api',
    environment: process.env.NODE_ENV || 'development'
  };
};

/**
 * Logger class with structured logging methods
 */
export class Logger {
  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  static error(message, meta = {}) {
    const logEntry = createLogEntry(LogLevel.ERROR, message, meta);
    console.error(JSON.stringify(logEntry));
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  static warn(message, meta = {}) {
    const logEntry = createLogEntry(LogLevel.WARN, message, meta);
    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  static info(message, meta = {}) {
    const logEntry = createLogEntry(LogLevel.INFO, message, meta);
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log a debug message (only in development)
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  static debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = createLogEntry(LogLevel.DEBUG, message, meta);
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log HTTP request information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  static request(req, res, duration) {
    const logEntry = createLogEntry(LogLevel.INFO, 'HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    console.log(JSON.stringify(logEntry));
  }
}