/**
 * Input validation middleware for Express API endpoints
 * Provides reusable validation functions and middleware for common validation patterns
 */

import { Logger } from '../utils/logger.js';

/**
 * Validation error class for structured error handling
 */
export class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.statusCode = 400;
  }
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email format
   */
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email.trim());
  },

  /**
   * Validates required string field
   * @param {any} value - Value to validate
   * @param {number} minLength - Minimum length (default: 1)
   * @returns {boolean} True if valid non-empty string
   */
  requiredString: (value, minLength = 1) => {
    return typeof value === 'string' && value.trim().length >= minLength;
  },

  /**
   * Validates numeric value within range
   * @param {any} value - Value to validate
   * @param {number} min - Minimum value (optional)
   * @param {number} max - Maximum value (optional)
   * @returns {boolean} True if valid number within range
   */
  numberInRange: (value, min = null, max = null) => {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  /**
   * Validates array with minimum length
   * @param {any} value - Value to validate
   * @param {number} minLength - Minimum array length (default: 1)
   * @returns {boolean} True if valid array with minimum length
   */
  arrayMinLength: (value, minLength = 1) => {
    return Array.isArray(value) && value.length >= minLength;
  }
};

/**
 * Creates validation middleware for request body
 * @param {Object} schema - Validation schema object
 * @returns {Function} Express middleware function
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const { body } = req;

      // Validate each field in schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];
        
        // Check if field is required
        if (rules.required && (value === undefined || value === null)) {
          errors.push({
            field,
            message: `${field} is required`,
            value: value
          });
          continue;
        }

        // Skip validation if field is not required and not present
        if (!rules.required && (value === undefined || value === null)) {
          continue;
        }

        // Apply validation rules
        if (rules.type === 'email' && !ValidationRules.email(value)) {
          errors.push({
            field,
            message: `${field} must be a valid email address`,
            value: value
          });
        }

        if (rules.type === 'string') {
          const minLength = rules.minLength || 1;
          if (!ValidationRules.requiredString(value, minLength)) {
            errors.push({
              field,
              message: `${field} must be a string with at least ${minLength} characters`,
              value: value
            });
          }
        }

        if (rules.type === 'number') {
          if (!ValidationRules.numberInRange(value, rules.min, rules.max)) {
            let message = `${field} must be a valid number`;
            if (rules.min !== undefined && rules.max !== undefined) {
              message += ` between ${rules.min} and ${rules.max}`;
            } else if (rules.min !== undefined) {
              message += ` greater than or equal to ${rules.min}`;
            } else if (rules.max !== undefined) {
              message += ` less than or equal to ${rules.max}`;
            }
            errors.push({
              field,
              message,
              value: value
            });
          }
        }

        if (rules.type === 'array') {
          const minLength = rules.minLength || 1;
          if (!ValidationRules.arrayMinLength(value, minLength)) {
            errors.push({
              field,
              message: `${field} must be an array with at least ${minLength} items`,
              value: value
            });
          }
        }
      }

      // If validation errors exist, return error response
      if (errors.length > 0) {
        Logger.warn('Request validation failed', {
          url: req.url,
          method: req.method,
          errors: errors,
          body: req.body
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        });
      }

      // Validation passed, continue to next middleware
      next();
    } catch (error) {
      Logger.error('Validation middleware error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
        code: 'VALIDATION_MIDDLEWARE_ERROR'
      });
    }
  };
};

/**
 * Validates query parameters
 * @param {Object} schema - Query parameter validation schema
 * @returns {Function} Express middleware function
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const { query } = req;

      for (const [param, rules] of Object.entries(schema)) {
        const value = query[param];

        if (rules.required && !value) {
          errors.push({
            param,
            message: `Query parameter '${param}' is required`,
            value: value
          });
          continue;
        }

        if (!rules.required && !value) {
          continue;
        }

        if (rules.type === 'number' && !ValidationRules.numberInRange(value, rules.min, rules.max)) {
          errors.push({
            param,
            message: `Query parameter '${param}' must be a valid number`,
            value: value
          });
        }

        if (rules.type === 'string' && !ValidationRules.requiredString(value, rules.minLength)) {
          errors.push({
            param,
            message: `Query parameter '${param}' must be a non-empty string`,
            value: value
          });
        }
      }

      if (errors.length > 0) {
        Logger.warn('Query validation failed', {
          url: req.url,
          method: req.method,
          errors: errors,
          query: req.query
        });

        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          code: 'QUERY_VALIDATION_ERROR',
          details: errors
        });
      }

      next();
    } catch (error) {
      Logger.error('Query validation middleware error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error during query validation',
        code: 'QUERY_VALIDATION_MIDDLEWARE_ERROR'
      });
    }
  };
};

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  // User creation/update validation
  user: {
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'email' },
    age: { required: false, type: 'number', min: 13, max: 120 }
  },

  // Pagination query parameters
  pagination: {
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 }
  },

  // Search query parameters
  search: {
    q: { required: true, type: 'string', minLength: 1 },
    category: { required: false, type: 'string' }
  }
};
