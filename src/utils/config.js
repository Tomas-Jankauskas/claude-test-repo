/**
 * Configuration utility for managing environment variables and application settings
 * Provides centralized configuration management with validation and defaults
 */

/**
 * Environment types enum for configuration validation
 */
export const Environment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

/**
 * Default configuration values
 */
const defaults = {
  NODE_ENV: Environment.DEVELOPMENT,
  PORT: 3000,
  LOG_LEVEL: 'info',
  API_TIMEOUT: 30000,
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  CORS_ORIGIN: '*',
  DATABASE_URL: null,
  JWT_SECRET: null
};

/**
 * Configuration validation rules
 */
const validationRules = {
  NODE_ENV: (value) => Object.values(Environment).includes(value),
  PORT: (value) => Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 65535,
  LOG_LEVEL: (value) => ['error', 'warn', 'info', 'debug'].includes(value),
  API_TIMEOUT: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
  RATE_LIMIT_WINDOW: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
  RATE_LIMIT_MAX: (value) => Number.isInteger(Number(value)) && Number(value) > 0
};

/**
 * Configuration class for managing application settings
 */
class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  /**
   * Load configuration from environment variables with defaults and validation
   */
  loadConfig() {
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const envValue = process.env[key];
      let value = envValue !== undefined ? envValue : defaultValue;

      // Type conversion for numeric values
      if (typeof defaultValue === 'number' && typeof value === 'string') {
        value = Number(value);
      }

      // Validate if validation rule exists
      if (validationRules[key] && !validationRules[key](value)) {
        throw new Error(`Invalid configuration value for ${key}: ${value}`);
      }

      this.config[key] = value;
    }
  }

  /**
   * Get configuration value by key
   * @param {string} key - Configuration key
   * @param {*} fallback - Fallback value if key doesn't exist
   * @returns {*} Configuration value
   */
  get(key, fallback = null) {
    return this.config.hasOwnProperty(key) ? this.config[key] : fallback;
  }

  /**
   * Get all configuration values
   * @returns {Object} Complete configuration object
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if running in development environment
   * @returns {boolean} True if development environment
   */
  isDevelopment() {
    return this.get('NODE_ENV') === Environment.DEVELOPMENT;
  }

  /**
   * Check if running in production environment
   * @returns {boolean} True if production environment
   */
  isProduction() {
    return this.get('NODE_ENV') === Environment.PRODUCTION;
  }

  /**
   * Check if running in test environment
   * @returns {boolean} True if test environment
   */
  isTest() {
    return this.get('NODE_ENV') === Environment.TEST;
  }

  /**
   * Validate that all required configuration values are present
   * @param {string[]} requiredKeys - Array of required configuration keys
   * @throws {Error} If any required key is missing or null
   */
  validateRequired(requiredKeys = []) {
    const missing = requiredKeys.filter(key => {
      const value = this.get(key);
      return value === null || value === undefined || value === '';
    });

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
  }

  /**
   * Get database configuration object
   * @returns {Object} Database configuration
   */
  getDatabaseConfig() {
    return {
      url: this.get('DATABASE_URL'),
      timeout: this.get('API_TIMEOUT'),
      retryAttempts: this.get('DB_RETRY_ATTEMPTS', 3),
      poolSize: this.get('DB_POOL_SIZE', 10)
    };
  }

  /**
   * Get server configuration object
   * @returns {Object} Server configuration
   */
  getServerConfig() {
    return {
      port: this.get('PORT'),
      cors: {
        origin: this.get('CORS_ORIGIN'),
        credentials: this.get('CORS_CREDENTIALS', 'true') === 'true'
      },
      rateLimit: {
        windowMs: this.get('RATE_LIMIT_WINDOW'),
        max: this.get('RATE_LIMIT_MAX')
      }
    };
  }
}

// Export singleton instance
export const config = new Config();

// Export class for testing
export { Config }; 