/**
 * Request middleware for tracking and enhancing HTTP requests
 * Adds request ID, timing, and logging capabilities
 */

import { Logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add unique request ID to each request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 * @param {Function} next - Express next function
 */
export const addRequestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Middleware to track request timing and log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  Logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log completed request
    Logger.request(req, res, duration);
    
    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Middleware to parse and validate request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const parseHeaders = (req, res, next) => {
  // Add parsed headers for easier access
  req.parsedHeaders = {
    contentType: req.get('Content-Type'),
    userAgent: req.get('User-Agent'),
    acceptLanguage: req.get('Accept-Language'),
    authorization: req.get('Authorization') ? 'present' : 'missing'
  };
  
  next();
};

/**
 * Middleware to add CORS headers
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const corsHeaders = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}; 