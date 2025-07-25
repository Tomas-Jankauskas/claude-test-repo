import { 
  addRequestId, 
  requestLogger, 
  parseHeaders, 
  corsHeaders 
} from '../src/middleware/requestMiddleware.js';
import { Logger } from '../src/utils/logger.js';

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}));

// Mock Logger
jest.mock('../src/utils/logger.js', () => ({
  Logger: {
    info: jest.fn(),
    request: jest.fn()
  }
}));

describe('Request Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/test',
      get: jest.fn(),
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' }
    };
    
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('addRequestId', () => {
    test('should add unique request ID to request', () => {
      addRequestId(mockReq, mockRes, mockNext);
      
      expect(mockReq.id).toBe('test-uuid-123');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-uuid-123');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    beforeEach(() => {
      mockReq.id = 'test-request-id';
      mockReq.get.mockImplementation((header) => {
        if (header === 'User-Agent') return 'Mozilla/5.0';
        return null;
      });
    });

    test('should log incoming request', () => {
      requestLogger(mockReq, mockRes, mockNext);
      
      expect(Logger.info).toHaveBeenCalledWith('Incoming request', {
        requestId: 'test-request-id',
        method: 'GET',
        url: '/api/test',
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1'
      });
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should log completed request when response ends', () => {
      const originalEnd = mockRes.end;
      requestLogger(mockReq, mockRes, mockNext);
      
      // Simulate response end
      mockRes.end();
      
      expect(Logger.request).toHaveBeenCalledWith(
        mockReq, 
        mockRes, 
        expect.any(Number)
      );
    });
  });

  describe('parseHeaders', () => {
    beforeEach(() => {
      mockReq.get.mockImplementation((header) => {
        const headers = {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': 'Bearer token123'
        };
        return headers[header];
      });
    });

    test('should parse and add headers to request', () => {
      parseHeaders(mockReq, mockRes, mockNext);
      
      expect(mockReq.parsedHeaders).toEqual({
        contentType: 'application/json',
        userAgent: 'Mozilla/5.0',
        acceptLanguage: 'en-US,en;q=0.9',
        authorization: 'present'
      });
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle missing authorization header', () => {
      mockReq.get.mockImplementation((header) => {
        if (header === 'Authorization') return null;
        return 'some-value';
      });

      parseHeaders(mockReq, mockRes, mockNext);
      
      expect(mockReq.parsedHeaders.authorization).toBe('missing');
    });
  });

  describe('corsHeaders', () => {
    test('should set CORS headers', () => {
      corsHeaders(mockReq, mockRes, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods', 
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers', 
        'Content-Type, Authorization, X-Request-ID'
      );
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle OPTIONS preflight requests', () => {
      mockReq.method = 'OPTIONS';
      
      corsHeaders(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 