import { Logger, LogLevel, createLogEntry } from '../src/utils/logger.js';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Logger Utility', () => {
  let consoleLogs = [];
  
  beforeEach(() => {
    consoleLogs = [];
    console.log = jest.fn((message) => consoleLogs.push(message));
    console.error = jest.fn((message) => consoleLogs.push(message));
    console.warn = jest.fn((message) => consoleLogs.push(message));
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('createLogEntry', () => {
    test('should create structured log entry with required fields', () => {
      const entry = createLogEntry(LogLevel.INFO, 'Test message');
      
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level', LogLevel.INFO);
      expect(entry).toHaveProperty('message', 'Test message');
      expect(entry).toHaveProperty('service', 'claude-test-api');
      expect(entry).toHaveProperty('environment');
    });

    test('should include additional metadata', () => {
      const meta = { userId: 123, action: 'login' };
      const entry = createLogEntry(LogLevel.INFO, 'User action', meta);
      
      expect(entry.userId).toBe(123);
      expect(entry.action).toBe('login');
    });
  });

  describe('Logger.info', () => {
    test('should log info message as JSON', () => {
      Logger.info('Test info message');
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogs[0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe(LogLevel.INFO);
      expect(parsed.message).toBe('Test info message');
    });
  });

  describe('Logger.error', () => {
    test('should log error message as JSON', () => {
      Logger.error('Test error message');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogs[0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe(LogLevel.ERROR);
      expect(parsed.message).toBe('Test error message');
    });
  });

  describe('Logger.warn', () => {
    test('should log warning message as JSON', () => {
      Logger.warn('Test warning message');
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogs[0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe(LogLevel.WARN);
      expect(parsed.message).toBe('Test warning message');
    });
  });

  describe('Logger.request', () => {
    test('should log HTTP request information', () => {
      const mockReq = {
        method: 'GET',
        url: '/api/v1/users',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        ip: '127.0.0.1'
      };
      const mockRes = { statusCode: 200 };
      
      Logger.request(mockReq, mockRes, 150);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogs[0];
      const parsed = JSON.parse(loggedMessage);
      
      expect(parsed.level).toBe(LogLevel.INFO);
      expect(parsed.message).toBe('HTTP Request');
      expect(parsed.method).toBe('GET');
      expect(parsed.url).toBe('/api/v1/users');
      expect(parsed.statusCode).toBe(200);
      expect(parsed.duration).toBe('150ms');
    });
  });
});