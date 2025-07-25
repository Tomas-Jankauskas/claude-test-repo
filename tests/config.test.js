import { Config, Environment, config } from '../src/utils/config.js';

describe('Configuration Utility', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear relevant environment variables
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.LOG_LEVEL;
    delete process.env.API_TIMEOUT;
    delete process.env.RATE_LIMIT_WINDOW;
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.CORS_ORIGIN;
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment constants', () => {
    test('should define all environment types', () => {
      expect(Environment.DEVELOPMENT).toBe('development');
      expect(Environment.PRODUCTION).toBe('production');
      expect(Environment.TEST).toBe('test');
    });
  });

  describe('Config class instantiation', () => {
    test('should create config instance with defaults', () => {
      const testConfig = new Config();
      
      expect(testConfig.get('NODE_ENV')).toBe('development');
      expect(testConfig.get('PORT')).toBe(3000);
      expect(testConfig.get('LOG_LEVEL')).toBe('info');
      expect(testConfig.get('API_TIMEOUT')).toBe(30000);
      expect(testConfig.get('RATE_LIMIT_WINDOW')).toBe(900000);
      expect(testConfig.get('RATE_LIMIT_MAX')).toBe(100);
      expect(testConfig.get('CORS_ORIGIN')).toBe('*');
      expect(testConfig.get('DATABASE_URL')).toBeNull();
      expect(testConfig.get('JWT_SECRET')).toBeNull();
    });

    test('should load values from environment variables', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.LOG_LEVEL = 'debug';
      process.env.API_TIMEOUT = '60000';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb';
      
      const testConfig = new Config();
      
      expect(testConfig.get('NODE_ENV')).toBe('production');
      expect(testConfig.get('PORT')).toBe(8080);
      expect(testConfig.get('LOG_LEVEL')).toBe('debug');
      expect(testConfig.get('API_TIMEOUT')).toBe(60000);
      expect(testConfig.get('DATABASE_URL')).toBe('postgresql://localhost:5432/testdb');
    });
  });

  describe('Configuration validation', () => {
    test('should validate NODE_ENV values', () => {
      process.env.NODE_ENV = 'invalid';
      
      expect(() => new Config()).toThrow('Invalid configuration value for NODE_ENV: invalid');
    });

    test('should validate PORT values', () => {
      process.env.PORT = '0';
      expect(() => new Config()).toThrow('Invalid configuration value for PORT: 0');
      
      process.env.PORT = '99999';
      expect(() => new Config()).toThrow('Invalid configuration value for PORT: 99999');
      
      process.env.PORT = 'not-a-number';
      expect(() => new Config()).toThrow('Invalid configuration value for PORT: NaN');
    });

    test('should validate LOG_LEVEL values', () => {
      process.env.LOG_LEVEL = 'invalid';
      
      expect(() => new Config()).toThrow('Invalid configuration value for LOG_LEVEL: invalid');
    });

    test('should validate numeric values', () => {
      process.env.API_TIMEOUT = '-1000';
      expect(() => new Config()).toThrow('Invalid configuration value for API_TIMEOUT: -1000');
      
      process.env.RATE_LIMIT_WINDOW = '0';
      expect(() => new Config()).toThrow('Invalid configuration value for RATE_LIMIT_WINDOW: 0');
      
      process.env.RATE_LIMIT_MAX = '-5';
      expect(() => new Config()).toThrow('Invalid configuration value for RATE_LIMIT_MAX: -5');
    });
  });

  describe('Configuration getter methods', () => {
    let testConfig;

    beforeEach(() => {
      testConfig = new Config();
    });

    test('should get configuration value by key', () => {
      expect(testConfig.get('PORT')).toBe(3000);
      expect(testConfig.get('NODE_ENV')).toBe('development');
    });

    test('should return fallback for non-existent keys', () => {
      expect(testConfig.get('NON_EXISTENT')).toBeNull();
      expect(testConfig.get('NON_EXISTENT', 'fallback')).toBe('fallback');
    });

    test('should get all configuration values', () => {
      const allConfig = testConfig.getAll();
      
      expect(allConfig).toHaveProperty('NODE_ENV', 'development');
      expect(allConfig).toHaveProperty('PORT', 3000);
      expect(allConfig).toHaveProperty('LOG_LEVEL', 'info');
      expect(typeof allConfig).toBe('object');
    });
  });

  describe('Environment detection methods', () => {
    test('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const testConfig = new Config();
      
      expect(testConfig.isDevelopment()).toBe(true);
      expect(testConfig.isProduction()).toBe(false);
      expect(testConfig.isTest()).toBe(false);
    });

    test('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      const testConfig = new Config();
      
      expect(testConfig.isDevelopment()).toBe(false);
      expect(testConfig.isProduction()).toBe(true);
      expect(testConfig.isTest()).toBe(false);
    });

    test('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      const testConfig = new Config();
      
      expect(testConfig.isDevelopment()).toBe(false);
      expect(testConfig.isProduction()).toBe(false);
      expect(testConfig.isTest()).toBe(true);
    });
  });

  describe('Required configuration validation', () => {
    let testConfig;

    beforeEach(() => {
      testConfig = new Config();
    });

    test('should pass when all required keys are present', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb';
      process.env.JWT_SECRET = 'secret-key';
      testConfig = new Config();
      
      expect(() => {
        testConfig.validateRequired(['DATABASE_URL', 'JWT_SECRET']);
      }).not.toThrow();
    });

    test('should throw when required keys are missing', () => {
      expect(() => {
        testConfig.validateRequired(['DATABASE_URL', 'JWT_SECRET']);
      }).toThrow('Missing required configuration: DATABASE_URL, JWT_SECRET');
    });

    test('should throw when required keys are empty strings', () => {
      process.env.DATABASE_URL = '';
      testConfig = new Config();
      
      expect(() => {
        testConfig.validateRequired(['DATABASE_URL']);
      }).toThrow('Missing required configuration: DATABASE_URL');
    });
  });

  describe('Configuration object getters', () => {
    let testConfig;

    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb';
      process.env.PORT = '4000';
      process.env.CORS_ORIGIN = 'https://example.com';
      process.env.RATE_LIMIT_WINDOW = '600000';
      process.env.RATE_LIMIT_MAX = '50';
      testConfig = new Config();
    });

    test('should get database configuration object', () => {
      const dbConfig = testConfig.getDatabaseConfig();
      
      expect(dbConfig).toEqual({
        url: 'postgresql://localhost:5432/testdb',
        timeout: 30000,
        retryAttempts: 3,
        poolSize: 10
      });
    });

    test('should get server configuration object', () => {
      const serverConfig = testConfig.getServerConfig();
      
      expect(serverConfig).toEqual({
        port: 4000,
        cors: {
          origin: 'https://example.com',
          credentials: true
        },
        rateLimit: {
          windowMs: 600000,
          max: 50
        }
      });
    });

    test('should handle CORS credentials as string', () => {
      process.env.CORS_CREDENTIALS = 'false';
      testConfig = new Config();
      
      const serverConfig = testConfig.getServerConfig();
      expect(serverConfig.cors.credentials).toBe(false);
    });
  });

  describe('Singleton instance', () => {
    test('should export singleton config instance', () => {
      expect(config).toBeInstanceOf(Config);
      expect(typeof config.get).toBe('function');
      expect(typeof config.isDevelopment).toBe('function');
    });
  });

  describe('Type conversion', () => {
    test('should convert string numbers to numbers for numeric defaults', () => {
      process.env.PORT = '5000';
      process.env.API_TIMEOUT = '45000';
      
      const testConfig = new Config();
      
      expect(testConfig.get('PORT')).toBe(5000);
      expect(typeof testConfig.get('PORT')).toBe('number');
      expect(testConfig.get('API_TIMEOUT')).toBe(45000);
      expect(typeof testConfig.get('API_TIMEOUT')).toBe('number');
    });

    test('should keep string values as strings', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'warn';
      process.env.CORS_ORIGIN = 'https://api.example.com';
      
      const testConfig = new Config();
      
      expect(testConfig.get('NODE_ENV')).toBe('production');
      expect(typeof testConfig.get('NODE_ENV')).toBe('string');
      expect(testConfig.get('CORS_ORIGIN')).toBe('https://api.example.com');
      expect(typeof testConfig.get('CORS_ORIGIN')).toBe('string');
    });
  });
}); 