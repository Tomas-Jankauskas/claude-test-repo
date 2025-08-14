import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  ValidationError,
  ValidationRules,
  validateBody,
  validateQuery,
  CommonSchemas
} from '../src/middleware/validationMiddleware.js';
import { Logger } from '../src/utils/logger.js';

// Mock Logger to avoid console output during tests
jest.mock('../src/utils/logger.js', () => ({
  Logger: {
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('ValidationMiddleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      url: '/test',
      method: 'POST'
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
    });

    it('should create validation error with field and value', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid-email');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid-email');
    });
  });

  describe('ValidationRules', () => {
    describe('email', () => {
      it('should validate correct email formats', () => {
        expect(ValidationRules.email('test@example.com')).toBe(true);
        expect(ValidationRules.email('user.name@domain.co.uk')).toBe(true);
        expect(ValidationRules.email('test+tag@example.org')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(ValidationRules.email('invalid-email')).toBe(false);
        expect(ValidationRules.email('test@')).toBe(false);
        expect(ValidationRules.email('@example.com')).toBe(false);
        expect(ValidationRules.email('test.example.com')).toBe(false);
        expect(ValidationRules.email('')).toBe(false);
        expect(ValidationRules.email(null)).toBe(false);
        expect(ValidationRules.email(123)).toBe(false);
      });
    });

    describe('requiredString', () => {
      it('should validate non-empty strings', () => {
        expect(ValidationRules.requiredString('hello')).toBe(true);
        expect(ValidationRules.requiredString('a')).toBe(true);
        expect(ValidationRules.requiredString('  test  ')).toBe(true);
      });

      it('should validate strings with minimum length', () => {
        expect(ValidationRules.requiredString('hello', 3)).toBe(true);
        expect(ValidationRules.requiredString('hi', 3)).toBe(false);
        expect(ValidationRules.requiredString('test', 4)).toBe(true);
      });

      it('should reject invalid strings', () => {
        expect(ValidationRules.requiredString('')).toBe(false);
        expect(ValidationRules.requiredString('   ')).toBe(false);
        expect(ValidationRules.requiredString(null)).toBe(false);
        expect(ValidationRules.requiredString(undefined)).toBe(false);
        expect(ValidationRules.requiredString(123)).toBe(false);
      });
    });

    describe('numberInRange', () => {
      it('should validate numbers without range', () => {
        expect(ValidationRules.numberInRange(5)).toBe(true);
        expect(ValidationRules.numberInRange('10')).toBe(true);
        expect(ValidationRules.numberInRange(0)).toBe(true);
        expect(ValidationRules.numberInRange(-5)).toBe(true);
      });

      it('should validate numbers with minimum', () => {
        expect(ValidationRules.numberInRange(10, 5)).toBe(true);
        expect(ValidationRules.numberInRange(5, 5)).toBe(true);
        expect(ValidationRules.numberInRange(3, 5)).toBe(false);
      });

      it('should validate numbers with maximum', () => {
        expect(ValidationRules.numberInRange(5, null, 10)).toBe(true);
        expect(ValidationRules.numberInRange(10, null, 10)).toBe(true);
        expect(ValidationRules.numberInRange(15, null, 10)).toBe(false);
      });

      it('should validate numbers with range', () => {
        expect(ValidationRules.numberInRange(7, 5, 10)).toBe(true);
        expect(ValidationRules.numberInRange(5, 5, 10)).toBe(true);
        expect(ValidationRules.numberInRange(10, 5, 10)).toBe(true);
        expect(ValidationRules.numberInRange(3, 5, 10)).toBe(false);
        expect(ValidationRules.numberInRange(15, 5, 10)).toBe(false);
      });

      it('should reject non-numeric values', () => {
        expect(ValidationRules.numberInRange('abc')).toBe(false);
        expect(ValidationRules.numberInRange(null)).toBe(false);
        expect(ValidationRules.numberInRange(undefined)).toBe(false);
        expect(ValidationRules.numberInRange({})).toBe(false);
      });
    });

    describe('arrayMinLength', () => {
      it('should validate arrays with minimum length', () => {
        expect(ValidationRules.arrayMinLength([1, 2, 3])).toBe(true);
        expect(ValidationRules.arrayMinLength(['a'])).toBe(true);
        expect(ValidationRules.arrayMinLength([1, 2], 2)).toBe(true);
        expect(ValidationRules.arrayMinLength([1], 2)).toBe(false);
      });

      it('should reject non-arrays', () => {
        expect(ValidationRules.arrayMinLength('string')).toBe(false);
        expect(ValidationRules.arrayMinLength(null)).toBe(false);
        expect(ValidationRules.arrayMinLength({})).toBe(false);
        expect(ValidationRules.arrayMinLength(123)).toBe(false);
      });

      it('should reject empty arrays when minimum length is required', () => {
        expect(ValidationRules.arrayMinLength([])).toBe(false);
        expect(ValidationRules.arrayMinLength([], 1)).toBe(false);
      });
    });
  });

  describe('validateBody middleware', () => {
    it('should pass validation with valid data', () => {
      const schema = {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'email' }
      };

      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required fields', () => {
      const schema = {
        name: { required: true, type: 'string' },
        email: { required: true, type: 'email' }
      };

      mockReq.body = {
        name: 'John Doe'
        // email is missing
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'email is required'
            })
          ])
        })
      );
    });

    it('should fail validation with invalid email format', () => {
      const schema = {
        email: { required: true, type: 'email' }
      };

      mockReq.body = {
        email: 'invalid-email-format'
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'email must be a valid email address'
            })
          ])
        })
      );
    });

    it('should fail validation with string too short', () => {
      const schema = {
        name: { required: true, type: 'string', minLength: 5 }
      };

      mockReq.body = {
        name: 'Jo'
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: 'name must be a string with at least 5 characters'
            })
          ])
        })
      );
    });

    it('should fail validation with number out of range', () => {
      const schema = {
        age: { required: true, type: 'number', min: 18, max: 65 }
      };

      mockReq.body = {
        age: 16
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
              message: 'age must be a valid number between 18 and 65'
            })
          ])
        })
      );
    });

    it('should skip validation for optional missing fields', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: false, type: 'number' }
      };

      mockReq.body = {
        name: 'John Doe'
        // age is optional and missing
      };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle middleware errors gracefully', () => {
      const schema = {
        name: { required: true, type: 'string' }
      };

      // Create a malformed request that will cause an error
      mockReq.body = null;

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('validateQuery middleware', () => {
    it('should pass validation with valid query parameters', () => {
      const schema = {
        page: { required: false, type: 'number', min: 1 },
        limit: { required: false, type: 'number', min: 1, max: 100 }
      };

      mockReq.query = {
        page: '2',
        limit: '10'
      };

      const middleware = validateQuery(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fail validation with required query parameter missing', () => {
      const schema = {
        q: { required: true, type: 'string' }
      };

      mockReq.query = {};

      const middleware = validateQuery(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Query validation failed',
          code: 'QUERY_VALIDATION_ERROR'
        })
      );
    });

    it('should handle query validation errors gracefully', () => {
      const schema = {
        page: { required: false, type: 'number' }
      };

      // Simulate an error by making query null
      mockReq.query = null;

      const middleware = validateQuery(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('CommonSchemas', () => {
    it('should have user schema with correct structure', () => {
      expect(CommonSchemas.user).toEqual({
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'email' },
        age: { required: false, type: 'number', min: 13, max: 120 }
      });
    });

    it('should have pagination schema with correct structure', () => {
      expect(CommonSchemas.pagination).toEqual({
        page: { required: false, type: 'number', min: 1 },
        limit: { required: false, type: 'number', min: 1, max: 100 }
      });
    });

    it('should have search schema with correct structure', () => {
      expect(CommonSchemas.search).toEqual({
        q: { required: true, type: 'string', minLength: 1 },
        category: { required: false, type: 'string' }
      });
    });
  });
});
